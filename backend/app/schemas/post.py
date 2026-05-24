"""Schemas Pydantic para Posts."""
from datetime import datetime
from pydantic import BaseModel, field_validator

VALID_STATUS = {"idea", "draft", "revised", "scheduled", "publishing", "published", "failed"}
VALID_CHANNELS = {"linkedin", "x"}


class PostBase(BaseModel):
    hook: str
    body: str | None = None
    cta: str | None = None
    short_x: str | None = None
    alt_title: str | None = None
    channel: str = "linkedin"
    tone: str | None = None
    objective: str | None = None
    format: str | None = None
    status: str = "idea"
    scheduled_at: datetime | None = None
    generation_mode: str | None = None
    notes: str | None = None

    @field_validator("channel")
    @classmethod
    def validate_channel(cls, v: str) -> str:
        if v not in VALID_CHANNELS:
            raise ValueError(f"channel must be: {', '.join(VALID_CHANNELS)}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUS:
            raise ValueError(f"status must be one of: {', '.join(sorted(VALID_STATUS))}")
        return v


class PostCreate(PostBase):
    source_ids: list[int] = []  # IDs of sources used to generate the post.


class PostUpdate(BaseModel):
    """All fields are optional for partial updates."""
    hook: str | None = None
    body: str | None = None
    cta: str | None = None
    short_x: str | None = None
    alt_title: str | None = None
    channel: str | None = None
    tone: str | None = None
    objective: str | None = None
    format: str | None = None
    status: str | None = None
    scheduled_at: datetime | None = None
    notes: str | None = None


class PostResponse(PostBase):
    id: int
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    source_ids: list[int] = []

    model_config = {"from_attributes": True}


class CalendarPost(BaseModel):
    """Compact version for the calendar."""
    id: int
    hook: str
    channel: str
    status: str
    scheduled_at: datetime | None = None

    model_config = {"from_attributes": True}
