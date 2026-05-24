"""Pydantic schemas for source input and output validation."""
from datetime import datetime
from pydantic import BaseModel, field_validator
import json


class SourceBase(BaseModel):
    title: str
    source_type: str
    content: str
    theme: str | None = None
    audience: str | None = None
    origin: str | None = None
    tags_json: str | None = None  # JSON string: '["ia","saas"]'
    notes: str | None = None

    @field_validator("source_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"post_antigo", "insight", "frase", "objecao", "dor", "trecho", "comentario", "newsletter", "referencia"}
        if v not in allowed:
            raise ValueError(f"source_type must be one of: {', '.join(sorted(allowed))}")
        return v


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseModel):
    """All fields are optional when updating."""
    title: str | None = None
    source_type: str | None = None
    content: str | None = None
    theme: str | None = None
    audience: str | None = None
    origin: str | None = None
    tags_json: str | None = None
    notes: str | None = None


class SourceResponse(SourceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
