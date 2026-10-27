"""Leva o banco PostgreSQL até a última revisão do Alembic, mesmo que ele nunca tenha visto o Alembic.

Por que existe:
    O banco do PI 1 (Supabase) foi criado pelo SQL de PI1/supabase-setup.md e pelo
    create_tables(), não pelo Alembic. Nesse banco a tabela alembic_version não existe, então
    `alembic upgrade head` tenta criar `sources` de novo e falha; e o docker-compose de
    desenvolvimento nunca rodava migração nenhuma. Resultado: `post_assets` nunca foi criada e
    GET /posts/ devolve 500.

O que faz:
    1. Se o banco já tem revisão no alembic_version, só roda `alembic upgrade head`.
    2. Se não tem, olha quais tabelas/colunas já existem, marca (stamp) a última revisão cujo
       conteúdo já está no banco e depois roda `alembic upgrade head`, que cria só o que falta.
    3. Se o banco estiver num estado que não bate com nenhuma revisão (ex.: post_metrics existe mas
       post_assets não), para com erro e não mexe em nada.

Uso (dentro de backend/):
    python -m app.db.migrate
SQLite local é ignorado: lá o create_tables() do startup continua cuidando do schema.
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Callable

from alembic import command
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import create_engine, inspect
from sqlalchemy.engine import Engine, Inspector

from app.core.config import settings

BACKEND = Path(__file__).resolve().parents[2]


def _tem_tabelas(*nomes: str) -> Callable[[Inspector], bool]:
    def checar(insp: Inspector) -> bool:
        existentes = set(insp.get_table_names())
        return set(nomes) <= existentes

    return checar


def _tem_colunas(tabela: str, *colunas: str) -> Callable[[Inspector], bool]:
    def checar(insp: Inspector) -> bool:
        if tabela not in insp.get_table_names():
            return False
        existentes = {c["name"] for c in insp.get_columns(tabela)}
        return set(colunas) <= existentes

    return checar


def _tem_alguma_tabela(*nomes: str) -> Callable[[Inspector], bool]:
    def checar(insp: Inspector) -> bool:
        return bool(set(nomes) & set(insp.get_table_names()))

    return checar


# Cadeia do Alembic, em ordem, com o "sinal" de que cada revisão já está aplicada no banco.
# Toda revisão nova em alembic/versions precisa de uma linha aqui (o teste
# test_migrate_bootstrap.py::test_marcadores_cobrem_toda_a_cadeia falha se faltar).
MARCADORES: list[tuple[str, Callable[[Inspector], bool]]] = [
    ("3f2b7c1d9a10", _tem_tabelas("sources", "posts", "post_sources", "generation_runs")),
    ("89380bd00e80", _tem_tabelas("post_assets")),
    ("ab51b67c9eb3", _tem_tabelas("post_metrics")),
    ("9e4b2f6a1c83", _tem_colunas("posts", "external_minutes", "tools_used", "workflow")),
    ("5c1e7a9d2b40", _tem_tabelas("alert_settings")),
    ("0007_carousel_slides", _tem_tabelas("carousel_slides")),
]

# Sinais parciais: se algum existe sem a revisão inteira, o banco está num estado estranho.
PARCIAIS: dict[str, Callable[[Inspector], bool]] = {
    "3f2b7c1d9a10": _tem_alguma_tabela("sources", "posts", "post_sources", "generation_runs"),
    "9e4b2f6a1c83": lambda insp: "posts" in insp.get_table_names()
    and bool({"external_minutes", "tools_used", "workflow"} & {c["name"] for c in insp.get_columns("posts")}),
}


class EstadoInconsistente(RuntimeError):
    """O banco tem parte das tabelas de uma revisão, ou uma revisão posterior sem a anterior."""


def alembic_config() -> Config:
    cfg = Config(str(BACKEND / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND / "alembic"))
    return cfg


def revisao_atual(engine: Engine) -> str | None:
    with engine.connect() as conn:
        return MigrationContext.configure(conn).get_current_revision()


def detectar_revisao(engine: Engine) -> str | None:
    """Última revisão cujo conteúdo já está no banco (None = banco vazio).

    Levanta EstadoInconsistente se o que existe não forma um prefixo limpo da cadeia.
    """
    insp = inspect(engine)
    aplicadas = [rev for rev, checar in MARCADORES if checar(insp)]
    esperado = [rev for rev, _ in MARCADORES][: len(aplicadas)]
    if aplicadas != esperado:
        raise EstadoInconsistente(
            f"Revisões presentes fora de ordem: {aplicadas}. Esperado um prefixo de "
            f"{[rev for rev, _ in MARCADORES]}. Confira as tabelas no Supabase antes de migrar."
        )
    proxima = len(aplicadas)
    if proxima < len(MARCADORES):
        rev = MARCADORES[proxima][0]
        parcial = PARCIAIS.get(rev)
        if parcial is not None and parcial(insp):
            raise EstadoInconsistente(
                f"A revisão {rev} está aplicada pela metade (algumas tabelas/colunas existem, outras não)."
            )
    return aplicadas[-1] if aplicadas else None


def migrar(cfg: Config, engine: Engine) -> dict:
    """Carimba o banco se preciso e roda upgrade head. Devolve o que aconteceu."""
    antes = revisao_atual(engine)
    carimbada = None
    if antes is None:
        carimbada = detectar_revisao(engine)
        if carimbada is not None:
            command.stamp(cfg, carimbada)
    command.upgrade(cfg, "head")
    return {"antes": antes, "carimbada": carimbada, "depois": revisao_atual(engine)}


def main() -> int:
    url = settings.DATABASE_URL
    if url.startswith("sqlite"):
        print("[migrate] SQLite local: nada a fazer, o create_tables() do startup cuida do schema.")
        return 0
    engine = create_engine(url)
    try:
        resultado = migrar(alembic_config(), engine)
    except EstadoInconsistente as erro:
        print(f"[migrate] PAREI sem mudar nada: {erro}", file=sys.stderr)
        return 1
    finally:
        engine.dispose()
    print(
        f"[migrate] revisão antes={resultado['antes']} carimbada={resultado['carimbada']} "
        f"depois={resultado['depois']}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
