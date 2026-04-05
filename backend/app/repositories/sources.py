"""Operações CRUD para a tabela sources. Usado pelos integrantes 5 e 7."""
from sqlalchemy.orm import Session
from app.models.source import Source
from app.schemas.source import SourceCreate, SourceUpdate


def get_all(db: Session) -> list[Source]:
    """Retorna todas as sources ordenadas pela mais recente."""
    return db.query(Source).order_by(Source.created_at.desc()).all()


def get_by_id(db: Session, source_id: int) -> Source | None:
    """Retorna uma source pelo ID, ou None se não existir."""
    return db.query(Source).filter(Source.id == source_id).first()


def create(db: Session, data: SourceCreate) -> Source:
    """Cria uma nova source no banco."""
    source = Source(**data.model_dump())
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


def update(db: Session, source_id: int, data: SourceUpdate) -> Source | None:
    """Atualiza campos de uma source. Retorna None se não existir."""
    source = get_by_id(db, source_id)
    if not source:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(source, key, value)
    db.commit()
    db.refresh(source)
    return source


def get_many_by_ids(db: Session, ids: list[int]) -> list[Source]:
    """Busca múltiplas sources por lista de IDs. Usado pelo generator."""
    return db.query(Source).filter(Source.id.in_(ids)).all()
