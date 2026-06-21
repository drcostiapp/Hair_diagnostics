"""Train the PRELUDE XGBoost match-probability model.

Builds the dataset (real DB or synthetic fallback), trains an XGBClassifier
with the documented hyper-parameters, evaluates on a held-out validation split,
and saves the model to the registry. Safe to run with no DB.
"""
from __future__ import annotations

from typing import Any, Dict, Optional

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    log_loss,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

from data_builder.build_dataset import build_dataset
from data_builder.feature_engineering import FEATURE_ORDER

try:
    from app.config import XGB_PARAMS
except Exception:  # pragma: no cover
    XGB_PARAMS = {
        "n_estimators": 300,
        "max_depth": 6,
        "learning_rate": 0.05,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "objective": "binary:logistic",
        "eval_metric": "logloss",
    }

from training.model_registry import save_model


def train(
    database_url: Optional[str] = None,
    test_size: float = 0.2,
    random_state: int = 42,
) -> Dict[str, Any]:
    """Train and persist the model. Returns a metrics dict."""
    from xgboost import XGBClassifier

    df = build_dataset(database_url=database_url)
    X = df[FEATURE_ORDER].astype(float).values
    y = df["label"].astype(int).values

    stratify = y if len(np.unique(y)) > 1 else None
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=stratify
    )

    model = XGBClassifier(
        n_estimators=XGB_PARAMS["n_estimators"],
        max_depth=XGB_PARAMS["max_depth"],
        learning_rate=XGB_PARAMS["learning_rate"],
        subsample=XGB_PARAMS["subsample"],
        colsample_bytree=XGB_PARAMS["colsample_bytree"],
        objective=XGB_PARAMS["objective"],
        eval_metric=XGB_PARAMS["eval_metric"],
        random_state=random_state,
        n_jobs=-1,
    )
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)

    proba = model.predict_proba(X_val)[:, 1]
    preds = (proba >= 0.5).astype(int)

    metrics: Dict[str, Any] = {
        "n_samples": int(len(df)),
        "n_train": int(len(X_train)),
        "n_val": int(len(X_val)),
        "positive_rate": float(np.mean(y)),
        "features": FEATURE_ORDER,
    }
    # Guard against single-class validation slices.
    try:
        metrics["roc_auc"] = float(roc_auc_score(y_val, proba))
    except ValueError:
        metrics["roc_auc"] = None
    try:
        metrics["log_loss"] = float(log_loss(y_val, proba, labels=[0, 1]))
    except ValueError:
        metrics["log_loss"] = None
    metrics["accuracy"] = float(accuracy_score(y_val, preds))
    metrics["precision"] = float(precision_score(y_val, preds, zero_division=0))
    metrics["recall"] = float(recall_score(y_val, preds, zero_division=0))

    save_path = save_model(model, metadata=metrics)
    metrics["model_path"] = str(save_path)
    print(f"[train] Saved model -> {save_path}")
    print(f"[train] ROC-AUC={metrics['roc_auc']} accuracy={metrics['accuracy']:.4f}")
    return metrics


if __name__ == "__main__":
    train()
