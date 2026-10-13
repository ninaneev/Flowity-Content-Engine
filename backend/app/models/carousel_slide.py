"""Modelo ORM para textos editáveis dos slides de carrossel."""
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class CarouselSlide(Base):
    __tablename__ = "carousel_slides"
    __table_args__ = (UniqueConstraint("post_id", "position", name="uq_carousel_slides_post_position"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    slide_text: Mapped[str] = mapped_column(String(220), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
