"""Modelo ORM da tabela sources."""
from datetime import datetime
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(
        String(50), nullable=False,
        comment="post_antigo | insight | frase | objecao | dor | trecho | comentario | newsletter | referencia"
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    theme: Mapped[str | None] = mapped_column(String(100))
    audience: Mapped[str | None] = mapped_column(String(100))
    origin: Mapped[str | None] = mapped_column(String(255))
    tags_json: Mapped[str | None] = mapped_column(Text, comment="JSON array de tags, ex: [\"ia\",\"saas\"]")
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
