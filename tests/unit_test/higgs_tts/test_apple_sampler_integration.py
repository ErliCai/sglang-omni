# SPDX-License-Identifier: Apache-2.0
"""Real Higgs sampler dispatch on Metal; needs the full serving environment."""

import builtins
import os

import pytest
import torch


@pytest.fixture
def sampler():
    if not torch.backends.mps.is_available():
        if os.environ.get("HIGGS_REQUIRE_MPS") == "1":
            pytest.fail("HIGGS_REQUIRE_MPS=1 but Metal is unavailable")
        pytest.skip("requires Apple Metal")
    from sglang_omni.models.higgs_tts import sampler

    return sampler


def test_mps_seeded_dispatch_does_not_import_upstream_kernel(sampler, monkeypatch):
    original_import = builtins.__import__

    def guarded_import(name, *args, **kwargs):
        if name == "sglang.srt.layers.sampler" or name.split(".")[0] == "triton":
            pytest.fail(f"MPS sampling imported accelerator kernel: {name}")
        return original_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", guarded_import)
    logits = torch.randn(1, 8, 1026, device="mps")
    kwargs = dict(
        temperature=torch.ones(1, device="mps"),
        top_p=torch.tensor([0.9], device="mps"),
        top_k_buf=torch.tensor([32], device="mps"),
        seeds_B=torch.tensor([42], device="mps"),
        step_B=torch.tensor([8], device="mps"),
    )
    first = sampler._sample_independent_batched(logits, **kwargs)
    second = sampler._sample_independent_batched(logits, **kwargs)
    assert torch.equal(first, second)
    assert first.device.type == "mps" and first.shape == (1, 8)
    top_indices = logits.topk(32, dim=-1).indices
    assert (top_indices == first.unsqueeze(-1)).any(dim=-1).all().item()


def test_mps_greedy_and_unseeded_rows(sampler):
    logits = torch.randn(2, 8, 1026, device="mps")
    codes = sampler._sample_independent_batched(
        logits,
        temperature=torch.tensor([0.0, 1.0], device="mps"),
        top_p=torch.ones(2, device="mps"),
        seeds_B=torch.tensor([42, sampler.NO_SEED], device="mps"),
        step_B=torch.zeros(2, dtype=torch.long, device="mps"),
    )
    assert torch.equal(codes[0], logits[0].argmax(dim=-1))
    assert ((codes[1] >= 0) & (codes[1] < 1026)).all().item()


def test_mps_delay_and_row_reuse(sampler):
    state = sampler.HiggsBatchedSamplerState(1, 8, device="mps")
    logits = torch.zeros(1, 8, 1026, device="mps")
    logits[:, :, 13] = 10
    row = torch.tensor([0], device="mps")

    def draw():
        return sampler.batched_step(
            logits, state, row, temperature=torch.zeros(1, device="mps")
        )

    first = draw()
    assert first.cpu().tolist() == [[13] + [sampler.BOC_ID] * 7]
    assert state.step_count.item() == 1
    state.reset_row(0)
    assert state.seeds.item() == sampler.NO_SEED
    assert torch.equal(first, draw())
