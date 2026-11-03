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
    """Raised when the alt text does not meet the rules."""


def validar_alt_text(valor: str | None) -> str:
    """Valida e normaliza o alt_text (espaços repetidos viram um só).

    Raises AltTextInvalido with an English message when it fails.
    """
    if valor is None:
        raise AltTextInvalido("Alt text is required for every image.")
    limpo = " ".join(valor.split())
    if len(limpo) < ALT_MIN or len(limpo) > ALT_MAX:
        raise AltTextInvalido(
            f"Alt text must be {ALT_MIN} to {ALT_MAX} characters long.")
    if limpo.strip(" .!-").lower() in TERMOS_GENERICOS:
        raise AltTextInvalido("Describe the content of the image; do not use generic terms.")
    return limpo


def alt_text_valido(valor: str | None) -> bool:
    """Boolean version of validar_alt_text, used in the audit before publishing."""
    try:
        validar_alt_text(valor)
    except AltTextInvalido:
        return False
    return True
