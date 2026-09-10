# SPDX-License-Identifier: Apache-2.0
"""MPS configuration boundaries, without loading model weights."""

from types import SimpleNamespace

import pytest
from sglang.srt.model_executor.cuda_graph_config import CudaGraphConfig

from sglang_omni.config.schema import EngineArgs
from sglang_omni.models.higgs_tts.engine_builder import HiggsTtsEngineBuilder
from sglang_omni.scheduling.generation_batch_policy import (
    build_generation_batch_overrides,
)


def builder(device="mps"):
    result = HiggsTtsEngineBuilder(
        max_new_tokens=2048,
        max_running_requests=64,
        cuda_graph_max_bs=64,
        enable_async_decode=True,
        async_decode_min_batch_size=2,
        prefill_coalesce_requests=4,
    )
    result.device = device
    return result


def merged(instance, overrides=None):
    return build_generation_batch_overrides(
        **instance.generation_defaults(dtype="bfloat16"),
        server_args_overrides=overrides,
    )


def test_mps_profile_and_scheduler(monkeypatch):
    monkeypatch.delenv("SGLANG_USE_MLX", raising=False)
    instance = builder("mps:0")
    options = merged(instance)
    instance.adjust_overrides(options)
    assert options["max_running_requests"] == 1
    assert options["disable_cuda_graph"] is True
    assert options["cuda_graph_backend_prefill"] == "disabled"
    assert options["disable_radix_cache"] is True
    assert options["chunked_prefill_size"] == -1
    assert options["max_prefill_tokens"] >= instance.context_length
    assert options["attention_backend"] == "torch_native"
    assert instance.extra_scheduler_kwargs()["enable_async_decode"] is False
    assert instance.extra_scheduler_kwargs()["prefill_coalesce_requests"] == 0


@pytest.mark.parametrize(
    "override",
    [
        {"max_running_requests": 2},
        {"disable_cuda_graph": False},
        {"enable_torch_compile": True},
        {"disable_overlap_schedule": False},
        {"disable_radix_cache": False},
        {"chunked_prefill_size": 512},
        {"attention_backend": "triton"},
        {"prefill_attention_backend": "triton"},
        {"decode_attention_backend": "triton"},
        {"sampling_backend": "flashinfer"},
        {"max_prefill_tokens": 512},
        {"cuda_graph_backend_prefill": "breakable"},
        {"cuda_graph_backend_decode": "full"},
        {"cuda_graph_config": {"decode": {"backend": "full"}}},
        {"cuda_graph_config": {"prefill": {"backend": "breakable"}}},
        {
            "cuda_graph_config": CudaGraphConfig.from_dict(
                {"prefill": {"backend": "breakable"}}
            )
        },
    ],
)
def test_mps_rejects_unsafe_engine_overrides(monkeypatch, override):
    monkeypatch.delenv("SGLANG_USE_MLX", raising=False)
    instance = builder()
    # Exercise the typed pipeline block and the real merge used by build().
    typed = EngineArgs(**override)
    options = typed.overrides()
    with pytest.raises(ValueError, match="Higgs Torch MPS"):
        instance.adjust_overrides(merged(instance, options))


@pytest.mark.parametrize("phase", ["decode", "prefill"])
def test_resolved_graph_config_cannot_bypass_disable_flag(phase):
    instance = builder()
    graph = CudaGraphConfig.from_dict(
        {
            "decode": {"backend": "disabled"},
            "prefill": {"backend": "disabled"},
        }
    )
    args = SimpleNamespace(**instance._mps_requirements(), cuda_graph_config=graph)
    instance.validate_before_infrastructure(args)
    getattr(graph, phase).backend = "full"
    with pytest.raises(ValueError, match=f"disabled {phase} CUDA graphs"):
        instance.validate_before_infrastructure(args)


def test_mlx_uses_public_runtime(monkeypatch):
    from sglang.srt.utils import tensor_bridge

    # use_mlx() caches the process-start decision.
    monkeypatch.setattr(tensor_bridge, "use_mlx", lambda: True)
    instance = builder()
    instance.pre_infra_setup("unused")
    assert instance.model_arch_override == "HiggsTTSModel"
    assert instance.generation_defaults(dtype="bfloat16")["max_running_requests"] == 1


@pytest.mark.parametrize("device", ["cuda:0", "npu:0", "cpu"])
def test_other_devices_keep_existing_policy(device):
    instance = builder(device)
    options = merged(instance)
    instance.adjust_overrides(options)
    assert options["max_running_requests"] == 64
    assert options["cuda_graph_backend_prefill"] == "breakable"
    assert instance.extra_scheduler_kwargs()["enable_async_decode"] is True
    assert instance.extra_scheduler_kwargs()["prefill_coalesce_requests"] == 4


def test_build_resolves_mps_profile_before_loading_weights(monkeypatch, tmp_path):
    from sglang_omni.config.runtime import resolve_stage_typed_kwargs
    from sglang_omni.models.higgs_tts.config import HiggsTtsPipelineConfig
    from sglang_omni.models.higgs_tts.hf_config import HiggsMultimodalQwen3Config
    from sglang_omni.scheduling import bootstrap

    config = HiggsMultimodalQwen3Config(
        architectures=["HiggsMultimodalQwen3ForConditionalGeneration"],
        text_config={
            "num_hidden_layers": 1,
            "hidden_size": 64,
            "intermediate_size": 128,
            "num_attention_heads": 4,
            "num_key_value_heads": 2,
            "head_dim": 16,
        },
    )
    config.save_pretrained(tmp_path)
    pipeline = HiggsTtsPipelineConfig(model_path=str(tmp_path))
    kwargs = resolve_stage_typed_kwargs(pipeline.stage_named("tts_engine"))
    instance = builder()

    class ReachedInfrastructure(Exception):
        pass

    def stop(server_args, *args, **kwargs):
        assert server_args.device == "mps"
        assert server_args.max_running_requests == 1
        assert server_args.disable_radix_cache
        assert not server_args.enable_torch_compile
        assert server_args.chunked_prefill_size == -1
        assert server_args.cuda_graph_config.decode.backend == "disabled"
        assert server_args.cuda_graph_config.prefill.backend == "disabled"
        raise ReachedInfrastructure

    monkeypatch.setattr(
        bootstrap, "create_sglang_infrastructure_defer_cuda_graph", stop
    )
    with pytest.raises(ReachedInfrastructure):
        instance.build(
            str(tmp_path),
            device="mps",
            server_args_overrides=kwargs.get("server_args_overrides"),
        )


def test_mlx_requires_mps(monkeypatch):
    from sglang.srt.utils import tensor_bridge

    monkeypatch.setattr(tensor_bridge, "use_mlx", lambda: True)
    with pytest.raises(ValueError, match="requires an MPS stage"):
        builder("cuda:0").generation_defaults(dtype="bfloat16")


def test_native_mlx_sampling_is_rejected(monkeypatch):
    from sglang.srt.utils import tensor_bridge

    monkeypatch.setattr(tensor_bridge, "use_mlx", lambda: True)
    with pytest.raises(ValueError, match="own sampler"):
        builder().adjust_overrides({"mlx_enable_sampling": True})
