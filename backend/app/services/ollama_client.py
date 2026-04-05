"""
Cliente HTTP para o Ollama.
Manda o prompt para o modelo local e retorna o texto gerado.
"""
import json
import httpx
from app.core.config import settings


async def generate(prompt: str) -> tuple[str, int]:
    """
    Chama o Ollama com o prompt e retorna (texto_gerado, tokens_estimados).
    Lança RuntimeError se o Ollama não estiver disponível.
    """
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,  # Retorna tudo de uma vez
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            text = data.get("response", "")
            tokens = data.get("eval_count", len(text.split()) * 2)  # estimativa se não vier
            return text, tokens
    except httpx.ConnectError:
        raise RuntimeError("Ollama não está disponível. Verifique se o container ollama está rodando.")
    except httpx.TimeoutException:
        raise RuntimeError("Ollama demorou demais para responder. Tente um modelo menor.")
    except Exception as e:
        raise RuntimeError(f"Erro no Ollama: {str(e)}")


async def is_available() -> bool:
    """Verifica se o Ollama está online. Usado no health check."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            return r.status_code == 200
    except Exception:
        return False


def build_prompt(
    sources_text: str,
    channel: str,
    tone: str,
    objective: str | None,
    format_type: str,
    extra: str | None,
) -> str:
    """
    Monta o prompt completo para o Ollama.
    Inclui o posicionamento da Flowity AI, as sources e as instruções de formato.
    """
    objective_line = f"Objetivo: {objective}" if objective else ""
    extra_line = f"Instruções extras: {extra}" if extra else ""

    return f"""Você é o criador de conteúdo da Flowity AI, empresa de automação e inteligência artificial para negócios.

POSICIONAMENTO DA FLOWITY AI:
- Ajudamos founders e times a automatizar processos com IA
- Tom: estratégico, direto, sem enrolação
- Audiência: founders, líderes de produto, times de tecnologia
- Diferencial: resultados reais, não teoria

FONTES DE REFERÊNCIA (use estas ideias, não invente do nada):
{sources_text}

INSTRUÇÕES DE GERAÇÃO:
- Canal: {channel}
- Tom: {tone}
- Formato: {format_type}
{objective_line}
{extra_line}

FORMATO DE SAÍDA (responda EXATAMENTE neste JSON, sem texto adicional fora do JSON):
{{
  "hook": "primeira linha impactante, máximo 280 caracteres",
  "body": "desenvolvimento do post, pode ter quebras de linha",
  "cta": "chamada para ação final, máximo 280 caracteres",
  "short_x": "versão condensada para X/Twitter, máximo 280 caracteres",
  "alt_title": "título alternativo opcional"
}}

Responda APENAS com o JSON válido acima. Nada mais."""
