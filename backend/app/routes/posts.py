import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.post import PostCreate, PostUpdate, PostResponse, CalendarPost
from app.repositories import posts as post_repo
from app.repositories import post_assets as asset_repo
from app.core.config import settings
from app.core.security import get_current_admin

router = APIRouter()

STATUS_QUE_EXIGEM_ACESSIBILIDADE = {"scheduled", "published"}


def _garantir_acessibilidade(db, post_id: int, novo_status: str | None) -> None:
    """Blocks scheduling/publishing a post with an image that has no valid alt text.

    Basis: Brazilian Law 13.146/2015, art. 63, and eMAG, recommendation 3.6.
    """
    if novo_status not in STATUS_QUE_EXIGEM_ACESSIBILIDADE:
        return
    pendentes = asset_repo.sem_alt_text_valido(db, post_id)
    if pendentes:
        raise HTTPException(status_code=422, detail={"error": {
            "code": "acessibilidade_pendente",
            "message": f"{len(pendentes)} image(s) without valid alt text.",
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

    # This used to be one source_ids query per post (N+1): ~13 s with 55 posts on Supabase.
    source_ids = post_repo.get_source_ids_map(db, [p.id for p in posts])
    for post in posts:
        post.source_ids = source_ids.get(post.id, [])

    return posts


@router.post("/", response_model=PostResponse, status_code=201)
def create_post(post: PostCreate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    new_post = post_repo.create(db, post)
    new_post.source_ids = post_repo.get_source_ids(db, new_post.id)

    return new_post


@router.get("/calendar", response_model=list[CalendarPost])
def get_calendar(
    month: str = Query(..., description="Format: YYYY-MM"),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    try:
        year, m = map(int, month.split("-"))
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="month must be YYYY-MM, e.g. 2025-06",
        )

    return post_repo.get_for_calendar(db, year, m)


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    post = post_repo.get_by_id(db, post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.source_ids = post_repo.get_source_ids(db, post_id)

    return post


@router.put("/{post_id}", response_model=PostResponse)
@router.patch("/{post_id}", response_model=PostResponse, summary="Update some of the post fields")
def update_post(post_id: int, post: PostUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    if "status" in post.model_fields_set:
        _garantir_acessibilidade(db, post_id, post.status)
    updated = post_repo.update(db, post_id, post)

    if not updated:
        raise HTTPException(status_code=404, detail="Post not found")

    updated.source_ids = post_repo.get_source_ids(db, post_id)

    return updated


def _remove_post_media(file_paths: list[str], post_id: int) -> None:
    """Removes the post's image files and its media folder (carousel PDFs).

    Only touches paths that resolve inside MEDIA_DIR; any file error is ignored because the
    database rows are already gone and leftover files are harmless.
    """
    root = Path(settings.MEDIA_DIR).expanduser().resolve()
    for relative in file_paths:
        try:
            path = (root / relative).resolve()
            if root in path.parents:
                path.unlink(missing_ok=True)
        except OSError:
            pass
    folder = (root / "posts" / str(post_id)).resolve()
    if root in folder.parents and folder.is_dir():
        shutil.rmtree(folder, ignore_errors=True)


@router.delete("/{post_id}", status_code=204, summary="Delete a post, its images and its metrics")
def delete_post(post_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    post = post_repo.get_by_id(db, post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.status == "publishing":
        raise HTTPException(
            status_code=409,
            detail="A post that is being published cannot be deleted. Wait until publishing finishes.",
        )

    file_paths = [asset.file_path for asset in asset_repo.list_by_post(db, post_id)]
    post_repo.delete(db, post)
    _remove_post_media(file_paths, post_id)
