"""Mantém o projeto Supabase gratuito acordado.

O plano gratuito do Supabase pausa o projeto depois de cerca de 7 dias sem atividade no banco.
Quando isso acontece o login do Content Engine quebra ("tenant not found") até alguém restaurar o
projeto no painel. Este script faz uma leitura real e barata no banco (conta os posts), o que
conta como atividade. O workflow .github/workflows/supabase-keepalive.yml roda ele duas vezes
por semana.

Uso (dentro de backend/):
    DATABASE_URL=postgresql://... python -m app.db.keepalive

Além do ping, faz uma checagem de saúde: posts que falharam nas últimas 24h, posts presos em
"publishing" há mais de 1h e posts agendados com mais de 1h de atraso. Se achar algum, sai com
código 1; o GitHub manda e-mail para quem editou o workflow quando um job agendado falha.

Só lê, nunca escreve. Não importa app.core.config para não exigir JWT_SECRET e afins no CI.
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta

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


# Datas no banco são UTC sem fuso (o scheduler compara com datetime.utcnow()).
CHECAGENS = {
    "falharam nas últimas 24h": "SELECT id FROM posts WHERE status = 'failed' AND updated_at >= :dia",
    "presos em publishing há mais de 1h": "SELECT id FROM posts WHERE status = 'publishing' AND updated_at < :hora",
    "agendados com mais de 1h de atraso": "SELECT id FROM posts WHERE status = 'scheduled' AND scheduled_at < :hora",
}


def checar_saude(url: str, agora: datetime | None = None, timeout_s: int = 20) -> list[str]:
    """Devolve uma linha por problema encontrado (lista vazia = tudo certo)."""
    agora = agora or datetime.utcnow()
    params = {"dia": agora - timedelta(hours=24), "hora": agora - timedelta(hours=1)}
    url = normalizar_url(url)
    args = {"connect_timeout": timeout_s} if url.startswith("postgresql") else {}
    engine = create_engine(url, connect_args=args, pool_pre_ping=False)
    problemas = []
    try:
        with engine.connect() as conn:
            for rotulo, sql in CHECAGENS.items():
                ids = [str(i) for i in conn.execute(text(sql), params).scalars()]
                if ids:
                    problemas.append(f"{len(ids)} post(s) {rotulo}: ids {', '.join(ids)}")
    finally:
        engine.dispose()
    return problemas


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
    try:
        problemas = checar_saude(url)
    except Exception as erro:  # noqa: BLE001
        print(f"[saude] Checagem falhou: {type(erro).__name__}.", file=sys.stderr)
        return 1
    if problemas:
        for linha in problemas:
            print(f"[saude] {linha}", file=sys.stderr)
        print("[saude] Abra o Content Engine (Pipeline) e veja o motivo nas notas do post.", file=sys.stderr)
        return 1
    print("[saude] ok, nenhum post falhou ou travou.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
