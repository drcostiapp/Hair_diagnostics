"""Inference helpers for PRELUDE.

Loads the trained XGBoost model if present; otherwise falls back to the
transparent heuristic scorer so predictions always work (cold start).
"""
from __future__ import annotations

from typing import Any, Dict, List

from data_builder.feature_engineering import (
    FEATURE_ORDER,
    features_to_vector,
    heuristic_score,
)
from training.model_registry import load_model

# Module-level cache so we don't hit disk on every request.
_MODEL_CACHE: Dict[str, Any] = {"payload": None, "loaded": False}


def _get_model():
    if not _MODEL_CACHE["loaded"]:
        _MODEL_CACHE["payload"] = load_model()
        _MODEL_CACHE["loaded"] = True
    return _MODEL_CACHE["payload"]


def reset_model_cache() -> None:
    """Force a reload on the next prediction (call after training)."""
    _MODEL_CACHE["payload"] = None
    _MODEL_CACHE["loaded"] = False


def model_is_available() -> bool:
    return _get_model() is not None


def predict_match(features: Dict[str, float]) -> Dict[str, Any]:
    """Return {"match_probability": float, "source": "model"|"heuristic"}.

    Uses the trained model when available, otherwise the heuristic. The
    heuristic composite is squashed into a (0, 1) range for a probability-like
    score.
    """
    payload = _get_model()
    if payload is not None:
        model = payload["model"]
        vector = [features_to_vector(features)]
        prob = float(model.predict_proba(vector)[0][1])
        return {"match_probability": prob, "source": "model"}

    raw = heuristic_score(features, add_noise=False)
    # raw is roughly in [0, ~1.6] after time-decay; normalise to (0,1).
    prob = max(0.0, min(1.0, raw / 1.6))
    return {"match_probability": prob, "source": "heuristic"}


def score_candidate(features: Dict[str, float]) -> Dict[str, Any]:
    """Score a single candidate for ranking.

    When a model exists, score == match_probability. Otherwise we use the full
    heuristic (with exploration noise) so ranking benefits from diversity.
    """
    payload = _get_model()
    if payload is not None:
        result = predict_match(features)
        return {"score": result["match_probability"], "source": "model"}
    return {"score": heuristic_score(features, add_noise=True), "source": "heuristic"}


def rank_candidates(
    candidates_features: List[Dict[str, float]],
) -> List[Dict[str, Any]]:
    """Score and sort a list of feature dicts, returning sorted score records."""
    scored = []
    for feats in candidates_features:
        result = score_candidate(feats)
        scored.append({"score": float(result["score"]), "source": result["source"]})
    return sorted(scored, key=lambda r: r["score"], reverse=True)
