"""Schemas Pydantic para Posts."""
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

VALID_STATUS = {"idea", "draft", "revised", "scheduled", "publishing", "published", "failed"}
VALID_CHANNELS = {"linkedin", "x", "newsletter"}
VALID_WORKFLOWS = {"manual", "pi1", "pi2"}
# Chaves estáveis; os rótulos e cores ficam em frontend/src/lib/pillars.js
VALID_PILLARS = {"workflow", "proof", "build", "pov", "story"}


def _validar_workflow(v: str | None) -> str | None:
    """Fluxo de produção usado na medição de tempo (PI 2, T16)."""
    if v is None or v == "":
        return None
    if v not in VALID_WORKFLOWS:
        raise ValueError("workflow deve ser: manual, pi1 ou pi2")
    return v


def _validar_pillar(v: str | None) -> str | None:
    """Pilar de conteúdo do calendário; vazio vira None (sem pilar)."""
    if v is None or v == "":
        return None
    if v not in VALID_PILLARS:
        raise ValueError(f"pillar deve ser: {', '.join(sorted(VALID_PILLARS))}")
    return v


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
    pillar: str | None = None
    status: str = "idea"
    scheduled_at: datetime | None = None
    generation_mode: str | None = None
    notes: str | None = None
    # Medição de tempo (PI 2, T16)
    external_minutes: int | None = Field(default=None, ge=0)
    tools_used: str | None = Field(default=None, max_length=200)
    workflow: str | None = None

    @field_validator("workflow")
    @classmethod
    def validate_workflow(cls, v: str | None) -> str | None:
        return _validar_workflow(v)

    @field_validator("pillar")
    @classmethod
    def validate_pillar(cls, v: str | None) -> str | None:
        return _validar_pillar(v)

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
    pillar: str | None = None
    status: str | None = None
    scheduled_at: datetime | None = None
    notes: str | None = None
    # Medição de tempo (PI 2, T16)
    external_minutes: int | None = Field(default=None, ge=0)
    tools_used: str | None = Field(default=None, max_length=200)
    workflow: str | None = None

    @field_validator("workflow")
    @classmethod
    def validate_workflow(cls, v: str | None) -> str | None:
        return _validar_workflow(v)

    @field_validator("pillar")
    @classmethod
    def validate_pillar(cls, v: str | None) -> str | None:
        return _validar_pillar(v)


class PostResponse(PostBase):
    id: int
    published_at: datetime | None = None
    linkedin_post_urn: str | None = None
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
    pillar: str | None = None
    scheduled_at: datetime | None = None

    model_config = {"from_attributes": True}
