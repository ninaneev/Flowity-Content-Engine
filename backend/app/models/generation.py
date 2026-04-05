"""Modelos ORM para post_sources e generation_runs."""
from datetime import datetime
from sqlalchemy import ForeignKey, Text, String, DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class PostSource(Base):
    """Liga posts às sources usadas para gerá-los."""
    __tablename__ = "post_sources"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("sources.id", ondelete="CASCADE"), index=True)


class GenerationRun(Base):
    """Persiste cada chamada ao Ollama ou ao template. Nunca descarte gerações."""
    __tablename__ = "generation_runs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int | None] = mapped_column(ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)

    # ── Input ─────────────────────────────────────────────────────
    prompt_used: Mapped[str | None] = mapped_column(Text)
    model_used: Mapped[str | None] = mapped_column(String(100))
    mode: Mapped[str] = mapped_column(String(20), comment="template | ollama")

    # ── Output bruto ──────────────────────────────────────────────
    raw_output: Mapped[str | None] = mapped_column(Text)

    # ── Output parseado ───────────────────────────────────────────
    parsed_hook: Mapped[str | None] = mapped_column(String(280))
    parsed_body: Mapped[str | None] = mapped_column(Text)
    parsed_cta: Mapped[str | None] = mapped_column(String(280))
    parsed_short_x: Mapped[str | None] = mapped_column(String(280))

    # ── Métricas ──────────────────────────────────────────────────
    token_estimate: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="complete", comment="pending | complete | failed")

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
