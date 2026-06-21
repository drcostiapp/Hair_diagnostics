"""Build an ML-ready training dataset from raw PRELUDE event logs.

Connects to Postgres via SQLAlchemy (``DATABASE_URL`` env var) and loads the
``social_edges``, ``users`` and ``events`` tables, then constructs mutual-like
training pairs with binary labels (mutual match + real-world interaction).

If the database is unavailable (no DB, bad DSN, missing tables) the builder
degrades gracefully and synthesises a realistic dataset so that training can
always proceed.
"""
from __future__ import annotations

import os
from typing import Optional, Tuple

import numpy as np
import pandas as pd

try:  # config is optional; fall back to env var if package not importable.
    from app.config import DATABASE_URL, FEATURE_ORDER
except Exception:  # pragma: no cover - defensive
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://prelude:prelude@localhost:5432/prelude",
    )
    from data_builder.feature_engineering import FEATURE_ORDER

from data_builder.feature_engineering import compute_features, jaccard_similarity


def _try_load_from_db(database_url: str) -> Optional[Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]]:
    """Attempt to load raw tables from Postgres. Returns None on any failure."""
    try:
        from sqlalchemy import create_engine

        engine = create_engine(database_url)
        with engine.connect() as conn:
            users = pd.read_sql("SELECT * FROM users", conn)
            events = pd.read_sql("SELECT * FROM events", conn)
            social_edges = pd.read_sql("SELECT * FROM social_edges", conn)
        if users.empty or social_edges.empty:
            return None
        return users, events, social_edges
    except Exception as exc:  # pragma: no cover - depends on live DB
        print(f"[build_dataset] DB unavailable, falling back to synthetic: {exc}")
        return None


def _build_pairs_from_db(
    users: pd.DataFrame, events: pd.DataFrame, social_edges: pd.DataFrame
) -> pd.DataFrame:
    """Turn raw tables into engineered feature rows + labels.

    ``social_edges`` is expected to have columns: src_user, dst_user, event_id,
    liked (bool), met (bool). A positive label is a mutual like that resulted in
    a real-world meet.
    """
    users_by_id = {row["id"]: row for _, row in users.iterrows()}
    events_by_id = {row["id"]: row for _, row in events.iterrows()} if not events.empty else {}

    # Index likes for reciprocity lookup.
    likes = set()
    for _, e in social_edges.iterrows():
        if bool(e.get("liked", False)):
            likes.add((e["src_user"], e["dst_user"], e.get("event_id")))

    rows = []
    for _, e in social_edges.iterrows():
        if not bool(e.get("liked", False)):
            continue
        a_id, b_id, ev_id = e["src_user"], e["dst_user"], e.get("event_id")
        a, b = users_by_id.get(a_id), users_by_id.get(b_id)
        if a is None or b is None:
            continue
        ev = events_by_id.get(ev_id, {})

        mutual = (b_id, a_id, ev_id) in likes
        met = bool(e.get("met", False))
        label = 1 if (mutual and met) else 0

        feats = compute_features(
            user_a=_user_dict(a),
            user_b=_user_dict(b),
            event=_event_dict(ev),
            pair={"past_matches": float(e.get("past_matches", 0) or 0)},
        )
        feats["label"] = label
        rows.append(feats)

    return pd.DataFrame(rows)


def _user_dict(row) -> dict:
    return {
        "age": row.get("age", 25),
        "like_rate": row.get("like_rate", 0.5),
        "selectivity": row.get("selectivity", None),
        "interests": _parse_interests(row.get("interests")),
        "gender": row.get("gender", "u"),
    }


def _event_dict(row) -> dict:
    if row is None or (hasattr(row, "empty") and getattr(row, "empty", False)):
        return {}
    get = row.get if hasattr(row, "get") else (lambda k, d=None: d)
    return {
        "density": get("density", 0.5),
        "gender_ratio": get("gender_ratio", 0.5),
        "phase": get("phase", None),
    }


def _parse_interests(val):
    if val is None:
        return []
    if isinstance(val, (list, tuple, set)):
        return list(val)
    if isinstance(val, str):
        return [s.strip() for s in val.replace(";", ",").split(",") if s.strip()]
    return []


def build_synthetic_dataset(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """Generate a realistic synthetic training set when no DB is available."""
    rng = np.random.default_rng(seed)
    interest_pool = [
        "techno", "house", "art", "wine", "travel", "fashion", "gaming",
        "fitness", "food", "cinema", "live-music", "photography",
    ]
    rows = []
    for _ in range(n_samples):
        a_interests = list(rng.choice(interest_pool, size=rng.integers(1, 6), replace=False))
        b_interests = list(rng.choice(interest_pool, size=rng.integers(1, 6), replace=False))
        user_a = {
            "age": int(rng.integers(18, 45)),
            "like_rate": float(rng.beta(2, 3)),
            "interests": a_interests,
        }
        user_b = {
            "age": int(rng.integers(18, 45)),
            "like_rate": float(rng.beta(2, 3)),
            "interests": b_interests,
        }
        phase = rng.choice(["T-48h", "T-24h", "T-6h", "LIVE"])
        event = {
            "density": float(rng.uniform(0.1, 1.0)),
            "gender_ratio": float(rng.uniform(0.2, 0.8)),
            "phase": str(phase),
        }
        pair = {"past_matches": float(rng.poisson(0.3))}

        feats = compute_features(user_a, user_b, event, pair)

        # Latent ground-truth probability driven by the same signals the model
        # should learn, plus noise. Mutual match + meet is the positive label.
        logit = (
            2.5 * feats["interest_similarity"]
            + 2.0 * feats["reciprocity_likelihood"]
            + 1.5 * feats["behavioral_compatibility"]
            - 0.08 * feats["age_diff"]
            + 0.6 * (feats["time_decay"] - 1.0)
            + 0.5 * feats["event_density"]
            - 1.8
        )
        prob = 1.0 / (1.0 + np.exp(-logit))
        label = int(rng.random() < prob)
        feats["label"] = label
        rows.append(feats)

    return pd.DataFrame(rows)


def build_dataset(database_url: Optional[str] = None, min_rows: int = 200) -> pd.DataFrame:
    """Public entry point. Returns a DataFrame with FEATURE_ORDER columns + label.

    Tries the DB first; falls back to synthetic data on any problem or if the DB
    yields too few usable rows.
    """
    database_url = database_url or DATABASE_URL
    loaded = _try_load_from_db(database_url)
    if loaded is not None:
        try:
            df = _build_pairs_from_db(*loaded)
            if len(df) >= min_rows and df["label"].nunique() > 1:
                print(f"[build_dataset] Loaded {len(df)} real pairs from DB.")
                return df
            print("[build_dataset] DB rows insufficient; using synthetic data.")
        except Exception as exc:  # pragma: no cover
            print(f"[build_dataset] Failed building DB pairs ({exc}); using synthetic.")

    df = build_synthetic_dataset()
    print(f"[build_dataset] Generated {len(df)} synthetic pairs.")
    return df


if __name__ == "__main__":
    data = build_dataset()
    print(data.head())
    print("Label distribution:\n", data["label"].value_counts())
