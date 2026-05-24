"""Routes used by n8n automation workflows."""
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.post import PostResponse
from app.repositories import posts as post_repo
from app.core.config import settings
from app.core.security import get_current_admin

router = APIRouter()


def _verify_n8n_secret(x_webhook_secret: str = Header(...)):
    """Verify that the request came from the authorized n8n workflow."""
    if x_webhook_secret != settings.N8N_WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Invalid webhook secret.")


@router.get("/posts/ready", response_model=list[PostResponse])
def get_ready_posts(
    db: Session = Depends(get_db),
    _: str = Depends(_verify_n8n_secret),
):
    """Return scheduled posts whose scheduled_at timestamp has passed."""
    posts = post_repo.get_ready_to_publish(db)
    for post in posts:
        post.source_ids = post_repo.get_source_ids(db, post.id)
    return posts


@router.post("/posts/{post_id}/publish-attempt", response_model=PostResponse)
def publish_attempt(
    post_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(_verify_n8n_secret),
):
    """Mark a post as publishing before n8n attempts publication."""
    post = post_repo.mark_publishing(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")
    post.source_ids = post_repo.get_source_ids(db, post_id)
    return post


class PublishResult(BaseModel):
    success: bool
    simulated: bool = False
    error_message: str | None = None


@router.post("/posts/{post_id}/publish-result", response_model=PostResponse)
def publish_result(
    post_id: int,
    result: PublishResult,
    db: Session = Depends(get_db),
    _: str = Depends(_verify_n8n_secret),
):
    """Record the result of an n8n publication attempt."""
    if result.success:
        post = post_repo.mark_published(db, post_id)
    else:
        post = post_repo.mark_failed(db, post_id, result.error_message)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    simulated_note = " [SIMULATED]" if result.simulated else ""
    print(f"[automation] Post {post_id} -> {'published' if result.success else 'failed'}{simulated_note}")

    post.source_ids = post_repo.get_source_ids(db, post_id)
    return post


@router.get("/config")
def get_automation_config(_admin=Depends(get_current_admin)):
    """Return local automation configuration for the Settings page."""
    return {
        "n8n_configured": bool(settings.N8N_WEBHOOK_SECRET),
        "ollama_base_url": settings.OLLAMA_BASE_URL,
        "ollama_model": settings.OLLAMA_MODEL,
    }
