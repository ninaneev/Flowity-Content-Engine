"""Renderização do card quadrado (imagem única) do post com Pillow.

Desenha um PNG 1200x1200 com as cores da marca Flowity: o gancho (hook) em
destaque, o CTA no rodapé e a assinatura "Flowity". As funções de fonte e de
quebra de linha são reaproveitadas pelo carrossel (Tarefa 8).

Fontes: Inter Bold/Regular (SIL Open Font License 1.1, ver
app/assets/fonts/OFL.txt). Se os arquivos não estiverem no contêiner, o
serviço continua funcionando com ImageFont.load_default().
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

COR_FUNDO = "#080810"
COR_TEXTO = "#FFFFFF"
COR_SECUNDARIA = "#A8AABA"
COR_ROXO = "#9C83F7"
COR_CIANO = "#1CD8DE"
LARGURA = ALTURA = 1200
MARGEM = 96
DIR_FONTES = Path(__file__).resolve().parent.parent / "assets" / "fonts"

FONTE_TITULO = "Inter-Bold.ttf"
FONTE_TEXTO = "Inter-Regular.ttf"
ENTRELINHA = 1.25
RETICENCIAS = "…"

Fonte = ImageFont.FreeTypeFont | ImageFont.ImageFont


def _carregar_fonte(nome: str, tamanho: int) -> Fonte:
    """Carrega a fonte embarcada; sem o arquivo, cai na fonte padrão do Pillow."""
    caminho = DIR_FONTES / nome
    try:
        return ImageFont.truetype(str(caminho), tamanho)
    except OSError:
        pass
    try:
        # Pillow >= 10.1 devolve uma fonte escalável quando o FreeType está disponível
        return ImageFont.load_default(size=tamanho)
    except (TypeError, OSError, ImportError):
        return ImageFont.load_default()


def _largura(draw: ImageDraw.ImageDraw, texto: str, fonte: Fonte) -> int:
    esquerda, _, direita, _ = draw.textbbox((0, 0), texto, font=fonte)
    return direita - esquerda


def _altura_linha(draw: ImageDraw.ImageDraw, fonte: Fonte) -> int:
    """Altura de uma linha (com entrelinha), medida com letras altas e descendentes."""
    _, topo, _, base = draw.textbbox((0, 0), "ÁÇgjpqy", font=fonte)
    return max(1, round((base - topo) * ENTRELINHA))


def _quebrar_palavra(draw, palavra: str, fonte: Fonte, largura_max: int) -> list[str]:
    """Quebra por caractere uma palavra que sozinha já passa da largura."""
    pedacos, atual = [], ""
    for letra in palavra:
        if atual and _largura(draw, atual + letra, fonte) > largura_max:
            pedacos.append(atual)
            atual = letra
        else:
            atual += letra
    if atual:
        pedacos.append(atual)
    return pedacos


def quebrar_em_linhas(draw: ImageDraw.ImageDraw, texto: str, fonte: Fonte, largura_max: int) -> list[str]:
    """Quebra o texto palavra a palavra, medindo cada linha com draw.textbbox.

    Respeita as quebras de linha do próprio texto. Uma palavra maior que a
    largura inteira é partida por caractere, para nenhuma letra estourar a margem.
    """
    linhas: list[str] = []
    for paragrafo in (texto or "").splitlines() or [""]:
        palavras = paragrafo.split()
        if not palavras:
            if linhas:
                linhas.append("")
            continue
        atual = ""
        for palavra in palavras:
            candidata = f"{atual} {palavra}" if atual else palavra
            if _largura(draw, candidata, fonte) <= largura_max:
                atual = candidata
                continue
            if atual:
                linhas.append(atual)
            if _largura(draw, palavra, fonte) <= largura_max:
                atual = palavra
            else:
                *inteiros, atual = _quebrar_palavra(draw, palavra, fonte, largura_max)
                linhas.extend(inteiros)
        linhas.append(atual)
    while linhas and linhas[-1] == "":
        linhas.pop()
    return linhas


def _cortar_com_reticencias(draw, linhas: list[str], fonte: Fonte, largura_max: int, max_linhas: int) -> list[str]:
    if len(linhas) <= max_linhas:
        return linhas
    cortadas = linhas[:max(1, max_linhas)]
    ultima = cortadas[-1].rstrip()
    while ultima and _largura(draw, ultima + RETICENCIAS, fonte) > largura_max:
        ultima = ultima[:-1].rstrip()
    cortadas[-1] = ultima + RETICENCIAS
    return cortadas


def ajustar_fonte(
    draw: ImageDraw.ImageDraw,
    texto: str,
    nome_fonte: str,
    largura_max: int,
    altura_max: int,
    tamanho_inicial: int = 84,
    tamanho_minimo: int = 36,
) -> tuple[Fonte, list[str]]:
    """Reduz o corpo da fonte até o texto quebrado caber na caixa.

    Devolve (fonte, linhas). Se nem no tamanho mínimo couber, corta as linhas
    que sobram e termina a última com reticências.
    """
    tamanho = tamanho_inicial
    while True:
        fonte = _carregar_fonte(nome_fonte, tamanho)
        linhas = quebrar_em_linhas(draw, texto, fonte, largura_max)
        if len(linhas) * _altura_linha(draw, fonte) <= altura_max or tamanho <= tamanho_minimo:
            break
        tamanho = max(tamanho_minimo, tamanho - 4)
    max_linhas = max(1, altura_max // _altura_linha(draw, fonte))
    return fonte, _cortar_com_reticencias(draw, linhas, fonte, largura_max, max_linhas)


def _desenhar_linhas(draw, linhas: list[str], fonte: Fonte, x: int, y: int, cor: str) -> int:
    """Desenha as linhas a partir de (x, y) e devolve o y logo abaixo da última."""
    passo = _altura_linha(draw, fonte)
    for linha in linhas:
        draw.text((x, y), linha, font=fonte, fill=cor)
        y += passo
    return y


def alt_text_padrao(hook: str) -> str:
    """Texto alternativo do card, gerado a partir do gancho."""
    return f"Cartão com o texto: {hook}"


def renderizar_card(hook: str, cta: str | None, destino: Path) -> dict:
    """Desenha o card 1200x1200 do post e salva em `destino` como PNG."""
    imagem = Image.new("RGB", (LARGURA, ALTURA), COR_FUNDO)
    draw = ImageDraw.Draw(imagem)
    draw.rectangle([MARGEM, MARGEM, MARGEM + 120, MARGEM + 12], fill=COR_ROXO)
    draw.rectangle([MARGEM + 132, MARGEM, MARGEM + 200, MARGEM + 12], fill=COR_CIANO)

    largura_util = LARGURA - 2 * MARGEM

    # Rodapé: assinatura no canto inferior esquerdo
    fonte_assinatura = _carregar_fonte(FONTE_TITULO, 36)
    y_assinatura = ALTURA - MARGEM - _altura_linha(draw, fonte_assinatura)
    draw.text((MARGEM, y_assinatura), "Flowity", font=fonte_assinatura, fill=COR_SECUNDARIA)

    # CTA em ciano logo acima da assinatura (até 3 linhas)
    limite_hook = y_assinatura - 48
    if cta and cta.strip():
        fonte_cta, linhas_cta = ajustar_fonte(
            draw, cta.strip(), FONTE_TEXTO, largura_util, 3 * 60,
            tamanho_inicial=44, tamanho_minimo=28,
        )
        altura_cta = len(linhas_cta) * _altura_linha(draw, fonte_cta)
        y_cta = y_assinatura - 40 - altura_cta
        _desenhar_linhas(draw, linhas_cta, fonte_cta, MARGEM, y_cta, COR_CIANO)
        limite_hook = y_cta - 56

    # Gancho: ocupa o miolo, centralizado na vertical
    topo_hook = MARGEM + 12 + 72
    fonte_hook, linhas_hook = ajustar_fonte(
        draw, hook.strip(), FONTE_TITULO, largura_util, limite_hook - topo_hook,
    )
    altura_hook = len(linhas_hook) * _altura_linha(draw, fonte_hook)
    y_hook = topo_hook + max(0, (limite_hook - topo_hook - altura_hook) // 2)
    _desenhar_linhas(draw, linhas_hook, fonte_hook, MARGEM, y_hook, COR_TEXTO)

    destino.parent.mkdir(parents=True, exist_ok=True)
    imagem.save(destino, format="PNG", optimize=True)
    return {"width": LARGURA, "height": ALTURA,
            "size_bytes": destino.stat().st_size, "mime_type": "image/png"}
