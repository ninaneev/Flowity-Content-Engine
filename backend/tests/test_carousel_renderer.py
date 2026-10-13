"""Tarefa 8 — carrossel do LinkedIn (slides PNG 1080x1350 + PDF).

    cd backend && python -m pytest tests/test_carousel_renderer.py -v
"""
import re
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.security import get_current_admin
from app.db.database import Base, get_db
from app.main import app
from app.models import generation, post, post_asset, post_metric, source  # noqa: F401
from app.models.post import Post
from app.services import carousel_renderer as cr
from app.services import image_renderer as ir

HOOK = "5 sinais de que o seu time decide tarde demais"
BODY = (
    "O cliente reclama e ninguém registra.\n\n"
    "O dado existe, mas está espalhado em três ferramentas.\n\n"
    "A reunião de decisão acontece uma vez por mês.\n\n"
    "Quem decide não vê o sinal original.\n\n"
    "Ninguém mede quantos dias passam entre sinal e decisão."
)
CTA = "Qual desses acontece no seu time? Comente o número."


def _paginas_pdf(caminho: Path) -> int:
    return len(re.findall(rb"/Type\s*/Page(?!s)", caminho.read_bytes()))


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


def _criar_post(sessao, **campos):
    db = sessao()
    novo = Post(**{"hook": HOOK, "body": BODY, "cta": CTA, "status": "draft", **campos})
    db.add(novo)
    db.commit()
    pid = novo.id
    db.close()
    return pid


# ── dividir_em_slides / validar_quantidade ───────────────────────────────────
def test_dividir_por_paragrafos_monta_capa_conteudo_e_cta():
    slides = cr.dividir_em_slides(HOOK, BODY, CTA)
    assert slides[0] == HOOK
    assert slides[-1] == CTA
    assert slides[1:-1] == [p.strip() for p in BODY.split("\n\n")]


def test_dividir_sem_paragrafos_quebra_por_frase():
    slides = cr.dividir_em_slides(HOOK, "Primeira frase. Segunda frase! Terceira frase? Quarta.", None)
    assert slides == [HOOK, "Primeira frase.", "Segunda frase!", "Terceira frase?", "Quarta."]


def test_dividir_junta_blocos_quando_passa_de_oito():
    corpo = "\n\n".join(f"Parágrafo {i}." for i in range(1, 21))
    slides = cr.dividir_em_slides(HOOK, corpo, CTA)
    assert len(slides) <= cr.MAX_SLIDES
    assert slides[0] == HOOK and slides[-1] == CTA
    assert "Parágrafo 1." in slides[1] and "Parágrafo 20." in slides[-2]
    cr.validar_quantidade(slides)


@pytest.mark.parametrize("quantidade", [0, 1, 2, 11, 15])
def test_validar_quantidade_recusa_fora_de_3_a_10(quantidade):
    with pytest.raises(ValueError, match="3 a 10"):
        cr.validar_quantidade(["texto"] * quantidade)


def test_validar_quantidade_recusa_slide_vazio():
    with pytest.raises(ValueError, match="sem texto"):
        cr.validar_quantidade(["capa", "   ", "fim"])


def test_alt_text_slide():
    assert cr.alt_text_slide("Olá", 2, 5) == "Slide 2 de 5 do carrossel: Olá"
    assert len(cr.alt_text_slide("x" * 1000, 10, 10)) == len("Slide 10 de 10 do carrossel: ") + 240


def test_reaproveita_funcoes_da_tarefa_7():
    assert cr.quebrar_em_linhas is ir.quebrar_em_linhas
    assert cr.ajustar_fonte is ir.ajustar_fonte
    assert cr._carregar_fonte is ir._carregar_fonte


# ── Renderização ─────────────────────────────────────────────────────────────
def test_renderizar_carrossel_gera_pngs_1080x1350_numerados_e_pdf(tmp_path):
    slides = cr.dividir_em_slides(HOOK, BODY, CTA)
    resultado = cr.renderizar_carrossel(slides, tmp_path, "teste")

    assert [s["arquivo"] for s in resultado["slides"]] == [
        f"teste-slide-{i:02d}.png" for i in range(1, len(slides) + 1)]
    assert resultado["pdf"] == "teste-carrossel.pdf"
    pdf = tmp_path / resultado["pdf"]
    assert resultado["pdf_size_bytes"] == pdf.stat().st_size
    assert _paginas_pdf(pdf) == len(slides)

    rodapes = []
    fundo = Image.new("RGB", (1, 1), ir.COR_FUNDO).getpixel((0, 0))
    for item in resultado["slides"]:
        png = Image.open(tmp_path / item["arquivo"]).convert("RGB")
        assert png.size == (1080, 1350)
        # canto inferior direito, onde fica a numeração "i/total"
        rodape = png.crop((1080 - cr.MARGEM - 160, 1350 - cr.MARGEM - 60, 1080 - cr.MARGEM, 1350 - cr.MARGEM))
        assert any(cor != fundo for _, cor in rodape.getcolors(maxcolors=100_000))
        rodapes.append(rodape.tobytes())
    assert len(set(rodapes)) == len(slides)   # cada slide tem uma numeração diferente


def test_renderizar_carrossel_recusa_quantidade_invalida(tmp_path):
    with pytest.raises(ValueError):
        cr.renderizar_carrossel(["a", "b"], tmp_path, "x")
    assert list(tmp_path.iterdir()) == []


# ── Endpoint ─────────────────────────────────────────────────────────────────
def test_render_carousel_sem_body_divide_o_post(client, sessao):
    post_id = _criar_post(sessao)
    resposta = client.post(f"/posts/{post_id}/render/carousel")
    assert resposta.status_code == 201
    corpo = resposta.json()

    esperado = cr.dividir_em_slides(HOOK, BODY, CTA)
    assert corpo["post_id"] == post_id
    assert corpo["total_slides"] == len(esperado) == len(corpo["slides"])
    assert [s["position"] for s in corpo["slides"]] == list(range(len(esperado)))
    for indice, (slide, texto) in enumerate(zip(corpo["slides"], esperado), start=1):
        assert slide["kind"] == "carousel_slide"
        assert slide["width"] == 1080 and slide["height"] == 1350
        assert slide["alt_text"] == f"Slide {indice} de {len(esperado)} do carrossel: {texto}"
        assert slide["url"] == f"/media/{slide['file_path']}"
        assert Image.open(Path(settings.MEDIA_DIR) / slide["file_path"]).size == (1080, 1350)

    assert corpo["pdf_url"].startswith(f"/media/posts/{post_id}/carrossel-")
    assert corpo["pdf_url"].endswith("-carrossel.pdf")
    pdf = Path(settings.MEDIA_DIR) / corpo["pdf_url"].removeprefix("/media/")
    assert corpo["pdf_size_bytes"] == pdf.stat().st_size
    assert _paginas_pdf(pdf) == corpo["total_slides"]

    # pdf_url aponta para um PDF de verdade dentro de MEDIA_DIR (servido pelo mount /media)
    assert pdf.read_bytes()[:4] == b"%PDF"


def test_render_carousel_com_slides_editados_continua_a_posicao(client, sessao):
    post_id = _criar_post(sessao)
    client.post(f"/posts/{post_id}/render/image")               # asset na posição 0
    slides = ["Capa editada", "Conteúdo um", "Conteúdo dois", "Chamada final"]
    resposta = client.post(f"/posts/{post_id}/render/carousel", json={"slides": slides})
    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["total_slides"] == 4
    assert [s["position"] for s in corpo["slides"]] == [1, 2, 3, 4]
    assert corpo["slides"][0]["alt_text"] == "Slide 1 de 4 do carrossel: Capa editada"


@pytest.mark.parametrize("quantidade", [2, 11])
def test_render_carousel_fora_do_limite_responde_422(client, sessao, quantidade):
    post_id = _criar_post(sessao)
    resposta = client.post(f"/posts/{post_id}/render/carousel",
                           json={"slides": [f"Slide {i}" for i in range(quantidade)]})
    assert resposta.status_code == 422
    assert "3 a 10" in resposta.json()["detail"]
    assert client.get(f"/posts/{post_id}/assets").json() == []


def test_render_carousel_post_curto_demais_responde_422(client, sessao):
    post_id = _criar_post(sessao, body=None, cta=None)
    assert client.post(f"/posts/{post_id}/render/carousel").status_code == 422


def test_render_carousel_404(client):
    assert client.post("/posts/99999/render/carousel").status_code == 404
