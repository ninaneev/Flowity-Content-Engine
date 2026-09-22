"""Schemas Pydantic para os assets de posts."""

from datetime import datetime

from pydantic import BaseModel, Field


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


class AssetOrderUpdate(BaseModel):
    asset_ids: list[int] = Field(..., min_length=1, description="IDs dos assets na ordem desejada")
