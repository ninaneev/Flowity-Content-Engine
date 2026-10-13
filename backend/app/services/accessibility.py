"""Regra única do texto alternativo (alt_text) das imagens.

Base normativa: Lei 13.146/2015 (Lei Brasileira de Inclusão), artigo 63, e
eMAG, recomendação 3.6 — toda imagem precisa de alternativa em texto.

A mesma regra é usada pelos schemas (envio e edição do asset) e pela
auditoria que bloqueia agendar ou publicar um post com imagem sem descrição.
"""

ALT_MIN = 10
ALT_MAX = 300
TERMOS_GENERICOS = {
    "imagem", "imagens", "foto", "fotos", "figura", "print", "screenshot",
    "image", "images", "picture", "photo", "img", "banner", "slide", "post",
    "sem descricao", "sem descrição",
}


class AltTextInvalido(ValueError):
    """Levantado quando o texto alternativo não atende às regras."""


def validar_alt_text(valor: str | None) -> str:
    """Valida e normaliza o alt_text (espaços repetidos viram um só).

    Levanta AltTextInvalido com a mensagem em português quando reprova.
    """
    if valor is None:
        raise AltTextInvalido("O texto alternativo é obrigatório para toda imagem.")
    limpo = " ".join(valor.split())
    if len(limpo) < ALT_MIN or len(limpo) > ALT_MAX:
        raise AltTextInvalido(
            f"O texto alternativo precisa ter de {ALT_MIN} a {ALT_MAX} caracteres.")
    if limpo.strip(" .!-").lower() in TERMOS_GENERICOS:
        raise AltTextInvalido("Descreva o conteúdo da imagem, não use termos genéricos.")
    return limpo


def alt_text_valido(valor: str | None) -> bool:
    """Versão booleana de validar_alt_text, usada na auditoria antes de publicar."""
    try:
        validar_alt_text(valor)
    except AltTextInvalido:
        return False
    return True
