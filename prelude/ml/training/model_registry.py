"""Model persistence helpers for the PRELUDE ML service.

Provides :func:`save_model` and :func:`load_model` plus :func:`model_exists`.
Models are stored with joblib under ``model_registry/xgb_model.pkl``.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, Optional

import joblib

try:
    from app.config import MODEL_PATH, MODEL_REGISTRY_DIR
except Exception:  # pragma: no cover - allow standalone use
    MODEL_REGISTRY_DIR = Path(
        os.getenv("MODEL_REGISTRY_DIR", Path(__file__).resolve().parent.parent / "model_registry")
    )
    MODEL_PATH = MODEL_REGISTRY_DIR / os.getenv("MODEL_FILENAME", "xgb_model.pkl")


def save_model(model: Any, metadata: Optional[Dict[str, Any]] = None, path: Path = MODEL_PATH) -> Path:
    """Persist a model (+ optional metadata) to the registry."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"model": model, "metadata": metadata or {}}
    joblib.dump(payload, path)
    return path


def load_model(path: Path = MODEL_PATH) -> Optional[Dict[str, Any]]:
    """Load a model payload from the registry, or None if absent/unreadable.

    Returns a dict ``{"model": ..., "metadata": {...}}``.
    """
    path = Path(path)
    if not path.exists():
        return None
    try:
        payload = joblib.load(path)
        # Backwards-compat: a bare estimator was saved.
        if not isinstance(payload, dict) or "model" not in payload:
            return {"model": payload, "metadata": {}}
        return payload
    except Exception as exc:  # pragma: no cover - corrupt file
        print(f"[model_registry] Failed to load model at {path}: {exc}")
        return None


def model_exists(path: Path = MODEL_PATH) -> bool:
    return Path(path).exists()
