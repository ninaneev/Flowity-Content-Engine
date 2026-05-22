"""
Rotas para automação via n8n.
O n8n consulta /automation/posts/ready, tenta publicar,
e chama os webhooks de resultado.
"""
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
    """Verifica que a chamada veio do n8n autorizado."""
    if x_webhook_secret != settings.N8N_WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Webhook secret inválido.")


# ── Endpoint que o n8n consulta ───────────────────────────────────────────────
@router.get("/posts/ready", response_model=list[PostResponse])
def get_ready_posts(
    db: Session = Depends(get_db),
    _: str = Depends(_verify_n8n_secret),
):
    """
    Retorna posts agendados cujo scheduled_at já passou.
    O n8n chama isso a cada 5 minutos.
    """
    posts = post_repo.get_ready_to_publish(db)
    for post in posts:
        post.source_ids = post_repo.get_source_ids(db, post.id)
    return posts


# ── n8n avisa que está tentando publicar ─────────────────────────────────────
@router.post("/posts/{post_id}/publish-attempt", response_model=PostResponse)
def publish_attempt(
    post_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(_verify_n8n_secret),
):
    """
    O n8n chama isso antes de tentar publicar.
    Muda status para 'publishing' para evitar tentativas duplicadas.
    """
    post = post_repo.mark_publishing(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado.")
    post.source_ids = post_repo.get_source_ids(db, post_id)
    return post


# ── n8n avisa o resultado da publicação ──────────────────────────────────────
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
    """
    O n8n chama isso com o resultado da tentativa de publicação.
    - success=true → status vira 'published'
    - success=false → status vira 'failed'
    - simulated=true → é uma simulação (MVP)
    """
    if result.success:
        post = post_repo.mark_published(db, post_id)
    else:
        post = post_repo.mark_failed(db, post_id, result.error_message)

    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado.")

    simulated_note = " [SIMULADO]" if result.simulated else ""
    print(f"[automation] Post {post_id} → {'published' if result.success else 'failed'}{simulated_note}")

    post.source_ids = post_repo.get_source_ids(db, post_id)
    return post


# ── Config da automação ───────────────────────────────────────────────────────
@router.get("/config")
def get_automation_config(_admin=Depends(get_current_admin)):
    """Retorna a config atual da automação para exibir na tela Settings."""
    return {
        "ollama_base_url": settings.OLLAMA_BASE_URL,
        "ollama_model": settings.OLLAMA_MODEL,
        "n8n_configured": bool(settings.N8N_WEBHOOK_SECRET),
    }
