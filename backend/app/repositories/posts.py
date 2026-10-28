"""Operações CRUD para posts e post_sources. Usado pelos integrantes 6 e 7."""
from datetime import datetime, timezone
from sqlalchemy.orm import Session, noload
from app.models.post import Post
from app.models.generation import PostSource
from app.schemas.post import PostCreate, PostUpdate


def get_all(db: Session, status: str | None = None, channel: str | None = None) -> list[Post]:
    """Lista posts com filtros opcionais de status e canal.

    A lista não devolve imagens nem métricas (o PostResponse não tem esses campos), então os
    relacionamentos não são carregados: cada carga extra é mais uma ida e volta ao Supabase.
    """
    q = db.query(Post).options(noload(Post.assets), noload(Post.metrics))
    if status:
        q = q.filter(Post.status == status)
    if channel:
        q = q.filter(Post.channel == channel)
    return q.order_by(Post.created_at.desc()).all()


def get_by_id(db: Session, post_id: int) -> Post | None:
    return db.query(Post).filter(Post.id == post_id).first()


# Status que aparecem no calendário: o que está agendado e o que já saiu
NO_CALENDARIO = ("scheduled", "publishing", "published", "failed")
# Status que viram "scheduled" quando ganham data (data no calendário = agendado)
ANTES_DE_AGENDAR = ("idea", "draft", "revised")


def _futura(quando: datetime) -> bool:
    agora = datetime.now(timezone.utc)
    if quando.tzinfo is None:  # SQLite devolve sem fuso; o app grava em UTC
        quando = quando.replace(tzinfo=timezone.utc)
    return quando > agora


def _data_define_status(post: Post, data_antes, status_mudou: bool) -> None:
    """Calendário e pipeline são a mesma coisa: pôr data agenda, tirar a data desagenda.

    Só reage quando a data mudou nesta requisição. Data no passado não agenda sozinha,
    senão o Make publicaria na hora um rascunho antigo. Mover o card de coluna no pipeline
    (status trocado sem mexer na data) continua valendo como o usuário escolheu.
    """
    if post.scheduled_at == data_antes:
        return
    if post.scheduled_at is not None and post.status in ANTES_DE_AGENDAR and _futura(post.scheduled_at):
        post.status = "scheduled"
    elif post.scheduled_at is None and post.status == "scheduled" and not status_mudou:
        post.status = "revised"


def get_for_calendar(db: Session, year: int, month: int) -> list[Post]:
    """Retorna os posts agendados ou já publicados com data no mês do calendário.

    A janela vai um dia além de cada ponta porque scheduled_at é guardado em UTC e a tela
    mostra no fuso do navegador; a tela descarta o que cair fora do mês.
    """
    from datetime import timedelta

    inicio = datetime(year, month, 1) - timedelta(days=1)
    fim = (datetime(year + (month == 12), month % 12 + 1, 1)) + timedelta(days=1)
    return (
        db.query(Post)
        .options(noload(Post.assets), noload(Post.metrics))
        .filter(
            Post.scheduled_at.isnot(None),
            Post.status.in_(NO_CALENDARIO),
            Post.scheduled_at >= inicio,
            Post.scheduled_at < fim,
        )
        .order_by(Post.scheduled_at)
        .all()
    )


def get_source_ids(db: Session, post_id: int) -> list[int]:
    """Retorna os IDs das sources associadas a um post."""
    rows = db.query(PostSource.source_id).filter(PostSource.post_id == post_id).all()
    return [r.source_id for r in rows]


def get_source_ids_map(db: Session, post_ids: list[int]) -> dict[int, list[int]]:
    """IDs das sources de vários posts numa consulta só (evita N+1 na listagem)."""
    mapa: dict[int, list[int]] = {pid: [] for pid in post_ids}
    if not post_ids:
        return mapa
    rows = (
        db.query(PostSource.post_id, PostSource.source_id)
        .filter(PostSource.post_id.in_(post_ids))
        .order_by(PostSource.id)
        .all()
    )
    for r in rows:
        mapa.setdefault(r.post_id, []).append(r.source_id)
    return mapa


def create(db: Session, data: PostCreate) -> Post:
    """Cria post e liga às sources fornecidas."""
    post_data = data.model_dump(exclude={"source_ids"})
    post = Post(**post_data)
    _data_define_status(post, None, status_mudou=True)
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
    data_antes, status_antes = post.scheduled_at, post.status
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(post, key, value)
    _data_define_status(post, data_antes, status_mudou=post.status != status_antes)
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
