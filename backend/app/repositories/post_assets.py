"""Operacoes de persistencia para assets de posts."""

from sqlalchemy.orm import Session

from app.models.post_asset import PostAsset
from app.schemas.post_asset import PostAssetUpdate
from app.services.accessibility import alt_text_valido


def create(
    db: Session,
    *,
    post_id: int,
    file_path: str,
    mime_type: str,
    alt_text: str,
    caption: str | None,
    kind: str,
    size_bytes: int,
    width: int | None = None,
    height: int | None = None,
    position: int = 0,
) -> PostAsset:
    asset = PostAsset(
        post_id=post_id,
        file_path=file_path,
        mime_type=mime_type,
        alt_text=alt_text,
        caption=caption,
        kind=kind,
        size_bytes=size_bytes,
        width=width,
        height=height,
        position=position,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


def list_by_post(db: Session, post_id: int) -> list[PostAsset]:
    return (
        db.query(PostAsset)
        .filter(PostAsset.post_id == post_id)
        .order_by(PostAsset.position, PostAsset.id)
        .all()
    )


def get_by_id(db: Session, asset_id: int) -> PostAsset | None:
    return db.query(PostAsset).filter(PostAsset.id == asset_id).first()


def update(db: Session, asset: PostAsset, data: PostAssetUpdate) -> PostAsset:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(asset, key, value)
    db.commit()
    db.refresh(asset)
    return asset


def reorder(db: Session, post_id: int, asset_ids: list[int]) -> list[PostAsset]:
    assets = list_by_post(db, post_id)
    current_ids = {asset.id for asset in assets}
    requested_ids = set(asset_ids)
    if len(asset_ids) != len(current_ids) or requested_ids != current_ids:
        raise ValueError("asset_ids deve conter exatamente os assets do post")

    assets_by_id = {asset.id: asset for asset in assets}
    for position, asset_id in enumerate(asset_ids):
        assets_by_id[asset_id].position = position

    db.commit()
    return list_by_post(db, post_id)


def delete(db: Session, asset: PostAsset) -> None:
    db.delete(asset)
    db.commit()


def next_position(db: Session, post_id: int) -> int:
    asset = (
        db.query(PostAsset)
        .filter(PostAsset.post_id == post_id)
        .order_by(PostAsset.position.desc())
        .first()
    )
    return asset.position + 1 if asset else 0


def sem_alt_text_valido(db: Session, post_id: int) -> list[PostAsset]:
    """Assets do post cujo alt_text reprova na regra de acessibilidade."""
    return [asset for asset in list_by_post(db, post_id) if not alt_text_valido(asset.alt_text)]
