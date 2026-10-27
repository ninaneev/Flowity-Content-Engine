"""Textos editaveis do carrossel (GET/PUT /posts/{id}/slides).

A renderizacao PNG/PDF fica em POST /posts/{id}/render/carousel (routes/assets.py, Tarefa 8).
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.models.carousel_slide import CarouselSlide

from app.core.security import get_current_admin
from app.db.database import get_db
from app.repositories import posts as post_repo

router = APIRouter()
MIN_SLIDES, MAX_SLIDES, MAX_CHARS = 3, 10, 220


class CarouselSlidesUpdate(BaseModel):
    slides: list[str] = Field(min_length=MIN_SLIDES, max_length=MAX_SLIDES)


@router.get("/posts/{post_id}/slides", summary="Lista os textos editáveis do carrossel")
def list_carousel_slides(
    post_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    post = post_repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail={"code": "POST_NOT_FOUND", "message": "Post não encontrado."})
    rows = db.scalars(select(CarouselSlide).where(CarouselSlide.post_id == post_id).order_by(CarouselSlide.position)).all()
    if not rows:
        initial = [post.hook or "", post.body or "", post.cta or ""]
        initial = [text.strip()[:MAX_CHARS] for text in initial if text and text.strip()]
        while len(initial) < MIN_SLIDES:
            initial.append("Adicione o conteúdo deste slide.")
        initial = initial[:MAX_SLIDES]
        rows = [CarouselSlide(post_id=post_id, position=i + 1, slide_text=value) for i, value in enumerate(initial)]
        db.add_all(rows)
        db.commit()
        rows = db.scalars(select(CarouselSlide).where(CarouselSlide.post_id == post_id).order_by(CarouselSlide.position)).all()
    return {"post_id": post_id, "slides": [{"id": row.id, "position": row.position, "slide_text": row.slide_text} for row in rows]}


@router.put("/posts/{post_id}/slides", summary="Salva textos editáveis do carrossel")
def save_carousel_slides(
    post_id: int,
    payload: CarouselSlidesUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    post = post_repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail={"code": "POST_NOT_FOUND", "message": "Post não encontrado."})
    values = [value.strip() for value in payload.slides]
    if any(not value for value in values):
        raise HTTPException(status_code=422, detail={"code": "EMPTY_SLIDE", "message": "Preencha o texto de todos os slides."})
    if any(len(value) > MAX_CHARS for value in values):
        raise HTTPException(status_code=422, detail={"code": "SLIDE_TOO_LONG", "message": f"Cada slide pode ter até {MAX_CHARS} caracteres."})
    try:
        db.execute(delete(CarouselSlide).where(CarouselSlide.post_id == post_id))
        db.add_all([CarouselSlide(post_id=post_id, position=i + 1, slide_text=value) for i, value in enumerate(values)])
        db.commit()
    except Exception:
        db.rollback()
        raise
    return {"post_id": post_id, "slides": values, "total_slides": len(values)}
