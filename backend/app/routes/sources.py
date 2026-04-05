"""
╔══════════════════════════════════════════════════════════════════════╗
║  TAREFA DO INTEGRANTE 5 — API de Sources                           ║
║  Issue: #5 no GitHub Projects                                       ║
║  Branch: feat/issue-5-sources-api                                   ║
╚══════════════════════════════════════════════════════════════════════╝

O QUE VOCÊ VAI FAZER:
  Implementar as 4 rotas abaixo substituindo cada "raise HTTPException(501...)"
  pelo código real indicado nos comentários TODO.

COMO TESTAR:
  1. Suba o backend: docker compose up backend
  2. Abra: http://localhost:8000/docs
  3. Teste cada rota pelo Swagger UI (interface automática do FastAPI)

DÚVIDAS?
  - Veja app/repositories/sources.py — todas as funções já estão prontas
  - Veja app/schemas/source.py — os tipos de entrada/saída já estão definidos
  - Chame o líder do projeto se travar
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.source import SourceCreate, SourceUpdate, SourceResponse
from app.repositories import sources as source_repo

router = APIRouter()


# ══════════════════════════════════════════════════════════════
# ROTA 1 — Listar todas as sources
# Método: GET
# URL: /sources/
# O que retorna: lista de todas as sources no banco
# ══════════════════════════════════════════════════════════════
@router.get("/", response_model=list[SourceResponse])
def list_sources(db: Session = Depends(get_db)):
    # TODO: Substitua a linha abaixo por:
    #   return source_repo.get_all(db)
    raise HTTPException(status_code=501, detail="TODO Integrante 5: implementar list_sources")


# ══════════════════════════════════════════════════════════════
# ROTA 2 — Criar uma nova source
# Método: POST
# URL: /sources/
# O que recebe: JSON com os campos de SourceCreate
# O que retorna: a source criada com o ID
# ══════════════════════════════════════════════════════════════
@router.post("/", response_model=SourceResponse, status_code=201)
def create_source(source: SourceCreate, db: Session = Depends(get_db)):
    # TODO: Substitua a linha abaixo por:
    #   return source_repo.create(db, source)
    raise HTTPException(status_code=501, detail="TODO Integrante 5: implementar create_source")


# ══════════════════════════════════════════════════════════════
# ROTA 3 — Buscar uma source pelo ID
# Método: GET
# URL: /sources/{source_id}
# O que retorna: a source com esse ID (erro 404 se não existir)
# ══════════════════════════════════════════════════════════════
@router.get("/{source_id}", response_model=SourceResponse)
def get_source(source_id: int, db: Session = Depends(get_db)):
    # TODO: Substitua as linhas abaixo por:
    #   source = source_repo.get_by_id(db, source_id)
    #   if not source:
    #       raise HTTPException(status_code=404, detail="Source não encontrada")
    #   return source
    raise HTTPException(status_code=501, detail="TODO Integrante 5: implementar get_source")


# ══════════════════════════════════════════════════════════════
# ROTA 4 — Atualizar uma source
# Método: PUT
# URL: /sources/{source_id}
# O que recebe: JSON com os campos que quer atualizar (todos opcionais)
# O que retorna: a source atualizada
# ══════════════════════════════════════════════════════════════
@router.put("/{source_id}", response_model=SourceResponse)
def update_source(source_id: int, source: SourceUpdate, db: Session = Depends(get_db)):
    # TODO: Substitua as linhas abaixo por:
    #   updated = source_repo.update(db, source_id, source)
    #   if not updated:
    #       raise HTTPException(status_code=404, detail="Source não encontrada")
    #   return updated
    raise HTTPException(status_code=501, detail="TODO Integrante 5: implementar update_source")
