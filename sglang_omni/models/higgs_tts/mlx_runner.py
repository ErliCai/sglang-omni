# SPDX-License-Identifier: Apache-2.0
"""MLX language forwards with Torch Higgs embeddings, sampler and codec."""
from __future__ import annotations

from pathlib import Path

import torch

from sglang_omni.models.higgs_tts.hf_config import HiggsMultimodalQwen3Config
from sglang_omni.models.higgs_tts.torch_mps_runner import HiggsTorchMpsModelRunner


def load_mlx_language_model(checkpoint: str, *, dtype=None):
    import mlx.core as mx
    from mlx_lm.models.qwen3 import ModelArgs, Qwen3Model

    config = HiggsMultimodalQwen3Config.from_pretrained(checkpoint).get_text_config()
    rope = config.rope_parameters
    if rope.get("rope_type", "default") != "default":
        raise ValueError("Higgs MLX currently requires default RoPE")
    args = ModelArgs(
        model_type="qwen3",
        hidden_size=config.hidden_size,
        num_hidden_layers=config.num_hidden_layers,
        intermediate_size=config.intermediate_size,
        num_attention_heads=config.num_attention_heads,
        rms_norm_eps=config.rms_norm_eps,
        vocab_size=config.vocab_size,
        num_key_value_heads=config.num_key_value_heads,
        max_position_embeddings=config.max_position_embeddings,
        rope_theta=rope["rope_theta"],
        head_dim=config.head_dim,
        tie_word_embeddings=config.tie_word_embeddings,
    )
    model = Qwen3Model(args)
    prefixes = {
        "tied.embedding.text_embedding.": "embed_tokens.",
        "body.layers.": "layers.",
        "body.norm.": "norm.",
    }
    weights = {}
    for path in sorted(Path(checkpoint).glob("*.safetensors")):
        for key, value in mx.load(str(path)).items():
            for prefix, target in prefixes.items():
                if key.startswith(prefix):
                    name = target + key[len(prefix) :]
                    if name in weights:
                        raise ValueError(f"Duplicate Higgs language weight: {name}")
                    weights[name] = value.astype(dtype or mx.bfloat16)
                    break
    model.load_weights(list(weights.items()), strict=True)
    model.eval()
    mx.eval(model.parameters())
    return model


class HiggsMlxModelRunner(HiggsTorchMpsModelRunner):
    """Single active request; native MLX transformer and per-request KV cache."""

    def __init__(self, tp_worker, output_processor):
        super().__init__(tp_worker, output_processor)
        owner = getattr(tp_worker, "_mlx_runner", None)
        if owner is not None:
            self._past_key_values = owner.request_caches

    def _build_forward_batch(self, scheduler_output):
        from types import SimpleNamespace

        from sglang_omni.model_runner.base import resolve_deferred_prefill_inputs

        batch = scheduler_output.batch_data
        if batch is None:
            return None
        resolve_deferred_prefill_inputs(batch, torch.device("mps"))
        view = SimpleNamespace(
            input_ids=batch.input_ids.to("mps"),
            batch_size=len(batch.reqs),
            sampling_info=batch.sampling_info,
            forward_mode=batch.forward_mode,
            replace_embeds=None,
        )
        return view, batch, bool(batch.forward_mode.is_extend())

    def _forward(self, request_id, embeddings, *, prefill):
        import mlx.core as mx
        from mlx_lm.models.cache import KVCache
        from sglang.srt.utils.tensor_bridge import mlx_to_torch, torch_to_mlx

        if prefill:
            self._past_key_values.pop(request_id, None)
            cache = [KVCache() for _ in self.model.mlx_language_model.layers]
        else:
            if request_id not in self._past_key_values:
                raise RuntimeError(f"Higgs MLX decode has no KV cache for {request_id}")
            cache = self._past_key_values[request_id]
        try:
            inputs = torch_to_mlx(embeddings.unsqueeze(0))
            hidden = self.model.mlx_language_model(
                None, cache=cache, input_embeddings=inputs
            )[:, -1, :]
            mx.eval(hidden, [c.state for c in cache])
            result = mlx_to_torch(hidden, device=embeddings.device)
        except Exception:
            self.reset_request(request_id)
            raise
        self._past_key_values[request_id] = cache
        return result


def make_higgs_mlx_runner_class():
    """Factory for Omni's public MLX worker registry."""
    return HiggsMlxWorkerModel


class HiggsMlxWorkerModel:
    """Native model owner; the Higgs scheduler runner owns generation hooks."""

    def __init__(
        self,
        *,
        model_path,
        pool_size=4096,
        quantization=None,
        enable_sampling=False,
        revision=None,
        disable_radix_cache=True,
        **kwargs,
    ):
        from safetensors import safe_open

        from sglang_omni.models.higgs_tts.model import HiggsTTSModel
        from sglang_omni.models.higgs_tts.weight_loader import DiscreteWeightMapper

        if not disable_radix_cache:
            raise ValueError("Higgs MLX requires disabled radix cache")
        if quantization is not None or enable_sampling:
            raise ValueError(
                "Higgs MLX requires unquantized weights and its own sampler"
            )
        if not Path(model_path).is_dir():
            from huggingface_hub import snapshot_download

            model_path = snapshot_download(model_path, revision=revision)
        self.request_caches = {}
        self.pool_size = pool_size
        config = HiggsMultimodalQwen3Config.from_pretrained(model_path)
        text_config = config.get_text_config()
        with torch.device("mps"):
            backbone = torch.nn.Module()
            backbone.config = text_config
            backbone.model = torch.nn.Module()
            backbone.model.embed_tokens = torch.nn.Embedding(
                text_config.vocab_size, text_config.hidden_size, dtype=torch.bfloat16
            )
            model = HiggsTTSModel(config, backbone=backbone)
        mapper = DiscreteWeightMapper(
            text_prefix_map={
                "tied.embedding.text_embedding.": "backbone.model.embed_tokens."
            },
            tie_modality=model._tie_modality,
        )
        state = {}
        expected = set(dict(model.named_parameters(remove_duplicate=False)))
        for path in sorted(Path(model_path).glob("*.safetensors")):
            with safe_open(path, framework="pt", device="cpu") as weights:
                for key in weights.keys():
                    name = mapper.map(key)
                    if name in expected:
                        if name in state:
                            raise ValueError(f"Duplicate Higgs weight: {name}")
                        state[name] = weights.get_tensor(key)
        if model._tie_modality:
            state["modality_head.weight"] = state[
                "multimodal_embedding.modality_embedding_0.weight"
            ]
        # Persistent sampler buffers are initialized, never loaded from checkpoint.
        missing = expected - state.keys()
        if missing:
            raise ValueError(
                f"Missing Higgs audio/embedding weights: {sorted(missing)}"
            )
        with torch.no_grad():
            for name, param in model.named_parameters(remove_duplicate=False):
                if param.shape != state[name].shape:
                    raise ValueError(f"Higgs weight shape mismatch: {name}")
                param.copy_(state[name])
        model.mlx_language_model = load_mlx_language_model(model_path)
        self.scheduler_model = model.eval()

    def has_request(self, request_id):
        return request_id in self.request_caches

    def remove_request(self, request_id):
        self.request_caches.pop(request_id, None)
        self.scheduler_model.reset_request(request_id)

    def store_auxiliary_state_for_request(self, request_id):
        # Prefix/radix reuse is disabled; nothing may survive request completion.
        pass
