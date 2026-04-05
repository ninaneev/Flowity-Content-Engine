"""Schemas Pydantic para geração de conteúdo."""
from datetime import datetime
from pydantic import BaseModel


class GenerationRequest(BaseModel):
    source_ids: list[int]           # 1 a 3 sources obrigatórias
    channel: str = "linkedin"       # linkedin | x
    tone: str = "estratégico"       # estratégico | educativo | inspiracional | direto
    objective: str | None = None    # ex: "gerar leads", "educar audiência"
    format: str = "lista"           # lista | narrativa | pergunta | dado
    extra_instructions: str | None = None
    mode: str = "template"          # "template" (sempre funciona) | "ollama" (LLM real)


class GenerationResult(BaseModel):
    hook: str
    body: str
    cta: str
    short_x: str
    alt_title: str | None = None
    source_ids: list[int]
    mode: str          # "template" ou "ollama"
    model_used: str    # nome do modelo ou "template-fallback"
    run_id: int | None = None


class GenerationRunResponse(BaseModel):
    id: int
    post_id: int | None
    mode: str
    model_used: str | None
    parsed_hook: str | None
    parsed_body: str | None
    parsed_cta: str | None
    parsed_short_x: str | None
    token_estimate: int | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
