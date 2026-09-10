# SPDX-License-Identifier: Apache-2.0
import io
import json
import sys
from types import SimpleNamespace

import numpy as np
import pytest
import soundfile as sf

from scripts import test_higgs_mps_e2e as probe


@pytest.mark.parametrize("same", [True, False])
def test_seeded_probe_fails_on_changed_audio(tmp_path, monkeypatch, same):
    def wav(scale):
        data = io.BytesIO()
        sf.write(data, np.full(240, scale), 24000, format="WAV")
        return data.getvalue()

    responses = iter(
        [
            SimpleNamespace(content=wav(0.1), raise_for_status=lambda: None),
            SimpleNamespace(
                content=wav(0.1 if same else 0.2), raise_for_status=lambda: None
            ),
            SimpleNamespace(status_code=400),
        ]
    )
    monkeypatch.setattr(probe.requests, "post", lambda *a, **k: next(responses))
    monkeypatch.setattr(sys, "argv", ["probe", "--output", str(tmp_path)])
    if same:
        probe.main()
    else:
        with pytest.raises(AssertionError, match="seeded outputs differ"):
            probe.main()
    report = json.loads((tmp_path / "report.json").read_text())
    assert report["status"] == ("passed" if same else "failed")
