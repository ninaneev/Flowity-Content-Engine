from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.post import PostCreate, PostResponse
from app.schemas.source import SourceCreate, SourceUpdate, SourceResponse
from app.repositories import posts as post_repo
from app.repositories import sources as source_repo
from app.core.security import get_current_admin

router = APIRouter()


@router.get("/", response_model=list[SourceResponse])
def list_sources(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    sources = source_repo.get_all(db)
    usados = source_repo.used_ids(db)
    for s in sources:
        s.used = s.id in usados
    return sources


@router.post("/", response_model=SourceResponse, status_code=201)
def create_source(source: SourceCreate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    return source_repo.create(db, source)


@router.get("/{source_id}", response_model=SourceResponse)
def get_source(source_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    source = source_repo.get_by_id(db, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found.")
    source.used = source_id in source_repo.used_ids(db)
    return source


@router.put("/{source_id}", response_model=SourceResponse)
def update_source(source_id: int, source: SourceUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    updated = source_repo.update(db, source_id, source)
    if not updated:
        raise HTTPException(status_code=404, detail="Source not found.")
    updated.used = source_id in source_repo.used_ids(db)
    return updated


@router.post("/{source_id}/approve", response_model=PostResponse, status_code=201,
             summary="Turn a Library item into a post in To approve")
def approve_source(source_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Creates a to_approve post linked to the item: title becomes the hook, the item's text the draft body.

    A writer replaces the body with the real post later; linking it marks the item as used.
    """
    source = source_repo.get_by_id(db, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found.")
    post = post_repo.create(db, PostCreate(
        hook=source.title,
        body=source.content,
        status="to_approve",
        notes=f"From Library item #{source.id}. Body is the item's angle; a writer replaces it with the post text.",
        source_ids=[source.id],
    ))
    post.source_ids = [source.id]
    return post
