"""Modelo ORM da tabela alert_settings (PI 2, Tarefa 14)."""
from datetime import datetime

from sqlalchemy import DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

LIMITE_PADRAO = 0.02  # 2%


class AlertSetting(Base):
    """Uma única linha com o limite mínimo de engajamento que dispara o alerta."""

    __tablename__ = "alert_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    min_engagement_rate: Mapped[float] = mapped_column(
        Float, default=LIMITE_PADRAO, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
