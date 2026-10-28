"""Cópia pública das imagens dos posts no Supabase Storage, para o Make publicar no LinkedIn.

As imagens ficam no disco do backend (post_assets.file_path), que o Make não alcança. Aqui cada
imagem também vai para o bucket público `post-images` (settings.SUPABASE_STORAGE_BUCKET), no
caminho posts/<post_id>/<asset_id>-<arquivo>, com o mime original (GIF continua GIF, sem reencode).
A URL pública fica em post_assets.public_url, que a view posts_due_now devolve como image_url.

Sem SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY tudo é pulado (avisa uma vez no log): o ambiente
local e os testes continuam funcionando, e o post com imagem só fica fora do autopost.

Backfill das imagens que já existem (dentro de backend/):
    python -m app.services.storage backfill
"""
from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Callable
from urllib.parse import quote

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings

logger = logging.getLogger(__name__)

# Trocável nos testes por um cliente com httpx.MockTransport
client_factory: Callable[[], httpx.Client] = lambda: httpx.Client(timeout=30)  # noqa: E731

_avisou_sem_config = False
_buckets_ok: set[str] = set()


def configurado() -> bool:
    return bool(settings.SUPABASE_URL.strip() and settings.SUPABASE_SERVICE_ROLE_KEY.strip())


def _base() -> str:
    return settings.SUPABASE_URL.strip().rstrip("/")


def _headers(extra: dict | None = None) -> dict:
    chave = settings.SUPABASE_SERVICE_ROLE_KEY.strip()
    h = {"Authorization": f"Bearer {chave}", "apikey": chave}
    if extra:
        h.update(extra)
    return h


def caminho_no_bucket(asset) -> str:
    nome = Path(asset.file_path).name
    return f"posts/{asset.post_id}/{asset.id}-{nome}"


def url_publica(caminho: str) -> str:
    bucket = settings.SUPABASE_STORAGE_BUCKET
    return f"{_base()}/storage/v1/object/public/{bucket}/{quote(caminho)}"


def _garantir_bucket(client: httpx.Client) -> None:
    """Cria o bucket público se ainda não existir (uma vez por processo)."""
    bucket = settings.SUPABASE_STORAGE_BUCKET
    if bucket in _buckets_ok:
        return
    r = client.get(f"{_base()}/storage/v1/bucket/{bucket}", headers=_headers())
    if r.status_code != 200:
        criar = client.post(
            f"{_base()}/storage/v1/bucket",
            headers=_headers({"Content-Type": "application/json"}),
            json={"id": bucket, "name": bucket, "public": True},
        )
        # 409/400 "already exists" vem quando outro processo criou no meio do caminho
        if criar.status_code not in (200, 201) and "exist" not in criar.text.lower():
            criar.raise_for_status()
    _buckets_ok.add(bucket)


def enviar(asset, conteudo: bytes) -> str | None:
    """Envia o arquivo para o Storage (x-upsert) e devolve a URL pública; None se não configurado."""
    global _avisou_sem_config
    if not configurado():
        if not _avisou_sem_config:
            logger.info("Supabase Storage não configurado (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY): imagens ficam só no disco.")
            _avisou_sem_config = True
        return None
    caminho = caminho_no_bucket(asset)
    with client_factory() as client:
        _garantir_bucket(client)
        r = client.post(
            f"{_base()}/storage/v1/object/{settings.SUPABASE_STORAGE_BUCKET}/{quote(caminho)}",
            headers=_headers({"Content-Type": asset.mime_type, "x-upsert": "true"}),
            content=conteudo,
        )
        r.raise_for_status()
    return url_publica(caminho)


def publicar_asset(db: Session, asset, conteudo: bytes | None = None) -> str | None:
    """Envia a imagem e grava post_assets.public_url. Erro de rede só vai para o log."""
    if not configurado():
        return enviar(asset, b"")  # só registra o aviso uma vez
    try:
        if conteudo is None:
            raiz = Path(settings.MEDIA_DIR).expanduser().resolve()
            conteudo = (raiz / asset.file_path).read_bytes()
        url = enviar(asset, conteudo)
    except Exception as erro:  # noqa: BLE001 — o upload local já deu certo; o autopost só fica manual
        logger.warning("Falha ao enviar asset %s para o Supabase Storage: %s", asset.id, erro)
        return None
    asset.public_url = url
    db.commit()
    db.refresh(asset)
    return url


def backfill(db: Session) -> dict:
    """Envia todas as imagens que ainda não têm public_url."""
    from app.models.post_asset import PostAsset

    pendentes = db.query(PostAsset).filter(PostAsset.public_url.is_(None)).order_by(PostAsset.id).all()
    enviados = [a.id for a in pendentes if publicar_asset(db, a)]
    return {"pendentes": len(pendentes), "enviados": len(enviados), "falharam": len(pendentes) - len(enviados)}


def main(argv: list[str]) -> int:
    if argv[:1] != ["backfill"]:
        print("uso: python -m app.services.storage backfill", file=sys.stderr)
        return 2
    if not configurado():
        print("[storage] defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env antes do backfill.", file=sys.stderr)
        return 1
    from app.db.database import SessionLocal
    from app.models import alert_setting, carousel_slide, generation, post, post_asset, post_metric, source  # noqa: F401

    db = SessionLocal()
    try:
        resultado = backfill(db)
    finally:
        db.close()
    print(f"[storage] {resultado}")
    return 0 if resultado["falharam"] == 0 else 1


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    sys.exit(main(sys.argv[1:]))
