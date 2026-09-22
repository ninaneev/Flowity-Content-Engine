from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.post import PostCreate, PostUpdate, PostResponse, CalendarPost
from app.repositories import posts as post_repo
from app.repositories import post_assets as asset_repo
from app.core.security import get_current_admin

router = APIRouter()

STATUS_QUE_EXIGEM_ACESSIBILIDADE = {"scheduled", "published"}


def _garantir_acessibilidade(db, post_id: int, novo_status: str | None) -> None:
    """Bloqueia agendar/publicar post com imagem sem texto alternativo válido.

    Base: Lei 13.146/2015, art. 63, e eMAG, recomendação 3.6.
    """
    if novo_status not in STATUS_QUE_EXIGEM_ACESSIBILIDADE:
        return
    pendentes = asset_repo.sem_alt_text_valido(db, post_id)
    if pendentes:
        raise HTTPException(status_code=422, detail={"error": {
            "code": "acessibilidade_pendente",
            "message": f"{len(pendentes)} imagem(ns) sem texto alternativo válido.",
            "field": "assets.alt_text",
            "asset_ids": [a.id for a in pendentes]}})


@router.get("/", response_model=list[PostResponse])
def list_posts(
    status: str | None = Query(None),
    channel: str | None = Query(None),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    posts = post_repo.get_all(db, status=status, channel=channel)

    for post in posts:
        post.source_ids = post_repo.get_source_ids(db, post.id)

    return posts


@router.post("/", response_model=PostResponse, status_code=201)
def create_post(post: PostCreate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    new_post = post_repo.create(db, post)
    new_post.source_ids = post_repo.get_source_ids(db, new_post.id)

    return new_post


@router.get("/calendar", response_model=list[CalendarPost])
def get_calendar(
    month: str = Query(..., description="Formato: YYYY-MM"),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    try:
        year, m = map(int, month.split("-"))
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="month deve ser YYYY-MM, ex: 2025-06",
        )

    return post_repo.get_for_calendar(db, year, m)


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    post = post_repo.get_by_id(db, post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")

    post.source_ids = post_repo.get_source_ids(db, post_id)

    return post


@router.put("/{post_id}", response_model=PostResponse)
@router.patch("/{post_id}", response_model=PostResponse, summary="Atualiza parte dos campos do post")
def update_post(post_id: int, post: PostUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    if "status" in post.model_fields_set:
        _garantir_acessibilidade(db, post_id, post.status)
    updated = post_repo.update(db, post_id, post)

    if not updated:
        raise HTTPException(status_code=404, detail="Post não encontrado")

    updated.source_ids = post_repo.get_source_ids(db, post_id)

    return updated