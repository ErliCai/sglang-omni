#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Exercise a running Higgs HTTP server and save audio plus measured results.

Run manually, not during unit tests. WAV checks are structural; listen to the
saved clips or transcribe them separately to assess speech quality.
"""

import argparse
import hashlib
import io
import json
import time
from pathlib import Path

import numpy as np
import requests
import soundfile as sf


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    parser.add_argument("--model", default="bosonai/higgs-audio-v3-tts-4b")
    parser.add_argument(
        "--output", type=Path, default=Path("notes/artifacts/higgs-mps-e2e")
    )
    parser.add_argument(
        "--text", default="Hello, this is a test of speech generation on my Mac."
    )
    parser.add_argument("--timeout", type=float, default=600)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    url = args.url.rstrip("/") + "/v1/audio/speech"
    report = {
        "server": args.url,
        "model": args.model,
        "text": args.text,
        "checks": [],
        "quality": "manual listening or transcription required",
    }
    body = dict(
        model=args.model,
        voice="default",
        input=args.text,
        response_format="wav",
        seed=42,
        temperature=0.8,
        top_k=50,
        max_new_tokens=512,
    )
    try:
        previous = None
        for number in (1, 2):
            start = time.perf_counter()
            response = requests.post(url, json=body, timeout=args.timeout)
            response.raise_for_status()
            elapsed = time.perf_counter() - start
            samples, rate = sf.read(io.BytesIO(response.content), dtype="float32")
            assert rate == 24000, f"Unexpected sample rate: {rate}"
            assert samples.ndim == 1, f"Expected mono audio, got {samples.shape}"
            assert (
                len(samples) > 0 and np.isfinite(samples).all()
            ), "Empty or nonfinite audio"
            rms = float(np.sqrt(np.mean(samples.astype(np.float64) ** 2)))
            assert rms > 1e-5, "Audio is effectively silent"
            path = args.output / f"speech-{number}.wav"
            path.write_bytes(response.content)
            record = dict(
                file=path.name,
                sample_rate=rate,
                seconds=len(samples) / rate,
                wall_seconds=elapsed,
                rtf=elapsed / (len(samples) / rate),
                rms=rms,
                peak=float(np.max(np.abs(samples))),
                sha256=hashlib.sha256(response.content).hexdigest(),
            )
            if previous is not None:
                record["same_seed_equal_samples"] = bool(
                    np.array_equal(previous, samples)
                )
                assert record[
                    "same_seed_equal_samples"
                ], "Same-backend seeded outputs differ"
            previous = samples
            report["checks"].append(record)
            print(json.dumps(record, ensure_ascii=False), flush=True)
        response = requests.post(url, json={**body, "input": ""}, timeout=30)
        report["empty_input_status"] = response.status_code
        assert 400 <= response.status_code < 500, "Empty text must be rejected"
        report["status"] = "passed"
    except Exception as exc:
        report["status"] = "failed"
        report["error"] = str(exc)
        raise
    finally:
        (args.output / "report.json").write_text(
            json.dumps(report, indent=2, ensure_ascii=False) + "\n"
        )


if __name__ == "__main__":
    main()
