"""Endpoints de upload e gerenciamento de imagens de posts."""

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_admin
from app.db.database import get_db
from app.repositories import post_assets as asset_repo
from app.repositories import posts as post_repo
from app.schemas.post_asset import AltTextIn, AssetOrderUpdate, PostAssetResponse, PostAssetUpdate
from app.services.accessibility import ALT_MAX, ALT_MIN, AltTextInvalido, validar_alt_text

router = APIRouter()

ALLOWED_MIME = {mime.strip() for mime in settings.ALLOWED_IMAGE_MIME.split(",") if mime.strip()}
EXTENSIONS_BY_MIME = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
}


def _error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"code": code, "message": message},
    )


def _mensagem_alt_text(erro: ValidationError) -> str:
    """Traduz o erro do AltTextIn para a mensagem em português da regra."""
    for item in erro.errors():
        causa = (item.get("ctx") or {}).get("error")
        if isinstance(causa, AltTextInvalido):
            return str(causa)
    return f"O texto alternativo precisa ter de {ALT_MIN} a {ALT_MAX} caracteres."


def _validar_alt_text_form(valor: str) -> str:
    try:
        return AltTextIn(alt_text=valor).alt_text
    except ValidationError as erro:
        raise _error(422, "INVALID_ALT_TEXT", _mensagem_alt_text(erro)) from erro


def _media_root() -> Path:
    root = Path(settings.MEDIA_DIR).expanduser().resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def _com_url(asset) -> PostAssetResponse:
    asset.url = f"{settings.MEDIA_URL_PREFIX.rstrip('/')}/{asset.file_path.lstrip('/')}"
    return asset


def _asset_path(asset) -> Path:
    root = _media_root()
    path = (root / asset.file_path).resolve()
    if root != path and root not in path.parents:
        raise _error(500, "INVALID_ASSET_PATH", "Caminho de mídia inválido")
    return path


@router.post(
    "/posts/{post_id}/assets",
    response_model=PostAssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Envia uma imagem e anexa ao post",
)
async def upload_asset(
    post_id: int,
    file: UploadFile = File(...),
    alt_text: str = Form(...),
    caption: str | None = Form(None),
    kind: str = Form("image"),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    if not post_repo.get_by_id(db, post_id):
        raise _error(404, "POST_NOT_FOUND", "Post não encontrado")
    alt_text = _validar_alt_text_form(alt_text)
    if file.content_type not in ALLOWED_MIME:
        raise _error(415, "UNSUPPORTED_MEDIA_TYPE", f"Formato não suportado: {file.content_type}")
    if kind not in {"image", "carousel_slide"}:
        raise _error(422, "INVALID_ASSET_KIND", "kind deve ser image ou carousel_slide")

    content = await file.read(settings.MAX_UPLOAD_BYTES + 1)
    if len(content) > settings.MAX_UPLOAD_BYTES:
        raise _error(413, "FILE_TOO_LARGE", "Arquivo maior que o limite de 5 MB")

    extension = EXTENSIONS_BY_MIME[file.content_type]
    filename = f"{uuid.uuid4().hex}{extension}"
    relative_path = Path("posts") / str(post_id) / filename
    destination = _media_root() / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(content)

    try:
        asset = asset_repo.create(
            db,
            post_id=post_id,
            file_path=relative_path.as_posix(),
            mime_type=file.content_type,
            alt_text=alt_text,
            caption=caption,
            kind=kind,
            size_bytes=len(content),
            position=asset_repo.next_position(db, post_id),
        )
    except Exception:
        destination.unlink(missing_ok=True)
        raise

    return _com_url(asset)


@router.get(
    "/posts/{post_id}/assets",
    response_model=list[PostAssetResponse],
    summary="Lista as imagens de um post",
)
def list_assets(
    post_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    if not post_repo.get_by_id(db, post_id):
        raise _error(404, "POST_NOT_FOUND", "Post não encontrado")
    return [_com_url(asset) for asset in asset_repo.list_by_post(db, post_id)]


@router.patch(
    "/assets/{asset_id}",
    response_model=PostAssetResponse,
    summary="Edita os metadados de uma imagem",
)
def update_asset(
    asset_id: int,
    data: PostAssetUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    asset = asset_repo.get_by_id(db, asset_id)
    if not asset:
        raise _error(404, "ASSET_NOT_FOUND", "Asset não encontrado")
    # O PostAssetUpdate já normaliza e valida o alt_text enviado (mesma regra do upload).
    # Aqui só sobra o caso de alguém mandar "alt_text": null de propósito.
    if "alt_text" in data.model_fields_set:
        try:
            data.alt_text = validar_alt_text(data.alt_text)
        except AltTextInvalido as erro:
            raise _error(422, "INVALID_ALT_TEXT", str(erro)) from erro
    return _com_url(asset_repo.update(db, asset, data))


@router.put(
    "/posts/{post_id}/assets/order",
    response_model=list[PostAssetResponse],
    summary="Reordena as imagens de um post",
)
def reorder_assets(
    post_id: int,
    data: AssetOrderUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    if not post_repo.get_by_id(db, post_id):
        raise _error(404, "POST_NOT_FOUND", "Post não encontrado")
    try:
        assets = asset_repo.reorder(db, post_id, data.asset_ids)
    except ValueError as exc:
        raise _error(422, "INVALID_ASSET_ORDER", str(exc)) from exc
    return [_com_url(asset) for asset in assets]


@router.delete(
    "/assets/{asset_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove uma imagem do post",
)
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    asset = asset_repo.get_by_id(db, asset_id)
    if not asset:
        raise _error(404, "ASSET_NOT_FOUND", "Asset não encontrado")
    path = _asset_path(asset)
    asset_repo.delete(db, asset)
    path.unlink(missing_ok=True)
