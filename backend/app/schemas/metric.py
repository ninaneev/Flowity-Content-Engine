from datetime import datetime
from pydantic import BaseModel, Field, field_validator

# ── Schema para criação/envio de métricas ─────────────────────────────────────
class MetricCreate(BaseModel):
    # Identifica a rede social (ex: "linkedin" ou "x")
    platform: str
    
    # Contadores numéricos das métricas (devem ser maiores ou iguais a zero: ge=0)
    impressions: int = Field(default=0, ge=0)
    likes: int = Field(default=0, ge=0)
    comments: int = Field(default=0, ge=0)
    shares: int = Field(default=0, ge=0)
    clicks: int = Field(default=0, ge=0)
    
    # Data/hora em que os dados foram coletados no painel da rede social
    collected_at: datetime
    
    # Origem do registro: "manual" (digitado na mão) ou "import" (via script)
    source: str = "manual"

    # Validador para garantir que a plataforma seja apenas "linkedin" ou "x"
    @field_validator("platform")
    @classmethod
    def validate_platform(cls, v: str) -> str:
        allowed = {"linkedin", "x"}
        if v.lower() not in allowed:
            raise ValueError("platform deve ser 'linkedin' ou 'x'")
        return v.lower()

    # Validador para garantir que a origem seja apenas "manual" ou "import"
    @field_validator("source")
    @classmethod
    def validate_source(cls, v: str) -> str:
        allowed = {"manual", "import"}
        if v.lower() not in allowed:
            raise ValueError("source deve ser 'manual' ou 'import'")
        return v.lower()


# ── Schema de resposta ao salvar/consultar uma métrica ────────────────────────
class MetricResponse(MetricCreate):
    # Herda todos os campos do MetricCreate e acrescenta as informações geradas pelo banco de dados
    id: int
    post_id: int
    engagement_rate: float  # Taxa de engajamento calculada pela propriedade do model
    created_at: datetime    # Data/hora de inserção do registro no sistema

    # Permite a conversão automática de objetos do SQLAlchemy (ORM) para dict/JSON
    model_config = {"from_attributes": True}


# ── Schemas para a rota de resumo (dashboard) ──────────────────────────────────
class ResumoPlataforma(BaseModel):
    """Representa a agregação de dados de uma plataforma específica (ex: LinkedIn)."""
    platform: str
    posts: int             # Quantidade de posts analisados nessa plataforma
    impressions: int       # Soma total de impressões
    engagement_rate: float # Média da taxa de engajamento da plataforma


class MetricsSummary(BaseModel):
    """Representa o retorno consolidado do endpoint GET /metrics/summary."""
    total_publicados: int                   # Total de posts únicos com métricas
    engagement_rate: float                  # Taxa média geral de engajamento
    por_plataforma: list[ResumoPlataforma]  # Lista contendo os resumos por rede