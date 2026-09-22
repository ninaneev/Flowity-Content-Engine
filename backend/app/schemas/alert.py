"""Schemas Pydantic dos alertas de engajamento (PI 2, Tarefa 14)."""
from datetime import datetime

from pydantic import BaseModel, Field


class AlertSettingRead(BaseModel):
    min_engagement_rate: float = Field(..., ge=0, le=1)
    updated_at: datetime

    model_config = {"from_attributes": True}


class AlertSettingUpdate(BaseModel):
    # Fração entre 0 e 1: 0.02 = 2%
    min_engagement_rate: float = Field(..., ge=0, le=1)


class AlertRead(BaseModel):
    post_id: int
    hook: str
    channel: str
    platform: str
    engagement_rate: float
    published_at: datetime | None = None

    model_config = {"from_attributes": True}
