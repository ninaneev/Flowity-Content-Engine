from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.metric import MetricCreate, MetricResponse, MetricsSummary
from app.repositories import metrics as metric_repo
from app.repositories import posts as post_repo
from app.core.security import get_current_admin  # Ajuste o import do módulo de autenticação de admin

router = APIRouter()


@router.post(
    "/posts/{post_id}/metrics",
    response_model=MetricResponse,
    status_code=201,
    tags=["Metrics"]
)
def registrar_metrica(
    post_id: int,
    data: MetricCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Registro manual dos números lidos no LinkedIn ou no X."""
    if not post_repo.get_by_id(db, post_id):  # Retorna 404 caso o post não exista
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return metric_repo.create(db, post_id, data)


@router.get(
    "/metrics/summary",
    response_model=MetricsSummary,
    tags=["Metrics"]
)
def resumo_metricas(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin)
):
    """Retorna o resumo consolidado do engajamento e alcance por plataforma."""
    return metric_repo.get_summary(db)