# Higgs Audio v3 TTS: Apple Silicon work log

> 2026-09-10 审查前两项已修复：采用公共 MLX registry/worker 与 SGLANG_USE_MLX=1，移除独立 language_backend；直接加载 MLX 语言层，复用 Torch 音频模块，补齐请求释放接口。种子不一致使 HTTP 探测失败。190 项回归通过（7.20 秒，0 跳过），包含 Qwen3-ASR 公共接口回归；实际 MLX 默认语音与克隆输出均与旧版已试听 WAV 逐字节一致。以下为历史记录，最新命令见 HTML 顶部。


> 2026-09-10 MLX 更新：已实现原生 MLX Qwen3 语言模型 + 请求 KV 缓存，复用 Torch Higgs 采样与 codec；通过 `--tts_engine.factory.language_backend mlx` 选择（全局 SGLANG_USE_MLX 必须不设置）。139 项回归通过，0 跳过，7.34 秒。真实 HTTP 默认声音两次同种子输出一致，3.8 秒音频，耗时 6.25 / 3.95 秒；克隆 5.72 秒，耗时 6.93 秒；两种场景本地转写 WER 0%。MLX 默认语音与克隆语音已由用户试听确认满意；流式、长文本、持续负载按用户要求暂缓。完整命令见 higgs-apple-silicon.html 顶部。


> 2026-09-10 最新状态：MPS 运行器与真实 4B 权重 HTTP 非流式 E2E 已通过；131 项回归通过（16.71 秒，16 条上游警告，0 跳过）。两次生成均为 3.4 秒 / 24 kHz WAV，相同种子逐样本一致，HTTP 耗时 7.84 / 4.25 秒；空文本 400。本地 Whisper 转写规范化 WER 0%。人工听感、克隆、流式及持续负载待验证。以下旧条目为历史快照。完整 HTML 记录及自测命令：[自测指南](../../notes/higgs-mps-testing.html)。


## Status — 2026-09-09

Branch: `feat/higgs-tts-apple-silicon`, based on `c10629ba`.
Initial milestone: MPS-compatible seeded sampling. **This branch does not yet
provide a working Apple Higgs server or a native MLX implementation.**
Apple M1 Pro and M1 Max validation passes all 18 sampler tests without skips
or warnings. A conservative MPS engine configuration is now implemented;
no checkpoint or end-to-end speech generation has been validated.

## Ownership and prior-work audit

Searched open and closed issues and PRs in `sgl-project/sglang-omni`, including
Higgs titles, bodies and targeted comment searches, with `Higgs`,
`higgs-audio-v3-tts`, and `boson` combined with Apple, MLX, MPS, macOS and Metal.
The all-state Higgs-title PR query returned 78 results (below the 100-result
limit); no Apple inference implementation was identified. MPS matches also
include NVIDIA Multi-Process Service, which is unrelated to Apple Metal.
Search results cannot establish whether someone has unpublished private work.

- [Roadmap #1967](https://github.com/sgl-project/sglang-omni/issues/1967)
  lists Higgs as Planned, without an assignee or implementation PR.
- BruceLoveDecimal [volunteered for Higgs](https://github.com/sgl-project/sglang-omni/issues/1967#issuecomment-5568359766),
  but the maintainer redirected them to Nemotron ASR and they
  [accepted that assignment](https://github.com/sgl-project/sglang-omni/issues/1967#issuecomment-5569371507).
- [PR #1993](https://github.com/sgl-project/sglang-omni/pull/1993), by Sheehan20,
  is open and fixes CUDA-only sampler imports for macOS test collection.
  It does not implement Higgs Apple inference.
- [PR #1992](https://github.com/sgl-project/sglang-omni/pull/1992) documents
  Apple support; it does not supply the missing Higgs runtime.
- [PR #1721](https://github.com/sgl-project/sglang-omni/pull/1721) is merged.
  Its NPU work already supplies device-aware stages, eager codec behavior and
  pure-Torch top-k/top-p renormalization in this checkout. Reuse these changes.
- [PR #1706](https://github.com/sgl-project/sglang-omni/pull/1706) targets XPU;
  [PR #2026](https://github.com/sgl-project/sglang-omni/pull/2026) targets MUSA.
  Neither is an Apple implementation.
- General Higgs support already exists from
  [PR #428](https://github.com/sgl-project/sglang-omni/pull/428). This branch is
  specifically the Apple roadmap task, not a new model-family integration.

No GitHub claim/comment or PR has been posted by this work.

## Implemented

- `apple_sampling.py`: CPU implementation of the pinned SGLang 0.5.18
  MurmurHash/Gumbel seeded draw. Copy filtered log probabilities, seeds and
  positions to CPU, perform integer hashing and float64 noise there, and return
  only selected token IDs to the original device. MPS cannot perform the upstream
  Triton hash or float64 noise calculation.
- `sampler.py`: dispatch MPS seeded draws to this helper; lazily import the
  existing SGLang sampler for all other devices. Existing renormalization and
  delay/EOC state transitions are reused.
- Portable numerical tests: independent MurmurHash vectors, seed/position
  sensitivity, batch independence, probability distribution, masked-token hash
  endpoints, output placement, shape errors, and CPU/MPS agreement given identical
  logits. No model downloads or full serving installation needed.
- Hardware integration tests: real batched sampler dispatch, top-k filtering,
  seeded/unseeded and greedy rows, delay masks and row reuse on MPS.
- Mac validation fix: transfer logits with `.detach().cpu()` before converting
  to float64. The combined device/dtype conversion caused MPS errors and incorrect
  sampling results; separating the operations resolves all five failing MPS cases.

This explicit CPU boundary adds synchronization and transfer costs. It is an
initial correctness path, not a performance result. Matching the hash algorithm
does not establish identical speech across backends whose model logits differ.
CUDA regression testing is still required for the changed import/dispatch path.

## Remaining implementation

1. Completed configuration milestone: the resolved MPS device selects one active
   request, eager execution, synchronous scheduling, whole-prompt prefill and
   disabled radix caching. Unsafe typed engine overrides and resolved CUDA graph
   backends are rejected before infrastructure creation. This is configuration
   coverage, not proof that the model runner can execute on MPS.
2. Audit/install the MPS language-model runner, multimodal embedding overlay,
   model loading, normalization/attention and request cleanup. Reuse the existing
   Qwen3-ASR Apple integration contracts where applicable.
3. Validate the official Higgs checkpoint and audio tokenizer on MPS, including
   reference encoding, float32/bfloat16 behavior, codec convolution support and
   stage-to-stage tensor transport. Record the exact checkpoint revisions.
4. Complete HTTP non-streaming speech, then reference voice cloning and streaming;
   test empty/invalid requests, interruption, request reuse and memory stability.
5. Add native MLX model/runner support separately, preserving the same prompt,
   delayed codebook, stop and seed semantics. No MLX support is claimed today.
6. Qualify accuracy and performance on real hardware before updating support
   claims or submitting an implementation PR.

## Tests to run on Apple Silicon now

The branch is available from `origin` (the ErliCai fork). The CPU conversion fix
is included in `fdac5c37`; the engine-profile work described here is a local change.
Use a native arm64 Python, not an x86_64 interpreter under Rosetta. Full-package
testing requires Python 3.10–3.12; the Apple installer uses Python 3.12.

### A. Standalone numeric and Metal tests (no model download)

From the repository root, use a small isolated environment:

```bash
python3.12 -m venv /tmp/higgs-apple-sampling-venv
source /tmp/higgs-apple-sampling-venv/bin/activate
python -m pip install torch==2.11.0 pytest
sw_vers
system_profiler SPHardwareDataType
python -c 'import platform, torch; print(platform.machine(), torch.__version__); print("MPS:", torch.backends.mps.is_available()); assert platform.machine() == "arm64"; assert torch.backends.mps.is_available()'
git rev-parse HEAD
git diff --stat
env -u PYTORCH_ENABLE_MPS_FALLBACK HIGGS_REQUIRE_MPS=1 \
  python -m pytest -v tests/unit_test/higgs_tts/test_apple_sampling.py
```

Expected: all 15 cases pass, including the five MPS cases; no skips.
`HIGGS_REQUIRE_MPS=1` makes missing Metal hardware a failure. Disabling implicit
PyTorch fallback helps expose unsupported operations; the sampler's intentional
CPU transfer is still part of this implementation.

### B. Full-package sampler integration

Use an existing working SGLang-Omni Apple environment matching this checkout's
pinned dependencies. The minimal environment in A is insufficient for B.
From a fresh terminal in the repository root, set it up with:

```bash
./install.sh
source .venv-apple/bin/activate
```

If another virtualenv is active, run `deactivate` first. A Python 3.14 environment
containing only Torch and pytest cannot run the full-package tests: it falls
outside the project's Python range and lacks dependencies such as `transformers`.

```bash
env -u SGLANG_USE_MLX -u PYTORCH_ENABLE_MPS_FALLBACK HIGGS_REQUIRE_MPS=1 \
  python -m pytest -v tests/unit_test/higgs_tts/test_apple_sampler_integration.py
```

Expected: three cases pass with real MPS tensors and the real Higgs sampler.
If package import fails, send the full traceback. Known shared import blockers
are tracked in [#1890](https://github.com/sgl-project/sglang-omni/issues/1890)
and [#1918](https://github.com/sgl-project/sglang-omni/pull/1918); do not treat
a collection failure as a numerical-test result.

Return both test logs, chip model, unified memory, macOS version, Python/Torch
versions and the tested revision/diff. No full-server launch is requested yet:
engine/runner support is unfinished. Once it is wired, the hardware acceptance
suite must cover real speech quality (listening plus transcription/WER), cloning,
streaming continuity, repeated requests, peak memory and latency/RTF; WAV validity
alone is not enough.

## Local validation

### Apple M1 Max — engine profile development

- Hardware: Apple M1 Max, 32 GiB unified memory, native arm64.
- OS: macOS 26.6.2 (25G83).
- Environment: `.venv-apple`, Python 3.12.14, Torch 2.11.0, SGLang 0.5.18.
- Baseline revision: `fdac5c372d03d773fe9925ffddafaf3c719b6690`.
- Baseline sampler result: **18 passed in 75.09s**, zero skips or warnings.
- Profile regression result: **124 passed in 6.09s**, zero skips, 16 upstream
  import warnings. Covers 24 new profile tests, the original 18 sampler tests,
  NPU adaptation, Higgs pipeline and CLI decode-mode tests. CUDA policy is checked
  with fakes; this does not constitute CUDA hardware regression validation.
- The profile tests use a tiny local configuration and real SGLang ServerArgs;
  infrastructure creation is intercepted before any weights are loaded.
- SGLang imports in the profile tests emit TorchScript deprecation and
  unsupported-platform AWQ/GGUF warnings; these are separate from sampler results.

Use the existing environment directly; no global `python3.12` command or
environment activation is needed:

```bash
env -u SGLANG_USE_MLX -u PYTORCH_ENABLE_MPS_FALLBACK HIGGS_REQUIRE_MPS=1 \
  .venv-apple/bin/python -m pytest -v \
  tests/unit_test/higgs_tts/test_apple_engine_profile.py \
  tests/unit_test/higgs_tts/test_apple_sampling.py \
  tests/unit_test/higgs_tts/test_apple_sampler_integration.py
```

Runner audit: `HiggsTTSModel` still composes SGLang's `Qwen3ForCausalLM`, and
`HiggsTTSModelRunner` still uses the shared SGLang forward path. Qwen3-ASR's
`torch_mps_runner.py` instead installs a Transformers language model, owns a
per-request KV cache, and cleans it up on completion/abort. Its checkpoint
prefixes and audio embedding preparation are ASR-specific. Higgs needs its own
weight mapping and delayed multi-codebook embedding integration before that
approach can be reused. The next milestone is this runner integration, followed
by real checkpoint/codec validation; no speech support is claimed by the profile.

### Apple M1 Pro — earlier validation

- Hardware: Apple M1 Pro, 16 GiB unified memory, native arm64.
- OS: macOS 26.3 (25D125).
- Environment: `.venv-apple`, Python 3.12.11, Torch 2.11.0; MPS available.
- Revision: `ce067ef6f95de406bf9db10e5304fd6e200ba12c` plus the local
  CPU-before-float64 conversion fix in `apple_sampling.py`.
- Result: **18 passed in 7.95s**, zero skips and zero warnings: 15 standalone
  cases (including five MPS cases) and three real MPS sampler integration cases.
- `SGLANG_USE_MLX` and `PYTORCH_ENABLE_MPS_FALLBACK` were unset;
  `HIGGS_REQUIRE_MPS=1` required actual Metal availability.

Reproduction command from the repository root:

```bash
env -u SGLANG_USE_MLX -u PYTORCH_ENABLE_MPS_FALLBACK HIGGS_REQUIRE_MPS=1 \
  .venv-apple/bin/python -m pytest -v \
  tests/unit_test/higgs_tts/test_apple_sampling.py \
  tests/unit_test/higgs_tts/test_apple_sampler_integration.py
```

This qualifies sampler behavior only. Next is the MPS engine/runner work listed
above, followed by checkpoint/codec and end-to-end speech validation. CUDA
regression, speech quality, cloning, streaming, memory and latency remain untested.

### Earlier Windows validation

Windows x86_64, Python 3.12.7, isolated `.venv-higgs-apple`, Torch 2.14.0.
The environment is locally excluded via `.git/info/exclude`.

- Portable tests: 10 passed; five Metal cases skipped because MPS is unavailable.
- Three full-package MPS tests skipped on Windows; pending Apple hardware and
  the full serving environment. Combined result: 10 passed, eight skipped.
- Black 24.10.0, isort 5.13.2 and `git diff --check` passed.
- No inference, model-quality, latency or memory result is claimed.
- The pre-existing `.gitignore` edit excluding `.codegraph/` is preserved.
