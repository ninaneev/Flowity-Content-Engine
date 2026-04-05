"""Operações CRUD para posts e post_sources. Usado pelos integrantes 6 e 7."""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.post import Post
from app.models.generation import PostSource
from app.schemas.post import PostCreate, PostUpdate


def get_all(db: Session, status: str | None = None, channel: str | None = None) -> list[Post]:
    """Lista posts com filtros opcionais de status e canal."""
    q = db.query(Post)
    if status:
        q = q.filter(Post.status == status)
    if channel:
        q = q.filter(Post.channel == channel)
    return q.order_by(Post.created_at.desc()).all()


def get_by_id(db: Session, post_id: int) -> Post | None:
    return db.query(Post).filter(Post.id == post_id).first()


def get_for_calendar(db: Session, year: int, month: int) -> list[Post]:
    """Retorna posts agendados em um dado mês para o calendário."""
    from sqlalchemy import extract
    return (
        db.query(Post)
        .filter(
            extract("year", Post.scheduled_at) == year,
            extract("month", Post.scheduled_at) == month,
        )
        .order_by(Post.scheduled_at)
        .all()
    )


def get_source_ids(db: Session, post_id: int) -> list[int]:
    """Retorna os IDs das sources associadas a um post."""
    rows = db.query(PostSource.source_id).filter(PostSource.post_id == post_id).all()
    return [r.source_id for r in rows]


def create(db: Session, data: PostCreate) -> Post:
    """Cria post e liga às sources fornecidas."""
    post_data = data.model_dump(exclude={"source_ids"})
    post = Post(**post_data)
    db.add(post)
    db.flush()  # Garante que post.id existe antes de criar post_sources

    for sid in data.source_ids:
        db.add(PostSource(post_id=post.id, source_id=sid))

    db.commit()
    db.refresh(post)
    return post


def update(db: Session, post_id: int, data: PostUpdate) -> Post | None:
    post = get_by_id(db, post_id)
    if not post:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(post, key, value)
    db.commit()
    db.refresh(post)
    return post


def get_ready_to_publish(db: Session) -> list[Post]:
    """Posts agendados com scheduled_at no passado. Usado pelo n8n."""
    return (
        db.query(Post)
        .filter(Post.status == "scheduled", Post.scheduled_at <= datetime.utcnow())
        .all()
    )


def mark_publishing(db: Session, post_id: int) -> Post | None:
    """Muda status para 'publishing' quando o n8n tenta publicar."""
    return update(db, post_id, PostUpdate(status="publishing"))


def mark_published(db: Session, post_id: int) -> Post | None:
    """Muda status para 'published' e registra a data de publicação."""
    post = get_by_id(db, post_id)
    if not post:
        return None
    post.status = "published"
    post.published_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return post


def mark_failed(db: Session, post_id: int, reason: str | None = None) -> Post | None:
    """Muda status para 'failed'. O motivo pode ser guardado em notes."""
    post = get_by_id(db, post_id)
    if not post:
        return None
    post.status = "failed"
    if reason:
        post.notes = f"[FALHA] {reason}"
    db.commit()
    db.refresh(post)
    return post
