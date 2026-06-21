"""PRELUDE Machine Learning service (FastAPI).

Ranks candidate users within a single nightlife event to maximise the
probability of a mutual match + real-world meet.

Endpoints:
    GET  /health        liveness + model availability
    POST /ml/features   raw context -> engineered feature vector
    POST /ml/rank       rank candidates for a viewer (model or heuristic)
    POST /ml/train      train + persist a model (synthetic fallback if no DB)

The service always starts and serves /ml/rank even with no DB and no trained
model, thanks to the heuristic cold-start scorer.
"""
from __future__ import annotations

from typing import Dict, List

from fastapi import FastAPI, HTTPException

from app.config import SERVICE_NAME, SERVICE_VERSION
from app.schemas import (
    FeatureRequest,
    FeatureResponse,
    HealthResponse,
    RankedCandidate,
    RankRequest,
    RankResponse,
    TrainRequest,
    TrainResponse,
)
from data_builder.feature_engineering import compute_features, features_to_vector
from inference.predict import (
    model_is_available,
    rank_candidates,
    reset_model_cache,
    score_candidate,
)

app = FastAPI(title="PRELUDE ML Service", version=SERVICE_VERSION)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=SERVICE_NAME,
        version=SERVICE_VERSION,
        model_available=model_is_available(),
    )


@app.post("/ml/features", response_model=FeatureResponse)
def ml_features(req: FeatureRequest) -> FeatureResponse:
    features = compute_features(
        user_a=req.user_a.model_dump(),
        user_b=req.user_b.model_dump(),
        event=req.event.model_dump(),
        pair=req.pair,
    )
    return FeatureResponse(features=features, vector=features_to_vector(features))


def _candidate_features(req: RankRequest, candidate) -> Dict[str, float]:
    """Resolve a candidate's feature dict.

    Precedence:
      1. explicit ``features`` dict on the candidate
      2. compute from viewer + candidate.user + event context
    Any extra top-level numeric keys on the candidate override computed values.
    """
    if candidate.features:
        feats = dict(candidate.features)
        # Ensure all canonical features exist by backfilling computed defaults.
        computed = compute_features(event=req.event.model_dump())
        for k, v in computed.items():
            feats.setdefault(k, v)
    else:
        user_b = candidate.user.model_dump() if candidate.user else {}
        viewer = req.viewer.model_dump() if req.viewer else {}
        feats = compute_features(
            user_a=viewer,
            user_b=user_b,
            event=req.event.model_dump(),
            pair=candidate.pair,
        )

    # Apply extra top-level overrides (pydantic extra="allow").
    extras = getattr(candidate, "__pydantic_extra__", None) or {}
    for k, v in extras.items():
        if isinstance(v, (int, float)) and k in feats:
            feats[k] = float(v)
    return feats


@app.post("/ml/rank", response_model=RankResponse)
def ml_rank(req: RankRequest) -> RankResponse:
    if not req.candidates:
        return RankResponse(
            user_id=req.user_id,
            event_id=req.event_id,
            source="model" if model_is_available() else "heuristic",
            ranked_candidates=[],
        )

    scored: List[RankedCandidate] = []
    source = "model" if model_is_available() else "heuristic"
    for cand in req.candidates:
        feats = _candidate_features(req, cand)
        result = score_candidate(feats)
        source = result["source"]
        scored.append(RankedCandidate(user_id=cand.user_id, score=round(float(result["score"]), 6)))

    scored.sort(key=lambda c: c.score, reverse=True)
    return RankResponse(
        user_id=req.user_id,
        event_id=req.event_id,
        source=source,
        ranked_candidates=scored,
    )


@app.post("/ml/train", response_model=TrainResponse)
def ml_train(req: TrainRequest) -> TrainResponse:
    try:
        # Imported lazily so the service can start without xgboost installed
        # being required at import time of the app module.
        from training.train_xgboost import train

        metrics = train(database_url=req.database_url, test_size=req.test_size)
        reset_model_cache()  # pick up the freshly trained model
        return TrainResponse(status="trained", metrics=metrics)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Training failed: {exc}")


# Allow `python -m app.main` for quick local runs.
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
