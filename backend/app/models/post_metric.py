from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class PostMetric(Base):
  """Cada linha é uma coleta de métricas de um post em uma plataforma."""

  __tablename__ = "post_metrics"

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  post_id: Mapped[int] = mapped_column(
      ForeignKey("posts.id", ondelete="CASCADE"), index=True, nullable=False
  )
  platform: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
  impressions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
  likes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
  comments: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
  shares: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
  clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
  collected_at: Mapped[datetime] = mapped_column(
      DateTime, nullable=False, index=True
  )
  source: Mapped[str] = mapped_column(String(20), default="manual", nullable=False)
  created_at: Mapped[datetime] = mapped_column(
      DateTime, server_default=func.now()
  )

  post: Mapped["Post"] = relationship("Post", back_populates="metrics")

  @property
  def engagement_rate(self) -> float:
    if not self.impressions:
      return 0.0
    return (self.likes + self.comments + self.shares) / self.impressions