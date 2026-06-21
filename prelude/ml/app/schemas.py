"""Pydantic request/response models for the PRELUDE ML API."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# --------------------------------------------------------------------------- #
# /ml/features
# --------------------------------------------------------------------------- #
class UserContext(BaseModel):
    user_id: Optional[str] = None
    age: Optional[float] = 25
    like_rate: Optional[float] = 0.5
    selectivity: Optional[float] = None
    interests: List[str] = Field(default_factory=list)
    gender: Optional[str] = "u"


class EventContext(BaseModel):
    event_id: Optional[str] = None
    density: Optional[float] = 0.5
    gender_ratio: Optional[float] = 0.5
    phase: Optional[str] = None  # one of T-48h | T-24h | T-6h | LIVE
    time_decay: Optional[float] = None


class FeatureRequest(BaseModel):
    user_a: UserContext = Field(default_factory=UserContext)
    user_b: UserContext = Field(default_factory=UserContext)
    event: EventContext = Field(default_factory=EventContext)
    pair: Dict[str, float] = Field(default_factory=dict)


class FeatureResponse(BaseModel):
    features: Dict[str, float]
    vector: List[float]


# --------------------------------------------------------------------------- #
# /ml/rank
# --------------------------------------------------------------------------- #
class Candidate(BaseModel):
    """A candidate to rank.

    Either supply precomputed ``features`` (canonical names), or provide raw
    ``user``/``pair`` context to have features computed server-side. Extra keys
    are accepted and treated as feature overrides.
    """

    user_id: str
    features: Optional[Dict[str, float]] = None
    user: Optional[UserContext] = None
    pair: Dict[str, float] = Field(default_factory=dict)

    class Config:
        extra = "allow"


class RankRequest(BaseModel):
    event_id: str
    user_id: str
    candidates: List[Candidate]
    viewer: Optional[UserContext] = None
    event: EventContext = Field(default_factory=EventContext)


class RankedCandidate(BaseModel):
    user_id: str
    score: float


class RankResponse(BaseModel):
    user_id: str
    event_id: str
    source: str  # "model" or "heuristic"
    ranked_candidates: List[RankedCandidate]


# --------------------------------------------------------------------------- #
# /ml/train
# --------------------------------------------------------------------------- #
class TrainRequest(BaseModel):
    database_url: Optional[str] = None
    test_size: float = 0.2


class TrainResponse(BaseModel):
    status: str
    metrics: Dict[str, Any]


# --------------------------------------------------------------------------- #
# /health
# --------------------------------------------------------------------------- #
class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    model_available: bool
