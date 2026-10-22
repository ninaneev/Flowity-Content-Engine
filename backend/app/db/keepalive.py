"""Mantém o projeto Supabase gratuito acordado.

O plano gratuito do Supabase pausa o projeto depois de cerca de 7 dias sem atividade no banco.
Quando isso acontece o login do Content Engine quebra ("tenant not found") até alguém restaurar o
projeto no painel. Este script faz uma leitura real e barata no banco (conta os posts), o que
conta como atividade. O workflow .github/workflows/supabase-keepalive.yml roda ele duas vezes
por semana.

Uso (dentro de backend/):
    DATABASE_URL=postgresql://... python -m app.db.keepalive

Só lê, nunca escreve. Não importa app.core.config para não exigir JWT_SECRET e afins no CI.
"""
from __future__ import annotations

import os
import sys

from sqlalchemy import create_engine, text

CONSULTA = "SELECT count(*) FROM posts"


def normalizar_url(url: str) -> str:
    """O Supabase às vezes entrega postgres://, que o SQLAlchemy 2 não aceita."""
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://"):]
    return url


def pingar(url: str, timeout_s: int = 20) -> int:
    """Faz a leitura e devolve o número de posts."""
    url = normalizar_url(url)
    args = {"connect_timeout": timeout_s} if url.startswith("postgresql") else {}
    engine = create_engine(url, connect_args=args, pool_pre_ping=False)
    try:
        with engine.connect() as conn:
            return int(conn.execute(text(CONSULTA)).scalar_one())
    finally:
        engine.dispose()


def main() -> int:
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        print(
            "[keepalive] DATABASE_URL vazio. No GitHub: Settings > Secrets and variables > Actions > "
            "New repository secret, nome SUPABASE_DATABASE_URL.",
            file=sys.stderr,
        )
        return 2
    try:
        total = pingar(url)
    except Exception as erro:  # noqa: BLE001 — queremos a mensagem no log do Actions
        print(
            f"[keepalive] Falhou: {type(erro).__name__}. Se o projeto já está pausado, restaure no "
            "painel do Supabase (Project > Restore) e rode o workflow de novo.",
            file=sys.stderr,
        )
        return 1
    print(f"[keepalive] ok, banco acordado ({total} posts).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
