# PRELUDE ML Service

Machine-learning ranking service for **PRELUDE**, a nightlife social app. It
ranks candidate users within a single event to maximise the probability of a
**mutual match + real-world meet**.

The service is a FastAPI app backed by an XGBoost classifier, with a transparent
heuristic fallback so it works on day one — before any model is trained
(cold start).

## Layout

```
prelude/ml/
  app/                      # FastAPI service
    main.py                 # app + endpoints
    schemas.py              # pydantic request/response models
    config.py               # paths, feature order, hyper-params, weights
  data_builder/
    build_dataset.py        # raw event logs -> ML-ready pairs (synthetic fallback)
    feature_engineering.py  # compute_features + heuristic scorer
  training/
    train_xgboost.py        # train + persist model
    evaluate.py             # load model, print ROC-AUC
    model_registry.py       # save_model() / load_model()
  inference/
    predict.py              # predict_match() / rank (model or heuristic)
  model_registry/           # saved models live here (xgb_model.pkl)
  requirements.txt
  Dockerfile
  README.md
```

## Endpoints

| Method | Path           | Description |
|--------|----------------|-------------|
| GET    | `/health`      | Liveness + whether a trained model is loaded. |
| POST   | `/ml/features` | Raw pair/user/event context → engineered feature vector. |
| POST   | `/ml/rank`     | Rank candidates for a viewer within an event (desc by score). |
| POST   | `/ml/train`    | Train + persist a model. Falls back to synthetic data if no DB. |

### `/ml/features`

```json
{
  "user_a": {"age": 27, "like_rate": 0.4, "interests": ["techno", "art"]},
  "user_b": {"age": 29, "like_rate": 0.6, "interests": ["techno", "wine"]},
  "event":  {"density": 0.7, "gender_ratio": 0.5, "phase": "T-6h"}
}
```

Returns the engineered `features` dict and the ordered `vector`.

Features: `age_diff, like_rate_a, like_rate_b, past_matches, selectivity_diff,
interest_similarity (Jaccard over interests), reciprocity_likelihood,
behavioral_compatibility, event_density, gender_ratio, time_decay`.

### `/ml/rank`

```json
{
  "event_id": "evt_123",
  "user_id": "u_1",
  "viewer": {"age": 27, "like_rate": 0.4, "interests": ["techno"]},
  "event": {"density": 0.7, "phase": "LIVE"},
  "candidates": [
    {"user_id": "u_2", "user": {"age": 29, "interests": ["techno", "wine"]}},
    {"user_id": "u_3", "features": {"interest_similarity": 0.9, "reciprocity_likelihood": 0.7}}
  ]
}
```

Returns `{ user_id, event_id, source, ranked_candidates: [{user_id, score}] }`
sorted descending. Each candidate may either supply precomputed `features` or
raw `user`/`pair` context (features are computed server-side).

### `/ml/train`

```json
{ "database_url": null, "test_size": 0.2 }
```

Triggers training and returns metrics (`roc_auc`, `log_loss`, `accuracy`,
`precision`, `recall`, …). Safe to call with no DB — it generates synthetic
training data as a fallback.

## Cold start (heuristic fallback)

If no model exists in `model_registry/`, `/ml/rank` and inference use a
transparent composite scorer instead of failing:

```
composite = 0.30 * intent
          + 0.20 * interest_similarity
          + 0.20 * behavioral_compatibility
          + 0.15 * reciprocity_likelihood
          + 0.10 * diversity
          + 0.05 * exploration_noise

score = composite * time_decay_multiplier
```

Time-decay multipliers by event phase: `T-48h = 0.7`, `T-24h = 1.0`,
`T-6h = 1.3`, `LIVE = 1.6`. Once a model is trained and saved, `/ml/rank`
automatically switches to model scoring (see `source` in the response).

## Run locally

```bash
cd prelude/ml
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Start the API (works with no DB and no trained model)
uvicorn app.main:app --host 0.0.0.0 --port 8000

# In another shell:
curl localhost:8000/health
curl -X POST localhost:8000/ml/train          # trains on synthetic data
python -m training.evaluate                    # prints ROC-AUC
```

`DATABASE_URL` controls the Postgres connection (default
`postgresql+psycopg2://prelude:prelude@localhost:5432/prelude`). Expected
tables: `users`, `events`, `social_edges`. If the DB is unreachable or has too
few rows, training and dataset building fall back to synthetic data.

## Run with Docker

```bash
cd prelude/ml
docker build -t prelude-ml .
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql+psycopg2://user:pass@host:5432/prelude" \
  prelude-ml
```

The container exposes port 8000 and runs `uvicorn app.main:app`.

## Train from the CLI

```bash
python -m training.train_xgboost   # builds dataset, trains, saves xgb_model.pkl
python -m training.evaluate        # loads model, prints ROC-AUC
```

The model is saved to `model_registry/xgb_model.pkl` via joblib, together with
its training metrics as metadata.
