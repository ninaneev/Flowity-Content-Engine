"""Content generation service with template and Ollama modes."""
import json
from sqlalchemy.orm import Session
from app.models.source import Source
from app.models.generation import GenerationRun
from app.schemas.generation import GenerationRequest, GenerationResult
from app.services import ollama_client


TONE_OPENERS = {
    "strategic": "Most companies miss this:",
    "educational": "Here is the lesson worth keeping:",
    "inspirational": "One thing changed how I work:",
    "direct": "No fluff:",
    "estratégico": "Most companies miss this:",
    "educativo": "Here is the lesson worth keeping:",
    "inspiracional": "One thing changed how I work:",
    "direto": "No fluff:",
}

FORMAT_STRUCTURES = {
    "list": "- Point 1\n- Point 2\n- Point 3",
    "narrative": "Context -> Conflict -> Resolution",
    "question": "Have you noticed that...?",
    "data point": "X% of companies...",
    "lista": "- Point 1\n- Point 2\n- Point 3",
    "narrativa": "Context -> Conflict -> Resolution",
    "pergunta": "Have you noticed that...?",
    "dado": "X% of companies...",
}


def _build_template_output(sources: list[Source], request: GenerationRequest) -> dict:
    """Generate fallback content from selected sources and settings."""
    opener = TONE_OPENERS.get(request.tone, "Important reflection:")
    structure = FORMAT_STRUCTURES.get(request.format, "")

    source_excerpts = [s.content[:200] for s in sources]
    main_idea = source_excerpts[0] if source_excerpts else "Flowity AI content"

    hook = f"{opener} {main_idea[:150]}..."

    body_parts = [f"Based on {len(sources)} selected reference(s):\n", structure, ""]
    for i, src in enumerate(sources, 1):
        body_parts.append(f"{i}. {src.title}: {src.content[:100]}...")

    body = "\n".join(body_parts)
    cta = "Save this and share it with someone building AI-powered operations."
    short_x = f"{hook[:200]} #FlowityAI #AI"

    return {"hook": hook, "body": body, "cta": cta, "short_x": short_x, "alt_title": None}


async def generate_content(
    db: Session,
    request: GenerationRequest,
    sources: list[Source],
) -> GenerationResult:
    """Generate content, falling back to the template mode when Ollama fails."""
    mode_used = "template"
    model_used = "template-fallback"
    raw_output = None
    parsed = None
    token_estimate = 0
    status = "complete"

    if request.mode == "ollama":
        sources_text = "\n\n".join(
            f"[{s.title}] ({s.source_type})\n{s.content}" for s in sources
        )
        prompt = ollama_client.build_prompt(
            sources_text=sources_text,
            channel=request.channel,
            tone=request.tone,
            objective=request.objective,
            format_type=request.format,
            extra=request.extra_instructions,
        )
        try:
            raw_output, token_estimate = await ollama_client.generate(prompt)
            parsed = json.loads(raw_output)
            mode_used = "ollama"
            model_used = "ollama/" + __import__("app.core.config", fromlist=["settings"]).settings.OLLAMA_MODEL
        except (RuntimeError, json.JSONDecodeError, KeyError) as e:
            print(f"[generator] Ollama failed ({e}); using template mode.")
            parsed = None
            status = "complete"

    if parsed is None:
        parsed = _build_template_output(sources, request)
        mode_used = "template"
        model_used = "template-fallback"

    run = GenerationRun(
        prompt_used=raw_output and prompt if request.mode == "ollama" else None,  # type: ignore[possibly-undefined]
        model_used=model_used,
        mode=mode_used,
        raw_output=raw_output,
        parsed_hook=parsed.get("hook"),
        parsed_body=parsed.get("body"),
        parsed_cta=parsed.get("cta"),
        parsed_short_x=parsed.get("short_x"),
        token_estimate=token_estimate,
        status=status,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    return GenerationResult(
        hook=parsed.get("hook", ""),
        body=parsed.get("body", ""),
        cta=parsed.get("cta", ""),
        short_x=parsed.get("short_x", ""),
        alt_title=parsed.get("alt_title"),
        source_ids=[s.id for s in sources],
        mode=mode_used,
        model_used=model_used,
        run_id=run.id,
    )
