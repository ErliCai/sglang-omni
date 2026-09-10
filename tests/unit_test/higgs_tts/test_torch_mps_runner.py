# SPDX-License-Identifier: Apache-2.0
"""Tiny real Qwen3 forwards and strict Higgs weight mapping; no downloads."""

from types import SimpleNamespace

import pytest
import torch
from safetensors.torch import save_file
from transformers import Qwen3ForCausalLM

from sglang_omni.models.higgs_tts.hf_config import HiggsMultimodalQwen3Config
from sglang_omni.models.higgs_tts.torch_mps_runner import (
    HiggsTorchMpsModelRunner,
    load_torch_language_model,
)


@pytest.fixture
def checkpoint(tmp_path):
    config = HiggsMultimodalQwen3Config(
        audio_encoder_config=dict(num_codebooks=8, vocab_size=1026, out_dim=32),
        text_config=dict(
            hidden_size=32,
            intermediate_size=64,
            num_hidden_layers=1,
            num_attention_heads=2,
            num_key_value_heads=1,
            head_dim=16,
            vocab_size=64,
            tie_word_embeddings=True,
        ),
    )
    config.save_pretrained(tmp_path)
    torch.manual_seed(7)
    source = Qwen3ForCausalLM(config.get_text_config()).eval()
    state = {}
    for name, value in source.state_dict().items():
        for source_prefix, target_prefix in (
            ("model.embed_tokens.", "tied.embedding.text_embedding."),
            ("model.layers.", "body.layers."),
            ("model.norm.", "body.norm."),
        ):
            if name.startswith(source_prefix):
                state[target_prefix + name[len(source_prefix) :]] = value.clone()
    save_file(state, str(tmp_path / "model.safetensors"))
    return tmp_path, config, source, state


def test_language_checkpoint_mapping_and_missing_weight(checkpoint):
    path, _, source, state = checkpoint
    loaded = load_torch_language_model(str(path), device="cpu", dtype=torch.float32)
    for name, value in source.state_dict().items():
        torch.testing.assert_close(loaded.state_dict()[name], value)
    assert loaded.lm_head.weight is loaded.model.embed_tokens.weight
    bf16 = load_torch_language_model(str(path), device="cpu", dtype=torch.bfloat16)
    assert bf16.model.rotary_emb.inv_freq.dtype == torch.float32
    torch.testing.assert_close(
        bf16.model.rotary_emb.inv_freq, source.model.rotary_emb.inv_freq
    )
    state.pop("body.layers.0.self_attn.q_proj.weight")
    save_file(state, str(path / "model.safetensors"))
    with pytest.raises(RuntimeError, match="Missing key"):
        load_torch_language_model(str(path), device="cpu", dtype=torch.float32)


@pytest.fixture
def runner(checkpoint, monkeypatch):
    import os

    from sglang_omni.models.higgs_tts import model as model_mod

    if not torch.backends.mps.is_available():
        if os.environ.get("HIGGS_REQUIRE_MPS") == "1":
            pytest.fail("HIGGS_REQUIRE_MPS=1 but Metal is unavailable")
        pytest.skip("requires Apple Metal")
    path, config, _, _ = checkpoint
    # Use real Higgs buffers/embedding/sampler, avoiding distributed SGLang init.
    monkeypatch.setattr(model_mod, "_resolve_max_running_requests", lambda: 1)
    monkeypatch.setattr(
        model_mod, "Qwen3ForCausalLM", lambda c, **kw: Qwen3ForCausalLM(c)
    )
    with torch.device("mps"):
        model = model_mod.HiggsTTSModel(config)
    model.backbone = load_torch_language_model(
        str(path), device="mps", dtype=torch.float32
    )
    torch.nn.init.normal_(model.get_multimodal_embedding().weight, std=0.02)
    worker = SimpleNamespace(gpu_id=0, model_runner=SimpleNamespace(model=model))
    return HiggsTorchMpsModelRunner(worker, None)


@torch.inference_mode()
def test_cached_decode_matches_full_forward_and_cleanup(runner):
    embeddings = runner.model.backbone.model.embed_tokens(
        torch.tensor([1, 2, 3], device="mps")
    )
    expected = runner.model.backbone.model(
        inputs_embeds=embeddings.unsqueeze(0)
    ).last_hidden_state[:, -1]
    runner._forward("one", embeddings[:2], prefill=True)
    actual = runner._forward("one", embeddings[2:], prefill=False)
    torch.testing.assert_close(actual, expected, atol=1e-4, rtol=1e-4)
    runner.model.acquire_row("one")
    runner.reset_request("one")
    assert not runner._past_key_values
    assert not runner.model._rid_to_row
    with pytest.raises(RuntimeError, match="no KV cache"):
        runner._forward("one", embeddings[2:], prefill=False)
    # Request ID reuse starts from a fresh cache.
    actual = runner._forward("one", embeddings, prefill=True)
    torch.testing.assert_close(actual, expected, atol=1e-4, rtol=1e-4)


@torch.inference_mode()
def test_reference_prefill_and_audio_decode_use_real_higgs_sampler(runner):
    from sglang_omni.model_runner.prefill_inputs import get_omni_prefill_inputs

    req = SimpleNamespace(
        extend_range=SimpleNamespace(start=0, length=3),
        inflight_middle_chunks=0,
        origin_input_ids=[1, -100, 2],
        sampling_params=SimpleNamespace(
            sampling_seed=42, temperature=0.0, top_p=1.0, top_k=1
        ),
    )
    request = SimpleNamespace(
        request_id="ref",
        data=SimpleNamespace(req=req, reference_codes_delayed=[[1] * 8]),
    )
    batch = SimpleNamespace(
        input_ids=torch.tensor([1, -100, 2], device="mps"),
        batch_size=1,
        replace_embeds=None,
        sampling_info=SimpleNamespace(
            temperatures=torch.tensor([0.0]),
            top_ps=torch.tensor([1.0]),
            top_ks=torch.tensor([1]),
        ),
    )
    runner.before_prefill(batch, None, [request])
    embedded = get_omni_prefill_inputs(batch).input_embeds
    expected = runner.model.get_multimodal_embedding()(
        torch.ones((1, 8), dtype=torch.long, device="mps")
    )
    torch.testing.assert_close(embedded[1], expected[0])
    result = runner.custom_prefill_forward(batch, None, [request])
    assert torch.isfinite(result.logits_output.hidden_states).all()
    codes = runner.model.get_output_codes("ref")
    assert codes.shape == (1, 8)
    batch.input_ids = codes[-1, :1]
    runner.before_decode(batch, None, [request])
    result = runner.custom_decode_forward(batch, None, [request])
    assert torch.isfinite(result.logits_output.hidden_states).all()
    assert runner._past_key_values["ref"].get_seq_length() == 4
    runner.reset_request("ref")


def test_rejects_multiple_requests_before_forward(runner):
    with pytest.raises(ValueError, match="exactly one"):
        runner.custom_prefill_forward(None, None, [object(), object()])


def test_forward_exception_releases_cache_and_sampler(runner, monkeypatch):
    runner._past_key_values["failed"] = object()
    runner.model.acquire_row("failed")

    def fail(**kwargs):
        raise RuntimeError("synthetic forward failure")

    monkeypatch.setattr(runner.model.backbone.model, "forward", fail)
    with pytest.raises(RuntimeError, match="synthetic forward failure"):
        runner._forward("failed", torch.zeros(1, 32, device="mps"), prefill=True)
    assert not runner._past_key_values
    assert not runner.model._rid_to_row
