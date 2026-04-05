"""Modelo ORM da tabela posts."""
from datetime import datetime
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # ── Conteúdo ──────────────────────────────────────────────────
    hook: Mapped[str] = mapped_column(String(280), nullable=False, comment="Título/gancho do post")
    body: Mapped[str | None] = mapped_column(Text)
    cta: Mapped[str | None] = mapped_column(String(280), comment="Call to action")
    short_x: Mapped[str | None] = mapped_column(String(280), comment="Versão curta para X/Twitter")
    alt_title: Mapped[str | None] = mapped_column(String(280), comment="Título alternativo")

    # ── Canal e configurações ─────────────────────────────────────
    channel: Mapped[str] = mapped_column(String(20), default="linkedin", comment="linkedin | x")
    tone: Mapped[str | None] = mapped_column(String(50), comment="estratégico | educativo | inspiracional | direto")
    objective: Mapped[str | None] = mapped_column(String(100))
    format: Mapped[str | None] = mapped_column(String(50), comment="lista | narrativa | pergunta | dado")

    # ── Status e datas ────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20), default="idea",
        comment="idea | draft | revised | scheduled | publishing | published | failed"
    )
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime)
    published_at: Mapped[datetime | None] = mapped_column(DateTime)

    # ── Geração ───────────────────────────────────────────────────
    generation_mode: Mapped[str | None] = mapped_column(String(20), comment="template | ollama | manual")
    notes: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
