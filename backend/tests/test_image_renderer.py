"""Tarefa 7 — imagem única do post com Pillow.

    cd backend && python -m pytest tests/test_image_renderer.py -v
"""
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.security import get_current_admin
from app.db.database import Base, get_db
from app.main import app
from app.models import generation, post, post_asset, post_metric, source  # noqa: F401
from app.models.post import Post
from app.services import image_renderer as ir

HOOK_CURTO = "Sinal sem decisão é ruído."
HOOK_LONGO = (
    "Quantos dias a sua empresa leva entre perceber um sinal do cliente e tomar uma "
    "decisão sobre ele? Na maioria das SaaS que acompanhamos esse intervalo passa de "
    "três semanas, e quase ninguém mede isso de forma consistente ou comparável entre times."
)
CTA = "Comente com o número de dias do seu time"


def _hex(cor: str) -> tuple[int, int, int]:
    cor = cor.lstrip("#")
    return tuple(int(cor[i:i + 2], 16) for i in (0, 2, 4))


def _draw():
    return ImageDraw.Draw(Image.new("RGB", (10, 10)))


# ── Fixtures autocontidas ────────────────────────────────────────────────────
@pytest.fixture
def sessao(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "MEDIA_DIR", str(tmp_path / "media"))
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    yield sessionmaker(bind=engine, autoflush=False, autocommit=False)
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
    novo = Post(hook=HOOK_LONGO[:280], body="Corpo do post", cta=CTA, status="draft")
    db.add(novo)
    db.commit()
    pid = novo.id
    db.close()
    return pid


# ── Funções de texto ─────────────────────────────────────────────────────────
def test_quebrar_em_linhas_respeita_a_largura():
    draw = _draw()
    fonte = ir._carregar_fonte(ir.FONTE_TITULO, 60)
    linhas = ir.quebrar_em_linhas(draw, HOOK_LONGO, fonte, 500)
    assert len(linhas) > 3
    assert all(draw.textbbox((0, 0), linha, font=fonte)[2] <= 500 for linha in linhas)
    assert " ".join(linhas).split() == HOOK_LONGO.split()


def test_quebrar_em_linhas_parte_palavra_maior_que_a_largura():
    draw = _draw()
    fonte = ir._carregar_fonte(ir.FONTE_TITULO, 60)
    linhas = ir.quebrar_em_linhas(draw, "A" * 80, fonte, 300)
    assert len(linhas) > 1
    assert "".join(linhas) == "A" * 80
    assert all(draw.textbbox((0, 0), linha, font=fonte)[2] <= 300 for linha in linhas)


def test_ajustar_fonte_reduz_ate_caber():
    draw = _draw()
    fonte_curta, _ = ir.ajustar_fonte(draw, HOOK_CURTO, ir.FONTE_TITULO, 1008, 700)
    fonte_longa, linhas = ir.ajustar_fonte(draw, HOOK_LONGO, ir.FONTE_TITULO, 1008, 700)
    assert fonte_curta.size == 84
    assert 36 <= fonte_longa.size < 84
    assert len(linhas) * ir._altura_linha(draw, fonte_longa) <= 700


def test_ajustar_fonte_corta_com_reticencias_no_minimo():
    draw = _draw()
    fonte, linhas = ir.ajustar_fonte(draw, HOOK_LONGO * 5, ir.FONTE_TITULO, 600, 200)
    assert fonte.size == 36
    assert len(linhas) * ir._altura_linha(draw, fonte) <= 200
    assert linhas[-1].endswith("…")


def test_alt_text_padrao():
    assert ir.alt_text_padrao("Olá mundo") == "Cartão com o texto: Olá mundo"


# ── Card ─────────────────────────────────────────────────────────────────────
@pytest.mark.parametrize("hook", [HOOK_CURTO, HOOK_LONGO])
def test_card_tem_1200x1200_cores_da_marca_e_respeita_margem(tmp_path, hook):
    destino = tmp_path / "sub" / "card.png"
    meta = ir.renderizar_card(hook, CTA, destino)

    assert meta == {"width": 1200, "height": 1200, "size_bytes": destino.stat().st_size,
                    "mime_type": "image/png"}
    imagem = Image.open(destino).convert("RGB")
    assert imagem.size == (1200, 1200)

    fundo = _hex(ir.COR_FUNDO)
    assert imagem.getpixel((5, 5)) == fundo
    assert imagem.getpixel((ir.MARGEM + 60, ir.MARGEM + 6)) == _hex(ir.COR_ROXO)
    assert imagem.getpixel((ir.MARGEM + 170, ir.MARGEM + 6)) == _hex(ir.COR_CIANO)
    cores = {cor for _, cor in imagem.getcolors(maxcolors=1_000_000)}
    assert _hex(ir.COR_TEXTO) in cores

    # nenhuma letra entra nas margens: as quatro faixas externas são só fundo
    m = ir.MARGEM
    for caixa in [(0, 0, m, 1200), (1200 - m, 0, 1200, 1200), (0, 0, 1200, m), (0, 1200 - m, 1200, 1200)]:
        assert imagem.crop(caixa).getcolors() == [(imagem.crop(caixa).width * imagem.crop(caixa).height, fundo)]


def test_card_funciona_sem_as_fontes_embarcadas(tmp_path, monkeypatch):
    monkeypatch.setattr(ir, "DIR_FONTES", tmp_path / "nao-existe")
    fonte = ir._carregar_fonte(ir.FONTE_TITULO, 40)
    if isinstance(fonte, ImageFont.FreeTypeFont):   # fonte padrão escalável do Pillow
        assert fonte.getname()[0] != "Inter"
    destino = tmp_path / "card.png"
    ir.renderizar_card(HOOK_LONGO, CTA, destino)
    assert Image.open(destino).size == (1200, 1200)


def test_fontes_embarcadas_existem_com_licenca():
    for nome in ("Inter-Bold.ttf", "Inter-Regular.ttf", "OFL.txt"):
        assert (ir.DIR_FONTES / nome).is_file()
    assert ir._carregar_fonte(ir.FONTE_TITULO, 40).getname()[0] == "Inter"


# ── Endpoint ─────────────────────────────────────────────────────────────────
def test_render_image_cria_asset_com_alt_text(client, post_id):
    resposta = client.post(f"/posts/{post_id}/render/image")
    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["kind"] == "image"
    assert corpo["width"] == 1200 and corpo["height"] == 1200
    assert corpo["mime_type"] == "image/png"
    assert corpo["alt_text"] == f"Cartão com o texto: {HOOK_LONGO[:280]}"
    assert corpo["url"] == f"/media/{corpo['file_path']}"
    arquivo = Path(settings.MEDIA_DIR) / corpo["file_path"]
    assert Image.open(arquivo).size == (1200, 1200)

    # a segunda imagem entra na posição seguinte
    segunda = client.post(f"/posts/{post_id}/render/image", json={"hook": HOOK_CURTO})
    assert segunda.status_code == 201
    assert segunda.json()["position"] == corpo["position"] + 1
    assert segunda.json()["alt_text"] == f"Cartão com o texto: {HOOK_CURTO}"


def test_render_image_aceita_alt_text_proprio_e_valida(client, post_id):
    ok = client.post(f"/posts/{post_id}/render/image",
                     json={"alt_text": "Card roxo com a pergunta sobre dias até a decisão"})
    assert ok.status_code == 201
    assert ok.json()["alt_text"] == "Card roxo com a pergunta sobre dias até a decisão"
    assert client.post(f"/posts/{post_id}/render/image", json={"alt_text": "foto"}).status_code == 422


def test_render_image_404_quando_post_nao_existe(client):
    assert client.post("/posts/99999/render/image").status_code == 404
