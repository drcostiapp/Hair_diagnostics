"""Central configuration for the PRELUDE ML service."""
import os
from pathlib import Path

# Base directory of the ml package (prelude/ml/)
BASE_DIR = Path(__file__).resolve().parent.parent

# Where trained models are persisted.
MODEL_REGISTRY_DIR = Path(os.getenv("MODEL_REGISTRY_DIR", BASE_DIR / "model_registry"))
MODEL_FILENAME = os.getenv("MODEL_FILENAME", "xgb_model.pkl")
MODEL_PATH = MODEL_REGISTRY_DIR / MODEL_FILENAME

# Database connection string for the social graph / event store.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://prelude:prelude@localhost:5432/prelude",
)

# Ordered list of engineered features. The order here is the canonical order
# used when building feature vectors for both training and inference.
FEATURE_ORDER = [
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

# Heuristic composite scoring weights (documented PRELUDE formula).
HEURISTIC_WEIGHTS = {
    "intent": 0.30,
    "interest": 0.20,
    "behavioral": 0.20,
    "reciprocity": 0.15,
    "diversity": 0.10,
    "exploration": 0.05,
}

# Time-decay multipliers applied to the composite score depending on how close
# we are to the event start time.
TIME_DECAY_MULTIPLIERS = {
    "T-48h": 0.7,
    "T-24h": 1.0,
    "T-6h": 1.3,
    "LIVE": 1.6,
}

# XGBoost hyper-parameters.
XGB_PARAMS = {
    "n_estimators": 300,
    "max_depth": 6,
    "learning_rate": 0.05,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "objective": "binary:logistic",
    "eval_metric": "logloss",
}

SERVICE_NAME = "prelude-ml"
SERVICE_VERSION = "0.1.0"
