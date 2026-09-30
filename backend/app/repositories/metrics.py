from sqlalchemy.orm import Session
from app.models.post_metric import PostMetric
from app.schemas.metric import MetricCreate, MetricsSummary, ResumoDiaSemana, ResumoPlataforma


def create(db: Session, post_id: int, data: MetricCreate) -> PostMetric:
    """Insere um novo registro de métrica para um post no banco de dados."""
    db_metric = PostMetric(
        post_id=post_id,
        platform=data.platform,
        impressions=data.impressions,
        likes=data.likes,
        comments=data.comments,
        shares=data.shares,
        clicks=data.clicks,
        collected_at=data.collected_at,
        source=data.source,
    )
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric


def get_summary(db: Session) -> MetricsSummary:
    """Gera o resumo das métricas, considerando apenas a coleta mais recente de cada post por plataforma."""
    # Busca todas as métricas ordenadas por data de coleta do mais antigo para o mais recente
    metrics = db.query(PostMetric).order_by(PostMetric.collected_at.asc()).all()

    # Guarda apenas a coleta MAIS RECENTE para cada chave (post_id, platform)
    latest_metrics: dict[tuple[int, str], PostMetric] = {}
    for m in metrics:
        latest_metrics[(m.post_id, m.platform)] = m

    recent_list = list(latest_metrics.values())

    # Se não houver dados, retorna zerado
    if not recent_list:
        return MetricsSummary(
            total_publicados=0,
            engagement_rate=0.0,
            por_plataforma=[]
        )

    # Agrupa as métricas mais recentes por plataforma
    platform_data: dict[str, list[PostMetric]] = {}
    for m in recent_list:
        platform_data.setdefault(m.platform, []).append(m)

    por_plataforma = []
    total_eng_rates = []

    # Calcula totais e médias por rede social
    for platform, items in platform_data.items():
        total_posts = len(items)
        total_impressions = sum(i.impressions for i in items)
        
        # Média da taxa de engajamento da plataforma
        rates = [i.engagement_rate for i in items]
        avg_eng_rate = sum(rates) / len(rates) if rates else 0.0
        
        por_plataforma.append(
            ResumoPlataforma(
                platform=platform,
                posts=total_posts,
                impressions=total_impressions,
                engagement_rate=round(avg_eng_rate, 4)
            )
        )
        total_eng_rates.extend(rates)
        por_plataforma[-1].interacoes = sum(_interacoes(i) for i in items)

    # Total de posts únicos com métricas cadastradas
    total_publicados = len({m.post_id for m in recent_list})
    overall_eng_rate = sum(total_eng_rates) / len(total_eng_rates) if total_eng_rates else 0.0

    return MetricsSummary(
        total_publicados=total_publicados,
        engagement_rate=round(overall_eng_rate, 4),
        por_plataforma=por_plataforma,
        total_impressoes=sum(m.impressions for m in recent_list),
        total_interacoes=sum(_interacoes(m) for m in recent_list),
        por_dia_semana=_por_dia_semana(recent_list),
    )


def _interacoes(m: PostMetric) -> int:
    """Mesma soma usada em PostMetric.engagement_rate."""
    return m.likes + m.comments + m.shares


def _por_dia_semana(recent_list: list[PostMetric]) -> list[ResumoDiaSemana]:
    """Taxa média de engajamento agrupada pelo dia da semana da publicação.

    A taxa é uma propriedade Python (não uma coluna), por isso a agregação é
    feita aqui e não com func.avg no SQL. O dia segue a convenção "dow" do
    PostgreSQL: 0 = domingo ... 6 = sábado. Posts sem published_at ficam de fora.
    """
    grupos: dict[int, list[float]] = {}
    for m in recent_list:
        publicado_em = m.post.published_at if m.post else None
        if publicado_em is None:
            continue
        dia = (publicado_em.weekday() + 1) % 7  # weekday(): segunda = 0
        grupos.setdefault(dia, []).append(m.engagement_rate)
    return [
        ResumoDiaSemana(dia=dia, media=round(sum(taxas) / len(taxas), 4), publicacoes=len(taxas))
        for dia, taxas in sorted(grupos.items())
    ]