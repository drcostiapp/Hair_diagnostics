"""Feature engineering for PRELUDE candidate ranking.

The central entry point is :func:`compute_features`, which turns raw
pair/user/event context into the canonical engineered feature vector used by
both the heuristic scorer and the XGBoost model.

Everything here is intentionally defensive: any missing field falls back to a
neutral default so the service never crashes on partial input (important for
cold-start and ad-hoc /ml/features calls).
"""
from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional

# Canonical feature order. Kept in sync with app.config.FEATURE_ORDER but
# duplicated here so this module has no hard dependency on the FastAPI package
# (it is imported by the data builder and training code too).
FEATURE_ORDER: List[str] = [
    "age_diff",
    "like_rate_a",
    "like_rate_b",
    "past_matches",
    "selectivity_diff",
    "interest_similarity",
    "reciprocity_likelihood",
    "behavioral_compatibility",
    "event_density",
    "gender_ratio",
    "time_decay",
]

TIME_DECAY_MULTIPLIERS = {
    "T-48h": 0.7,
    "T-24h": 1.0,
    "T-6h": 1.3,
    "LIVE": 1.6,
}


def _get(d: Optional[Dict[str, Any]], key: str, default: Any = None) -> Any:
    if not d:
        return default
    val = d.get(key, default)
    return default if val is None else val


def _clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


def jaccard_similarity(a: Iterable[Any], b: Iterable[Any]) -> float:
    """Jaccard overlap between two interest lists. Empty sets -> 0.0."""
    set_a, set_b = set(a or []), set(b or [])
    if not set_a and not set_b:
        return 0.0
    union = set_a | set_b
    if not union:
        return 0.0
    return len(set_a & set_b) / len(union)


def time_decay_multiplier(phase: Optional[str], default: float = 1.0) -> float:
    """Map an event phase label to its time-decay multiplier."""
    if not phase:
        return default
    return TIME_DECAY_MULTIPLIERS.get(phase, default)


def compute_features(
    user_a: Optional[Dict[str, Any]] = None,
    user_b: Optional[Dict[str, Any]] = None,
    event: Optional[Dict[str, Any]] = None,
    pair: Optional[Dict[str, Any]] = None,
) -> Dict[str, float]:
    """Compute the engineered feature dict for a (user_a, user_b) pair.

    Parameters
    ----------
    user_a, user_b:
        Dicts describing the two users. Recognised keys include ``age``,
        ``like_rate``, ``selectivity``, ``interests`` (list), ``gender``.
    event:
        Dict describing the event. Recognised keys include ``density``,
        ``gender_ratio``, ``phase`` (one of the TIME_DECAY labels).
    pair:
        Optional precomputed pair-level signals such as ``past_matches``,
        ``reciprocity_likelihood``, ``behavioral_compatibility``. Anything not
        provided is derived from the user/event context.
    """
    user_a = user_a or {}
    user_b = user_b or {}
    event = event or {}
    pair = pair or {}

    age_a = float(_get(user_a, "age", 25))
    age_b = float(_get(user_b, "age", 25))
    age_diff = abs(age_a - age_b)

    like_rate_a = _clamp(float(_get(user_a, "like_rate", 0.5)))
    like_rate_b = _clamp(float(_get(user_b, "like_rate", 0.5)))

    past_matches = float(_get(pair, "past_matches", 0))

    selectivity_a = _clamp(float(_get(user_a, "selectivity", 1.0 - like_rate_a)))
    selectivity_b = _clamp(float(_get(user_b, "selectivity", 1.0 - like_rate_b)))
    selectivity_diff = abs(selectivity_a - selectivity_b)

    interest_similarity = float(
        _get(
            pair,
            "interest_similarity",
            jaccard_similarity(
                _get(user_a, "interests", []), _get(user_b, "interests", [])
            ),
        )
    )

    # Reciprocity: how likely b likes a back given a likes b.
    # Default proxy = geometric blend of both like-rates, lifted by shared interests.
    reciprocity_likelihood = float(
        _get(
            pair,
            "reciprocity_likelihood",
            _clamp((like_rate_a * like_rate_b) ** 0.5 * (0.5 + 0.5 * interest_similarity)),
        )
    )

    # Behavioral compatibility: closeness of activity / selectivity profiles.
    behavioral_compatibility = float(
        _get(
            pair,
            "behavioral_compatibility",
            _clamp(1.0 - 0.5 * selectivity_diff - 0.5 * abs(like_rate_a - like_rate_b)),
        )
    )

    event_density = _clamp(float(_get(event, "density", 0.5)))
    gender_ratio = _clamp(float(_get(event, "gender_ratio", 0.5)))

    phase = _get(event, "phase", None)
    time_decay = float(_get(event, "time_decay", time_decay_multiplier(phase)))

    return {
        "age_diff": age_diff,
        "like_rate_a": like_rate_a,
        "like_rate_b": like_rate_b,
        "past_matches": past_matches,
        "selectivity_diff": selectivity_diff,
        "interest_similarity": interest_similarity,
        "reciprocity_likelihood": reciprocity_likelihood,
        "behavioral_compatibility": behavioral_compatibility,
        "event_density": event_density,
        "gender_ratio": gender_ratio,
        "time_decay": time_decay,
    }


def features_to_vector(features: Dict[str, float]) -> List[float]:
    """Convert a feature dict into an ordered vector (canonical order)."""
    return [float(features.get(name, 0.0)) for name in FEATURE_ORDER]


def heuristic_score(features: Dict[str, float], add_noise: bool = True) -> float:
    """Transparent composite heuristic used as a cold-start fallback.

    Weights (documented PRELUDE formula):
        intent 0.30, interest 0.20, behavioral 0.20,
        reciprocity 0.15, diversity 0.10, exploration noise 0.05
    The composite is then multiplied by the time-decay multiplier.
    """
    import random

    like_rate_a = features.get("like_rate_a", 0.5)
    like_rate_b = features.get("like_rate_b", 0.5)
    interest = features.get("interest_similarity", 0.0)
    behavioral = features.get("behavioral_compatibility", 0.0)
    reciprocity = features.get("reciprocity_likelihood", 0.0)

    # Intent: how strongly both sides tend to express interest.
    intent = (like_rate_a + like_rate_b) / 2.0

    # Diversity: reward modest age spread and event mixing, penalise extremes.
    age_diff = features.get("age_diff", 0.0)
    age_div = _clamp(1.0 - age_diff / 20.0)
    diversity = _clamp(0.5 * age_div + 0.5 * features.get("gender_ratio", 0.5))

    exploration = random.random() if add_noise else 0.5

    composite = (
        0.30 * intent
        + 0.20 * interest
        + 0.20 * behavioral
        + 0.15 * reciprocity
        + 0.10 * diversity
        + 0.05 * exploration
    )

    time_decay = features.get("time_decay", 1.0)
    return composite * time_decay
