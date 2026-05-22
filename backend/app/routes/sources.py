from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.source import SourceCreate, SourceUpdate, SourceResponse
from app.repositories import sources as source_repo
from app.core.security import get_current_admin

router = APIRouter()


@router.get("/", response_model=list[SourceResponse])
def list_sources(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    return source_repo.get_all(db)


@router.post("/", response_model=SourceResponse, status_code=201)
def create_source(source: SourceCreate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    return source_repo.create(db, source)


@router.get("/{source_id}", response_model=SourceResponse)
def get_source(source_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    source = source_repo.get_by_id(db, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source não encontrada")
    return source


@router.put("/{source_id}", response_model=SourceResponse)
def update_source(source_id: int, source: SourceUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    updated = source_repo.update(db, source_id, source)
    if not updated:
        raise HTTPException(status_code=404, detail="Source não encontrada")
    return updated
