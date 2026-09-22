"""Tarefa 6 — texto alternativo obrigatório na API.

Roda num SQLite temporário, sem login real e sem depender do banco da aplicação:
    cd backend && python -m pytest tests/test_alt_text.py -v
"""
import io

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.security import get_current_admin
from app.db.database import Base, get_db
from app.main import app
from app.models import generation, post, post_asset, post_metric, source  # noqa: F401
from app.models.post import Post
from app.models.post_asset import PostAsset
from app.services.accessibility import AltTextInvalido, alt_text_valido, validar_alt_text

PNG_1X1 = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
    b"\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)
ALT_BOM = "Gráfico de barras com o crescimento mensal"


# ── Fixtures (autocontidas; se a T15 criar um conftest, estas têm prioridade) ──
@pytest.fixture
def sessao(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "MEDIA_DIR", str(tmp_path / "media"))
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    Sessao = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    yield Sessao
    engine.dispose()


@pytest.fixture
def client(sessao):
    def _get_db():
        db = sessao()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _get_db
    app.dependency_overrides[get_current_admin] = lambda: "admin"
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def post_id(sessao):
    db = sessao()
    novo = Post(hook="Como medir o tempo entre sinal e decisão", body="Corpo", status="draft")
    db.add(novo)
    db.commit()
    pid = novo.id
    db.close()
    return pid


def _upload(client, post_id, alt_text):
    return client.post(
        f"/posts/{post_id}/assets",
        files={"file": ("grafico.png", io.BytesIO(PNG_1X1), "image/png")},
        data={"alt_text": alt_text},
    )


# ── Serviço ───────────────────────────────────────────────────────────────────
@pytest.mark.parametrize("valor", [None, "", "curto", "x" * 301, "foto", "  Screenshot. ", "Sem descrição"])
def test_validar_alt_text_recusa(valor):
    with pytest.raises(AltTextInvalido):
        validar_alt_text(valor)
    assert alt_text_valido(valor) is False


def test_validar_alt_text_normaliza_espacos():
    assert validar_alt_text("  Gráfico   de barras\n mensal ") == "Gráfico de barras mensal"
    assert alt_text_valido("x" * 300) is True
    assert alt_text_valido("x" * 10) is True


# ── Upload ────────────────────────────────────────────────────────────────────
@pytest.mark.parametrize("alt", ["foto", "   ", "screenshot", "x" * 301])
def test_upload_com_alt_invalido_responde_422_em_portugues(client, post_id, alt):
    resposta = _upload(client, post_id, alt)
    assert resposta.status_code == 422
    detalhe = resposta.json()["detail"]
    assert detalhe["code"] == "INVALID_ALT_TEXT"
    assert "texto alternativo" in detalhe["message"].lower() or "genéricos" in detalhe["message"]


def test_upload_com_alt_valido_responde_201(client, post_id):
    resposta = _upload(client, post_id, f"  {ALT_BOM}  ")
    assert resposta.status_code == 201
    assert resposta.json()["alt_text"] == ALT_BOM


# ── PATCH /assets/{id} ────────────────────────────────────────────────────────
def test_patch_asset_usa_o_mesmo_validador(client, post_id):
    asset_id = _upload(client, post_id, ALT_BOM).json()["id"]

    assert client.patch(f"/assets/{asset_id}", json={"alt_text": "foto"}).status_code == 422
    assert client.patch(f"/assets/{asset_id}", json={"alt_text": "Sem descrição"}).status_code == 422
    nulo = client.patch(f"/assets/{asset_id}", json={"alt_text": None})
    assert nulo.status_code == 422
    assert nulo.json()["detail"]["code"] == "INVALID_ALT_TEXT"

    ok = client.patch(f"/assets/{asset_id}", json={"alt_text": "Foto da equipe   reunida no escritório"})
    assert ok.status_code == 200
    assert ok.json()["alt_text"] == "Foto da equipe reunida no escritório"

    # PATCH sem alt_text mantém o valor atual
    so_legenda = client.patch(f"/assets/{asset_id}", json={"caption": "Legenda"})
    assert so_legenda.status_code == 200
    assert so_legenda.json()["alt_text"] == "Foto da equipe reunida no escritório"


# ── Bloqueio de agendar/publicar ──────────────────────────────────────────────
def _asset_sem_alt(sessao, post_id):
    """Simula um registro antigo gravado antes da regra (alt vazio no banco)."""
    db = sessao()
    asset = PostAsset(post_id=post_id, kind="image", position=5, file_path="posts/x.png",
                      mime_type="image/png", alt_text="")
    db.add(asset)
    db.commit()
    aid = asset.id
    db.close()
    return aid


@pytest.mark.parametrize("verbo", ["patch", "put"])
@pytest.mark.parametrize("status", ["scheduled", "published"])
def test_status_bloqueado_com_imagem_sem_alt(client, sessao, post_id, verbo, status):
    _upload(client, post_id, ALT_BOM)
    ruim = _asset_sem_alt(sessao, post_id)

    resposta = getattr(client, verbo)(f"/posts/{post_id}", json={"status": status})
    assert resposta.status_code == 422
    erro = resposta.json()["detail"]["error"]
    assert erro["code"] == "acessibilidade_pendente"
    assert erro["field"] == "assets.alt_text"
    assert erro["asset_ids"] == [ruim]
    assert "1 imagem(ns)" in erro["message"]

    # o status não mudou
    assert client.get(f"/posts/{post_id}").json()["status"] == "draft"


def test_status_liberado_quando_todas_as_imagens_tem_alt(client, post_id):
    _upload(client, post_id, ALT_BOM)
    resposta = client.patch(f"/posts/{post_id}", json={"status": "scheduled"})
    assert resposta.status_code == 200
    assert resposta.json()["status"] == "scheduled"


def test_outros_status_nao_sao_bloqueados(client, sessao, post_id):
    _asset_sem_alt(sessao, post_id)
    assert client.patch(f"/posts/{post_id}", json={"status": "revised"}).status_code == 200


# ── PATCH /posts/{id} funciona igual ao PUT ───────────────────────────────────
def test_patch_post_funciona_igual_ao_put(client, post_id):
    via_patch = client.patch(f"/posts/{post_id}", json={"cta": "Comente abaixo"})
    assert via_patch.status_code == 200
    assert via_patch.json()["cta"] == "Comente abaixo"
    assert via_patch.json()["hook"] == "Como medir o tempo entre sinal e decisão"

    via_put = client.put(f"/posts/{post_id}", json={"cta": "Salve o post"})
    assert via_put.status_code == 200
    assert via_put.json()["cta"] == "Salve o post"

    assert client.patch("/posts/99999", json={"cta": "x"}).status_code == 404
