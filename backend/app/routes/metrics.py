from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func  # Para usar func.extract e func.avg
from sqlalchemy.orm import Session

from app.core.security import get_current_admin  # Autenticação de admin
from app.db.database import get_db

# Imports dos modelos diretamente de seus arquivos
from app.models.post import Post
from app.models.post_metric import PostMetric

from app.repositories import metrics as metric_repo
from app.repositories import posts as post_repo
from app.schemas.metric import MetricCreate, MetricResponse, MetricsSummary

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
    # Obtém o resumo de métricas pré-calculado do repositório
    resumo = metric_repo.get_summary(db)

    # Consulta posts publicados e suas respectivas métricas
    posts_com_metricas = (
        db.query(Post.published_at, PostMetric)
        .join(PostMetric, Post.id == PostMetric.post_id)
        .filter(Post.published_at.isnot(None))
        .all()
    )

    # Agrupa as taxas de engajamento pelo dia da semana (0 = Domingo, 6 = Sábado)
    agrupado = {}
    for pub_at, pm in posts_com_metricas:
        dow = (pub_at.weekday() + 1) % 7
        rate = pm.engagement_rate

        if dow not in agrupado:
            agrupado[dow] = []
        agrupado[dow].append(rate)

    # Calcula a média do engajamento para cada dia com registros
    dados_dias = []
    for dow, taxas in agrupado.items():
        media = sum(taxas) / len(taxas) if taxas else 0.0
        dados_dias.append({
            "dia": int(dow),
            "media": round(float(media), 4)
        })

    # Prepara a estrutura de retorno compatível com a resposta do repositório
    if isinstance(resumo, dict):
        resumo["por_dia_semana"] = dados_dias
        return resumo

    if hasattr(resumo, "model_dump"):
        resumo_dict = resumo.model_dump()
    elif hasattr(resumo, "dict"):
        resumo_dict = resumo.dict()
    else:
        resumo_dict = dict(resumo)

    resumo_dict["por_dia_semana"] = dados_dias
    return resumo_dict