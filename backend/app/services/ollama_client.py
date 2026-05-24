"""HTTP client for Ollama."""
import httpx
from app.core.config import settings


async def generate(prompt: str) -> tuple[str, int]:
    """Send a prompt to Ollama and return generated text plus token estimate."""
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            text = data.get("response", "")
            tokens = data.get("eval_count", len(text.split()) * 2)
            return text, tokens
    except httpx.ConnectError:
        raise RuntimeError("Ollama is unavailable. Make sure the ollama container is running.")
    except httpx.TimeoutException:
        raise RuntimeError("Ollama took too long to respond. Try a smaller model.")
    except Exception as e:
        raise RuntimeError(f"Ollama error: {str(e)}")


async def is_available() -> bool:
    """Check whether Ollama is online."""
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
    """Build the full Ollama prompt."""
    objective_line = f"Objective: {objective}" if objective else ""
    extra_line = f"Extra instructions: {extra}" if extra else ""

    return f"""You are Flowity AI's content creator. Flowity AI helps companies automate operations with artificial intelligence.

FLOWITY AI POSITIONING:
- We help founders and teams automate processes with AI
- Tone: strategic, direct, practical
- Audience: founders, product leaders, technology teams
- Differentiator: real operational results, not theory

REFERENCE SOURCES (use these ideas; do not invent unrelated points):
{sources_text}

GENERATION INSTRUCTIONS:
- Channel: {channel}
- Tone: {tone}
- Format: {format_type}
{objective_line}
{extra_line}

OUTPUT FORMAT (respond with exactly this JSON shape, with no extra text):
{{
  "hook": "impactful first line, max 280 characters",
  "body": "post body, line breaks allowed",
  "cta": "final call to action, max 280 characters",
  "short_x": "condensed X/Twitter version, max 280 characters",
  "alt_title": "optional alternate title"
}}

Return only valid JSON. Nothing else."""
