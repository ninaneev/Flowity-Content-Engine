"""
Serviço de geração de conteúdo.
Modo 1 — template: sempre funciona, sem IA.
Modo 2 — ollama: usa LLM local real.
Se o Ollama falhar ou o JSON vier inválido, cai automaticamente para template.
"""
import json
from sqlalchemy.orm import Session
from app.models.source import Source
from app.models.generation import GenerationRun
from app.schemas.generation import GenerationRequest, GenerationResult
from app.services import ollama_client


# ── Templates fixos ───────────────────────────────────────────────────────────
TONE_OPENERS = {
    "estratégico": "A maioria das empresas ignora isso:",
    "educativo":   "Aprendi isso do jeito difícil:",
    "inspiracional": "Uma coisa que mudou como trabalho:",
    "direto":      "Sem rodeios:",
}

FORMAT_STRUCTURES = {
    "lista":     "→ Ponto 1\n→ Ponto 2\n→ Ponto 3",
    "narrativa": "Contexto → Conflito → Resolução",
    "pergunta":  "Você já percebeu que...?",
    "dado":      "X% das empresas...",
}


def _build_template_output(sources: list[Source], request: GenerationRequest) -> dict:
    """Gera conteúdo de fallback baseado nas sources e nas configurações."""
    opener = TONE_OPENERS.get(request.tone, "Reflexão importante:")
    structure = FORMAT_STRUCTURES.get(request.format, "")

    # Extrai os primeiros 200 chars de cada source como matéria-prima
    source_excerpts = [s.content[:200] for s in sources]
    main_idea = source_excerpts[0] if source_excerpts else "Conteúdo da Flowity AI"

    hook = f"{opener} {main_idea[:150]}..."

    body_parts = [f"Com base em {len(sources)} referência(s) selecionada(s):\n", structure, ""]
    for i, src in enumerate(sources, 1):
        body_parts.append(f"{i}. {src.title}: {src.content[:100]}...")

    body = "\n".join(body_parts)
    cta = f"Gostou? Salve e compartilhe. Seguindo a Flowity AI para mais sobre IA aplicada a negócios."
    short_x = f"{hook[:200]} #FlowityAI #IA"

    return {"hook": hook, "body": body, "cta": cta, "short_x": short_x, "alt_title": None}


async def generate_content(
    db: Session,
    request: GenerationRequest,
    sources: list[Source],
) -> GenerationResult:
    """
    Ponto de entrada principal.
    1. Tenta Ollama se mode == 'ollama'
    2. Fallback automático para template se falhar
    3. Salva o GenerationRun no banco sempre
    """
    mode_used = "template"
    model_used = "template-fallback"
    raw_output = None
    parsed = None
    token_estimate = 0
    status = "complete"

    # ── Modo Ollama ───────────────────────────────────────────────
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
            # Ollama falhou → fallback para template
            print(f"[generator] Ollama falhou ({e}), usando template.")
            parsed = None
            status = "complete"  # ainda é sucesso, apenas modo diferente

    # ── Modo Template (ou fallback) ───────────────────────────────
    if parsed is None:
        parsed = _build_template_output(sources, request)
        mode_used = "template"
        model_used = "template-fallback"

    # ── Persiste o GenerationRun ──────────────────────────────────
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
