"""Modelo ORM da tabela post_assets."""

from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.post import Post

class PostAsset(Base):
    """Cada linha é um arquivo de imagem pertencente a um post."""

    __tablename__ = "post_assets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    kind: Mapped[str] = mapped_column(
        String(20),
        default="image",
        nullable=False,
    )

    position: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    width: Mapped[int | None] = mapped_column(Integer)

    height: Mapped[int | None] = mapped_column(Integer)

    size_bytes: Mapped[int | None] = mapped_column(Integer)

    alt_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    caption: Mapped[str | None] = mapped_column(String(500))

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
    )

    post: Mapped["Post"] = relationship(
        "Post",
        back_populates="assets",
    )