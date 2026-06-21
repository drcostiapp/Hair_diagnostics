"""Evaluate the persisted PRELUDE model.

Loads the saved model and reports ROC-AUC (plus logloss/accuracy) on a freshly
built dataset. Useful as a sanity check after training.
"""
from __future__ import annotations

from typing import Optional

import numpy as np
from sklearn.metrics import accuracy_score, log_loss, roc_auc_score

from data_builder.build_dataset import build_dataset
from data_builder.feature_engineering import FEATURE_ORDER
from training.model_registry import load_model


def evaluate(database_url: Optional[str] = None) -> Optional[dict]:
    payload = load_model()
    if payload is None:
        print("[evaluate] No trained model found. Run training first.")
        return None

    model = payload["model"]
    df = build_dataset(database_url=database_url)
    X = df[FEATURE_ORDER].astype(float).values
    y = df["label"].astype(int).values

    proba = model.predict_proba(X)[:, 1]
    preds = (proba >= 0.5).astype(int)

    metrics = {}
    try:
        metrics["roc_auc"] = float(roc_auc_score(y, proba))
    except ValueError:
        metrics["roc_auc"] = None
    try:
        metrics["log_loss"] = float(log_loss(y, proba, labels=[0, 1]))
    except ValueError:
        metrics["log_loss"] = None
    metrics["accuracy"] = float(accuracy_score(y, preds))

    print(f"[evaluate] ROC-AUC: {metrics['roc_auc']}")
    print(f"[evaluate] LogLoss: {metrics['log_loss']}")
    print(f"[evaluate] Accuracy: {metrics['accuracy']:.4f}")
    return metrics


if __name__ == "__main__":
    evaluate()
