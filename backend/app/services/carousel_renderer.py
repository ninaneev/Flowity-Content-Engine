"""Carrossel do LinkedIn: slides PNG 1080x1350 unidos em um único PDF.

O LinkedIn não aceita imagens soltas como carrossel, ele ingere um documento
PDF de várias páginas. Cada slide é desenhado no mesmo estilo do card da
Tarefa 7, reaproveitando as funções de fonte e de quebra de linha de lá.
"""
import re
from pathlib import Path

from PIL import Image, ImageDraw

# ajustar_fonte usa quebrar_em_linhas por dentro; os dois vêm da Tarefa 7
from app.services.image_renderer import (  # noqa: F401
    COR_FUNDO, COR_TEXTO, COR_SECUNDARIA, COR_ROXO, COR_CIANO,
    _carregar_fonte, _altura_linha, quebrar_em_linhas, ajustar_fonte,
)
from app.services.image_renderer import FONTE_TEXTO, FONTE_TITULO

LARGURA = 1080   # proporcao 4:5, recomendada para documentos do LinkedIn
ALTURA = 1350
MARGEM = 88
MIN_SLIDES = 3
MAX_SLIDES = 10
MAX_BLOCOS = MAX_SLIDES - 2   # capa + ate 8 blocos de conteudo + CTA


def dividir_em_slides(hook: str | None, body: str | None, cta: str | None) -> list[str]:
    """Monta capa (hook) + blocos de conteúdo (body) + slide de CTA."""
    texto = (body or "").strip()
    blocos = [b.strip() for b in re.split(r"\n\s*\n", texto) if b.strip()]
    if len(blocos) < 3:                      # sem paragrafos, quebra por frase
        blocos = [f.strip() for f in re.split(r"(?<=[.!?])\s+", texto) if f.strip()]
    if len(blocos) > MAX_BLOCOS:             # junta blocos vizinhos ate caber
        passo = -(-len(blocos) // MAX_BLOCOS)
        blocos = [" ".join(blocos[i:i + passo]) for i in range(0, len(blocos), passo)]
    slides = [(hook or "").strip()] + blocos[:MAX_BLOCOS]
    if cta and cta.strip():
        slides.append(cta.strip())
    return [s for s in slides if s]


def validar_quantidade(slides: list[str]) -> None:
    """Levanta ValueError se o carrossel ficar fora de 3 a 10 slides ou tiver slide vazio."""
    total = len(slides or [])
    if total < MIN_SLIDES or total > MAX_SLIDES:
        raise ValueError(
            f"O carrossel precisa ter de {MIN_SLIDES} a {MAX_SLIDES} slides (recebido: {total}).")
    vazios = [i for i, texto in enumerate(slides, start=1) if not (texto or "").strip()]
    if vazios:
        raise ValueError(f"Slide(s) sem texto: {', '.join(map(str, vazios))}.")


def alt_text_slide(texto: str, indice: int, total: int) -> str:
    """Texto alternativo próprio de cada slide."""
    return f"Slide {indice} de {total} do carrossel: {texto[:240]}"


def renderizar_slide(texto: str, indice: int, total: int, destino: Path, eh_capa: bool) -> dict:
    """Desenha um slide 1080x1350 e escreve a numeração "{indice}/{total}" no rodapé."""
    imagem = Image.new("RGB", (LARGURA, ALTURA), COR_FUNDO)
    draw = ImageDraw.Draw(imagem)
    draw.rectangle([MARGEM, MARGEM, MARGEM + 120, MARGEM + 12], fill=COR_ROXO)
    draw.rectangle([MARGEM + 132, MARGEM, MARGEM + 200, MARGEM + 12], fill=COR_CIANO)

    largura_util = LARGURA - 2 * MARGEM

    # Rodapé: assinatura à esquerda, numeração à direita
    fonte_rodape = _carregar_fonte(FONTE_TITULO, 34)
    y_rodape = ALTURA - MARGEM - _altura_linha(draw, fonte_rodape)
    draw.text((MARGEM, y_rodape), "Flowity", font=fonte_rodape, fill=COR_SECUNDARIA)
    numeracao = f"{indice}/{total}"
    esquerda, _, direita, _ = draw.textbbox((0, 0), numeracao, font=fonte_rodape)
    draw.text((LARGURA - MARGEM - (direita - esquerda) - esquerda, y_rodape), numeracao,
              font=fonte_rodape, fill=COR_SECUNDARIA)

    # Texto do slide: capa em negrito e maior; demais em texto regular
    topo = MARGEM + 12 + 72
    limite = y_rodape - 64
    if eh_capa:
        fonte, linhas = ajustar_fonte(draw, texto.strip(), FONTE_TITULO, largura_util,
                                      limite - topo, tamanho_inicial=88, tamanho_minimo=40)
        cor = COR_TEXTO
    else:
        fonte, linhas = ajustar_fonte(draw, texto.strip(), FONTE_TEXTO, largura_util,
                                      limite - topo, tamanho_inicial=60, tamanho_minimo=32)
        cor = COR_CIANO if indice == total and total > 1 else COR_TEXTO
    passo = _altura_linha(draw, fonte)
    y = topo + max(0, (limite - topo - len(linhas) * passo) // 2)
    for linha in linhas:
        draw.text((MARGEM, y), linha, font=fonte, fill=cor)
        y += passo

    destino.parent.mkdir(parents=True, exist_ok=True)
    imagem.save(destino, format="PNG", optimize=True)
    return {"width": LARGURA, "height": ALTURA,
            "size_bytes": destino.stat().st_size, "mime_type": "image/png"}


def renderizar_carrossel(slides: list[str], pasta: Path, prefixo: str) -> dict:
    """Renderiza todos os slides e junta em `{prefixo}-carrossel.pdf` dentro de `pasta`.

    Devolve {"slides": [...], "pdf": nome_do_pdf, "pdf_size_bytes": n}; cada item
    de "slides" traz arquivo, texto, alt_text e os metadados do PNG.
    """
    validar_quantidade(slides)
    total = len(slides)
    pasta.mkdir(parents=True, exist_ok=True)

    gerados: list[dict] = []
    imagens: list[Image.Image] = []
    for indice, texto in enumerate(slides, start=1):
        nome = f"{prefixo}-slide-{indice:02d}.png"
        meta = renderizar_slide(texto, indice, total, pasta / nome, eh_capa=indice == 1)
        gerados.append({"arquivo": nome, "texto": texto,
                        "alt_text": alt_text_slide(texto, indice, total), **meta})
        with Image.open(pasta / nome) as png:
            imagens.append(png.convert("RGB"))

    nome_pdf = f"{prefixo}-carrossel.pdf"
    caminho_pdf = pasta / nome_pdf
    imagens[0].save(caminho_pdf, format="PDF", resolution=150.0,
                    save_all=True, append_images=imagens[1:])
    return {"slides": gerados, "pdf": nome_pdf, "pdf_size_bytes": caminho_pdf.stat().st_size}
