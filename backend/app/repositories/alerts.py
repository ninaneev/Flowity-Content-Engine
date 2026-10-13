"""Persistência do limite de alerta e cálculo dos posts abaixo dele (PI 2, Tarefa 14)."""
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.alert_setting import LIMITE_PADRAO, AlertSetting
from app.models.post_metric import PostMetric
from app.schemas.alert import AlertRead


def get_settings(db: Session) -> AlertSetting:
    """Devolve a configuração; cria a linha padrão (2%) se ainda não existir."""
    config = db.query(AlertSetting).order_by(AlertSetting.id).first()
    if config is None:
        config = AlertSetting(min_engagement_rate=LIMITE_PADRAO)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


def update_settings(db: Session, min_engagement_rate: float) -> AlertSetting:
    config = get_settings(db)
    config.min_engagement_rate = min_engagement_rate
    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    return config


def list_alerts(db: Session) -> list[AlertRead]:
    """Posts cuja coleta mais recente ficou abaixo do limite.

    engagement_rate é uma @property do PostMetric (não é coluna), então o filtro
    é feito em Python, e não com PostMetric.engagement_rate < limite no SQL.
    Considera só a coleta mais recente de cada post por plataforma (mesma regra
    do /metrics/summary) e ignora coletas com 0 impressões, que não têm taxa.
    """
    limite = get_settings(db).min_engagement_rate
    metricas = db.query(PostMetric).order_by(PostMetric.collected_at.asc()).all()

    mais_recentes: dict[tuple[int, str], PostMetric] = {}
    for m in metricas:
        mais_recentes[(m.post_id, m.platform)] = m

    alertas = [
        AlertRead(
            post_id=m.post_id,
            hook=m.post.hook,
            channel=m.post.channel,
            platform=m.platform,
            engagement_rate=round(m.engagement_rate, 4),
            published_at=m.post.published_at,
        )
        for m in mais_recentes.values()
        if m.impressions > 0 and m.engagement_rate < limite
    ]
    alertas.sort(key=lambda a: a.published_at or datetime.min, reverse=True)
    return alertas
