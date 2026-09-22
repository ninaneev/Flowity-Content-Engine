"""Rotas de alerta de engajamento baixo (PI 2, Tarefa 14)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_admin
from app.db.database import get_db
from app.repositories import alerts as repo
from app.schemas.alert import AlertRead, AlertSettingRead, AlertSettingUpdate

router = APIRouter()


@router.get("/settings/alerts", response_model=AlertSettingRead)
def ler_configuracao(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Limite mínimo de engajamento. Se ninguém configurou, devolve o padrão de 2%."""
    return repo.get_settings(db)


@router.put("/settings/alerts", response_model=AlertSettingRead)
def salvar_configuracao(
    data: AlertSettingUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Grava o novo limite (fração entre 0 e 1: 0.02 = 2%)."""
    return repo.update_settings(db, data.min_engagement_rate)


@router.get("/alerts", response_model=list[AlertRead])
def listar_alertas(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Posts publicados cuja taxa de engajamento ficou abaixo do limite."""
    return repo.list_alerts(db)
