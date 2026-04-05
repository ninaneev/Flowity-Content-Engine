"""
╔══════════════════════════════════════════════════════════════════════╗
║  TAREFA DO INTEGRANTE 6 — API de Posts                             ║
║  Issue: #6 no GitHub Projects                                       ║
║  Branch: feat/issue-6-posts-api                                     ║
╚══════════════════════════════════════════════════════════════════════╝

O QUE VOCÊ VAI FAZER:
  Implementar as 5 rotas abaixo substituindo cada "raise HTTPException(501...)"
  pelo código real indicado nos comentários TODO.

COMO TESTAR:
  1. Suba o backend: docker compose up backend
  2. Abra: http://localhost:8000/docs
  3. Crie uma source primeiro (rota POST /sources/) pois posts referenciam sources
  4. Depois teste as rotas de posts

DÚVIDAS?
  - Veja app/repositories/posts.py — todas as funções já estão prontas
  - Veja app/schemas/post.py — os tipos de entrada/saída já estão definidos
  - Para GET /posts/calendar: recebe ?month=2025-06, retorna posts daquele mês
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.post import PostCreate, PostUpdate, PostResponse, CalendarPost
from app.repositories import posts as post_repo

router = APIRouter()


# ══════════════════════════════════════════════════════════════
# ROTA 1 — Listar posts (com filtros opcionais)
# Método: GET
# URL: /posts/?status=draft&channel=linkedin
# Parâmetros: status (opcional), channel (opcional)
# ══════════════════════════════════════════════════════════════
@router.get("/", response_model=list[PostResponse])
def list_posts(
    status: str | None = Query(None),
    channel: str | None = Query(None),
    db: Session = Depends(get_db),
):
    # TODO: Substitua a linha abaixo por:
    #   posts = post_repo.get_all(db, status=status, channel=channel)
    #   for post in posts:
    #       post.source_ids = post_repo.get_source_ids(db, post.id)
    #   return posts
    raise HTTPException(status_code=501, detail="TODO Integrante 6: implementar list_posts")


# ══════════════════════════════════════════════════════════════
# ROTA 2 — Criar um post
# Método: POST
# URL: /posts/
# O que recebe: JSON com hook, body, cta, channel, source_ids, etc.
# ══════════════════════════════════════════════════════════════
@router.post("/", response_model=PostResponse, status_code=201)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    # TODO: Substitua as linhas abaixo por:
    #   new_post = post_repo.create(db, post)
    #   new_post.source_ids = post_repo.get_source_ids(db, new_post.id)
    #   return new_post
    raise HTTPException(status_code=501, detail="TODO Integrante 6: implementar create_post")


# ══════════════════════════════════════════════════════════════
# ROTA 3 — Buscar post por ID
# Método: GET
# URL: /posts/{post_id}
# ══════════════════════════════════════════════════════════════
@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    # TODO: Substitua as linhas abaixo por:
    #   post = post_repo.get_by_id(db, post_id)
    #   if not post:
    #       raise HTTPException(status_code=404, detail="Post não encontrado")
    #   post.source_ids = post_repo.get_source_ids(db, post_id)
    #   return post
    raise HTTPException(status_code=501, detail="TODO Integrante 6: implementar get_post")


# ══════════════════════════════════════════════════════════════
# ROTA 4 — Atualizar um post
# Método: PUT
# URL: /posts/{post_id}
# O que recebe: campos que quer atualizar (todos opcionais)
# ══════════════════════════════════════════════════════════════
@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post: PostUpdate, db: Session = Depends(get_db)):
    # TODO: Substitua as linhas abaixo por:
    #   updated = post_repo.update(db, post_id, post)
    #   if not updated:
    #       raise HTTPException(status_code=404, detail="Post não encontrado")
    #   updated.source_ids = post_repo.get_source_ids(db, post_id)
    #   return updated
    raise HTTPException(status_code=501, detail="TODO Integrante 6: implementar update_post")


# ══════════════════════════════════════════════════════════════
# ROTA 5 — Posts do calendário por mês
# Método: GET
# URL: /posts/calendar?month=2025-06
# O que retorna: lista compacta de posts agendados naquele mês
# ══════════════════════════════════════════════════════════════
@router.get("/calendar", response_model=list[CalendarPost])
def get_calendar(month: str = Query(..., description="Formato: YYYY-MM"), db: Session = Depends(get_db)):
    # TODO: Substitua as linhas abaixo por:
    #   try:
    #       year, m = map(int, month.split("-"))
    #   except ValueError:
    #       raise HTTPException(status_code=400, detail="month deve ser YYYY-MM, ex: 2025-06")
    #   return post_repo.get_for_calendar(db, year, m)
    raise HTTPException(status_code=501, detail="TODO Integrante 6: implementar get_calendar")
