"""Relatórios do PI 2 (Tarefa 16): tempo médio de produção por fluxo."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_admin
from app.db.database import get_db
from app.models.post import Post

router = APIRouter()


class DesempenhoFluxo(BaseModel):
    workflow: str                    # manual | pi1 | pi2
    publicacoes: int                 # posts com esse fluxo
    media_minutos: float | None      # média de external_minutes (None se ninguém registrou)


@router.get("/performance", response_model=list[DesempenhoFluxo])
def desempenho_por_fluxo(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Tempo médio gasto fora da ferramenta, por fluxo de produção.

    Só entram posts com `workflow` preenchido. `media_minutos` ignora posts sem
    `external_minutes` (o AVG do SQL já descarta NULL).
    """
    linhas = (
        db.query(
            Post.workflow,
            func.count(Post.id).label("publicacoes"),
            func.avg(Post.external_minutes).label("media_minutos"),
        )
        .filter(Post.workflow.isnot(None))
        .group_by(Post.workflow)
        .order_by(Post.workflow)
        .all()
    )
    return [
        DesempenhoFluxo(
            workflow=l.workflow,
            publicacoes=l.publicacoes,
            media_minutos=round(float(l.media_minutos), 1) if l.media_minutos is not None else None,
        )
        for l in linhas
    ]
