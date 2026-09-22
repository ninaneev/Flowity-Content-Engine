"""Schemas Pydantic para os assets de posts."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.services.accessibility import ALT_MAX, ALT_MIN, validar_alt_text


class PostAssetResponse(BaseModel):
    id: int
    post_id: int
    kind: str
    position: int
    file_path: str
    mime_type: str
    width: int | None = None
    height: int | None = None
    size_bytes: int | None = None
    alt_text: str
    caption: str | None = None
    created_at: datetime
    updated_at: datetime
    url: str | None = None

    model_config = {"from_attributes": True}


class PostAssetUpdate(BaseModel):
    alt_text: str | None = None
    caption: str | None = None

    @field_validator("alt_text")
    @classmethod
    def validate_alt_text(cls, v: str | None) -> str | None:
        if v is None:
            return v          # campo nao enviado no PATCH, mantem o valor atual
        return validar_alt_text(v)


class AltTextIn(BaseModel):
    """Valida o alt_text que chega por formulario multipart no upload."""

    alt_text: str = Field(..., min_length=ALT_MIN, max_length=ALT_MAX)

    @field_validator("alt_text")
    @classmethod
    def validate_alt_text(cls, v: str) -> str:
        return validar_alt_text(v)


class AssetOrderUpdate(BaseModel):
    asset_ids: list[int] = Field(..., min_length=1, description="IDs dos assets na ordem desejada")


class RenderImageRequest(BaseModel):
    """Corpo opcional de POST /posts/{id}/render/image; o que faltar vem do post."""

    hook: str | None = Field(None, max_length=280)
    cta: str | None = Field(None, max_length=280)
    alt_text: str | None = None

    @field_validator("alt_text")
    @classmethod
    def validate_alt_text(cls, v: str | None) -> str | None:
        if v is None:
            return v          # sem alt_text, o renderizador gera um a partir do hook
        return validar_alt_text(v)
