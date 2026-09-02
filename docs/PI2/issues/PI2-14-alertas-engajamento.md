<!-- TITLE: [PI2][P1][Full-stack] Alertas de posts abaixo do limite mínimo de engajamento (configurável) -->
<!-- LABELS: area:backend,area:frontend,prio:p1,sprint:pi2,type:task -->

## Contexto (PI 2)

O relatório final do PI 1 pediu, junto dos relatórios de fluxo e engajamento, um mecanismo de alerta para posts que ficam abaixo de um limite mínimo configurável. Hoje um post que teve desempenho ruim simplesmente passa despercebido: ninguém volta ao calendário para conferir. Esta issue fecha essa lacuna criando a tabela `alert_settings`, com o limite editável pelo usuário, o endpoint que devolve os posts abaixo dele e a apresentação acessível desses alertas no Dashboard e na página de Analytics. O limite é configurável de propósito, porque o valor certo muda com o tamanho da audiência e com a plataforma.

## Integrante responsável

Tiago Antonio Ferreira

## Branch

`feat/pi2-14-alertas-engajamento`

## Estimativa

10 a 14 horas

## Arquivos que você vai criar ou editar

- `backend/app/models/alert_setting.py` - novo modelo ORM `AlertSetting` (tabela `alert_settings`)
- `backend/app/schemas/alert.py` - schemas Pydantic v2 da configuração e do alerta
- `backend/app/repositories/alerts.py` - leitura e escrita da configuração e a query dos alertas
- `backend/app/routes/alerts.py` - `GET /settings/alerts`, `PUT /settings/alerts` e `GET /alerts`
- `backend/app/main.py` - registra o router de alertas
- `backend/app/db/database.py` - registra o novo módulo em `create_tables()`
- `backend/alembic/versions/0007_criar_alert_settings.py` - migração da tabela
- `frontend/src/lib/api.js` - adiciona `alertsApi`
- `frontend/src/components/alerts/AlertBanner.jsx` - banner e lista de alertas acessível
- `frontend/src/pages/SettingsPage.jsx` - nova seção "Alertas"
- `frontend/src/pages/AnalyticsPage.jsx` - exibe o banner de alertas
- `frontend/src/pages/DashboardPage.jsx` - exibe o banner de alertas

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-14-alertas-engajamento
```

Esta issue depende de `post_metrics`, entregue pela issue PI2-12. Confirme que `GET /metrics/summary` já está em `main` antes de começar.

**Passo 2 - Criar o modelo `AlertSetting`**

Crie `backend/app/models/alert_setting.py`, no mesmo padrão SQLAlchemy 2.0 do resto do projeto:

```python
"""Modelo ORM da tabela alert_settings: limites mínimos de desempenho por plataforma."""
from datetime import datetime
from sqlalchemy import String, Float, Integer, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base

# Sugestão de ponto de partida: 2% de taxa de engajamento no LinkedIn.
# É apenas o valor inicial da linha criada no primeiro acesso; o número
# real varia com o tamanho da audiência e é editável pelo usuário na
# tela de Settings a qualquer momento.
LIMITE_PADRAO_LINKEDIN = 0.02


class AlertSetting(Base):
    """Cada linha é uma regra de alerta para uma métrica em uma plataforma."""
    __tablename__ = "alert_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # ── Regra ─────────────────────────────────────────────────────
    metric: Mapped[str] = mapped_column(
        String(30), nullable=False,
        comment="engagement_rate | impressions | likes"
    )
    threshold: Mapped[float] = mapped_column(
        Float, nullable=False,
        comment="Limite mínimo. Para engagement_rate use fração: 0.02 = 2%"
    )
    platform: Mapped[str] = mapped_column(
        String(20), default="linkedin", nullable=False,
        comment="linkedin | x | all"
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ── Janela de espera ──────────────────────────────────────────
    min_age_days: Mapped[int] = mapped_column(
        Integer, default=3, nullable=False,
        comment="Só alerta posts publicados há mais de N dias, para dar tempo de acumular alcance"
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
```

Registre o módulo em `create_tables()`, em `backend/app/db/database.py`:

```python
    from app.models import source, post, generation, post_asset, post_metric, alert_setting  # noqa: F401
```

**Passo 3 - Criar os schemas**

Crie `backend/app/schemas/alert.py`:

```python
"""Schemas Pydantic da configuração de alertas e dos alertas gerados."""
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

METRICAS = {"engagement_rate", "impressions", "likes"}
PLATAFORMAS = {"linkedin", "x", "all"}


class AlertSettingUpdate(BaseModel):
    metric: str = "engagement_rate"
    threshold: float = Field(ge=0)
    platform: str = "linkedin"
    enabled: bool = True
    min_age_days: int = Field(default=3, ge=0, le=90)

    @field_validator("metric")
    @classmethod
    def validar_metrica(cls, v: str) -> str:
        if v not in METRICAS:
            raise ValueError(f"metric deve ser um de: {', '.join(sorted(METRICAS))}")
        return v

    @field_validator("platform")
    @classmethod
    def validar_plataforma(cls, v: str) -> str:
        if v not in PLATAFORMAS:
            raise ValueError(f"platform deve ser um de: {', '.join(sorted(PLATAFORMAS))}")
        return v


class AlertSettingResponse(AlertSettingUpdate):
    id: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class AlertItem(BaseModel):
    """Um post publicado que ficou abaixo do limite configurado."""
    post_id: int
    hook: str
    platform: str
    published_at: datetime
    metric: str
    valor: float
    limite: float
    deficit_percentual: float = Field(
        description="Quanto o post ficou abaixo do limite, em porcentagem do limite"
    )


class AlertList(BaseModel):
    configuracao: AlertSettingResponse
    total: int
    alertas: list[AlertItem]
```

**Passo 4 - Criar o repositório com a query do alerta**

A regra em uma frase: entre os posts com status `published`, publicados há mais de `min_age_days` dias, olhamos a coleta de métricas mais recente de cada um e mantemos os que ficaram abaixo de `threshold` na métrica escolhida.

Crie `backend/app/repositories/alerts.py`:

```python
"""Configuração de alertas e cálculo dos posts abaixo do limite."""
from datetime import datetime, timedelta
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.post import Post
from app.models.post_metric import PostMetric
from app.models.alert_setting import AlertSetting, LIMITE_PADRAO_LINKEDIN
from app.schemas.alert import AlertSettingUpdate


def get_setting(db: Session) -> AlertSetting:
    """Retorna a configuração. Cria a linha padrão no primeiro acesso."""
    setting = db.execute(select(AlertSetting).limit(1)).scalar_one_or_none()
    if setting:
        return setting

    setting = AlertSetting(
        metric="engagement_rate",
        threshold=LIMITE_PADRAO_LINKEDIN,  # 2% — apenas o ponto de partida, editável
        platform="linkedin",
        enabled=True,
        min_age_days=3,
    )
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


def update_setting(db: Session, data: AlertSettingUpdate) -> AlertSetting:
    """Atualiza a configuração existente."""
    setting = get_setting(db)
    for chave, valor in data.model_dump().items():
        setattr(setting, chave, valor)
    db.commit()
    db.refresh(setting)
    return setting


def _valor_da_metrica(metric: str, m: PostMetric) -> float:
    if metric == "engagement_rate":
        if not m.impressions:
            return 0.0
        return (m.likes + m.comments + m.shares) / m.impressions
    if metric == "impressions":
        return float(m.impressions)
    return float(m.likes)


def listar_alertas(db: Session) -> dict:
    """
    Posts publicados abaixo do limite configurado.

    A subquery pega a coleta mais recente de cada par (post, plataforma);
    sem isso, uma coleta antiga do mesmo post entraria na conta e o post
    apareceria duas vezes na lista.
    """
    setting = get_setting(db)

    if not setting.enabled:
        return {"configuracao": setting, "total": 0, "alertas": []}

    limite_data = datetime.utcnow() - timedelta(days=setting.min_age_days)

    ultima_coleta = (
        select(
            PostMetric.post_id.label("post_id"),
            PostMetric.platform.label("platform"),
            func.max(PostMetric.collected_at).label("ultima"),
        )
        .group_by(PostMetric.post_id, PostMetric.platform)
        .subquery()
    )

    stmt = (
        select(Post, PostMetric)
        .join(PostMetric, PostMetric.post_id == Post.id)
        .join(
            ultima_coleta,
            (ultima_coleta.c.post_id == PostMetric.post_id)
            & (ultima_coleta.c.platform == PostMetric.platform)
            & (ultima_coleta.c.ultima == PostMetric.collected_at),
        )
        .where(
            Post.status == "published",
            Post.published_at.is_not(None),
            Post.published_at <= limite_data,
        )
        .order_by(Post.published_at.desc())
    )

    if setting.platform != "all":
        stmt = stmt.where(PostMetric.platform == setting.platform)

    alertas = []
    for post, metric in db.execute(stmt).all():
        valor = _valor_da_metrica(setting.metric, metric)
        if valor >= setting.threshold:
            continue
        deficit = 0.0
        if setting.threshold:
            deficit = round((1 - valor / setting.threshold) * 100, 1)
        alertas.append({
            "post_id": post.id,
            "hook": post.hook,
            "platform": metric.platform,
            "published_at": post.published_at,
            "metric": setting.metric,
            "valor": round(valor, 4),
            "limite": setting.threshold,
            "deficit_percentual": deficit,
        })

    return {"configuracao": setting, "total": len(alertas), "alertas": alertas}
```

**Passo 5 - Criar as rotas**

Crie `backend/app/routes/alerts.py`:

```python
"""Rotas de configuração e leitura de alertas (PI 2)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import get_current_admin
from app.schemas.alert import AlertSettingUpdate, AlertSettingResponse, AlertList
from app.repositories import alerts as alert_repo

router = APIRouter()


@router.get("/settings/alerts", response_model=AlertSettingResponse, tags=["Alerts"])
def ler_configuracao(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Lê o limite mínimo configurado. Cria o padrão de 2% no primeiro acesso."""
    return alert_repo.get_setting(db)


@router.put("/settings/alerts", response_model=AlertSettingResponse, tags=["Alerts"])
def salvar_configuracao(
    data: AlertSettingUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Atualiza o limite mínimo, a plataforma, a métrica e a janela de espera."""
    return alert_repo.update_setting(db, data)


@router.get("/alerts", response_model=AlertList, tags=["Alerts"])
def listar_alertas(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Posts publicados há mais de N dias que ficaram abaixo do limite."""
    return alert_repo.listar_alertas(db)
```

Registre no `backend/app/main.py`:

```python
from app.routes import auth, sources, posts, generation, automation, metrics, alerts
```

```python
app.include_router(alerts.router,     prefix="",            tags=["Alerts"])
```

**Passo 6 - Criar a migração**

```bash
cd backend
alembic heads
alembic revision -m "cria tabela alert_settings"
```

Renomeie para `0007_criar_alert_settings.py`, ajuste `down_revision` e escreva:

```python
"""cria tabela alert_settings

Revision ID: 0007_criar_alert_settings
"""
from alembic import op
import sqlalchemy as sa

revision = "0007_criar_alert_settings"
down_revision = "0006_criar_post_metrics"  # confira com: alembic heads
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "alert_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("metric", sa.String(length=30), nullable=False),
        sa.Column("threshold", sa.Float(), nullable=False),
        sa.Column("platform", sa.String(length=20), nullable=False, server_default="linkedin"),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("min_age_days", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    # Linha padrão: 2% de taxa de engajamento no LinkedIn, editável na tela de Settings.
    op.execute(
        "INSERT INTO alert_settings (metric, threshold, platform, enabled, min_age_days) "
        "VALUES ('engagement_rate', 0.02, 'linkedin', 1, 3)"
    )


def downgrade() -> None:
    op.drop_table("alert_settings")
```

```bash
cd backend
alembic upgrade head
```

**Passo 7 - Adicionar o cliente da API no frontend**

Em `frontend/src/lib/api.js`, depois de `metricsApi`:

```javascript
// ALERTS (PI 2)
export const alertsApi = {
  getSettings: () => api.get("/settings/alerts"),
  saveSettings: (data) => api.put("/settings/alerts", data),
  list: () => api.get("/alerts"),
};
```

**Passo 8 - Criar o `AlertBanner`**

Regras de acessibilidade obrigatórias neste componente:

1. O container recebe `role="status"` e `aria-live="polite"`, para o leitor de tela anunciar a quantidade de alertas quando ela mudar, sem interromper o que a pessoa está fazendo.
2. O alerta nunca é indicado só pelo vermelho: há sempre o ícone `AlertTriangle` com a palavra "Abaixo do limite" ao lado. Quem não distingue cores continua entendendo.
3. O ícone leva `aria-hidden="true"`, porque o texto ao lado já diz a mesma coisa e a repetição atrapalha.

Crie `frontend/src/components/alerts/AlertBanner.jsx`:

```jsx
import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { alertsApi } from "../../lib/api";

function formatarValor(metric, valor) {
  if (metric === "engagement_rate") {
    return `${(valor * 100).toFixed(2).replace(".", ",")}%`;
  }
  return String(valor);
}

/**
 * Banner e lista de posts abaixo do limite mínimo configurado.
 * props: compacto = true mostra só o resumo (usado no Dashboard).
 */
export default function AlertBanner({ compacto = false }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alertsApi
      .list()
      .then((r) => setDados(r.data))
      .catch(() => setDados(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !dados) return null;

  const total = dados.total;
  const limite = dados.configuracao.threshold;
  const metric = dados.configuracao.metric;

  if (total === 0) {
    return (
      <div role="status" aria-live="polite" className="card flex items-center gap-2 mb-4">
        <CheckCircle size={16} className="text-status-published" aria-hidden="true" />
        <p className="text-sm text-text-secondary">
          Nenhum post abaixo do limite de {formatarValor(metric, limite)}.
        </p>
      </div>
    );
  }

  return (
    <section
      role="status"
      aria-live="polite"
      aria-labelledby="titulo-alertas"
      className="card border border-status-failed/40 mb-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={16} className="text-status-failed" aria-hidden="true" />
        <h2 id="titulo-alertas" className="text-sm font-medium text-text-primary">
          Abaixo do limite: {total} {total === 1 ? "post" : "posts"}
        </h2>
      </div>

      <p className="text-xs text-text-muted mb-3">
        Limite configurado: {formatarValor(metric, limite)} em {dados.configuracao.platform}.
        Ajuste em Settings, seção Alertas.
      </p>

      {!compacto && (
        <ul className="space-y-2">
          {dados.alertas.map((alerta) => (
            <li
              key={`${alerta.post_id}-${alerta.platform}`}
              className="flex items-start justify-between gap-3 border-t border-border pt-2"
            >
              <div className="min-w-0">
                <p className="text-sm text-text-secondary truncate">{alerta.hook}</p>
                <p className="text-xs text-text-muted">
                  {alerta.platform} — publicado em{" "}
                  {format(new Date(alerta.published_at), "dd/MM/yyyy")}
                </p>
              </div>
              <p className="text-xs text-text-secondary whitespace-nowrap">
                <span className="font-medium">Abaixo do limite</span>:{" "}
                {formatarValor(metric, alerta.valor)} de {formatarValor(metric, alerta.limite)}
                {" "}({alerta.deficit_percentual}% abaixo)
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

**Passo 9 - Criar a seção "Alertas" na `SettingsPage`**

Em `frontend/src/pages/SettingsPage.jsx`, acrescente `AlertTriangle` ao import do `lucide-react`, importe `alertsApi` e adicione o card abaixo dentro do `<div className="space-y-4">` existente. O formulário segue o padrão da página: `label`, `input` e `btn-primary` do `theme.css`.

```jsx
function SecaoAlertas() {
  const [config, setConfig] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    alertsApi.getSettings().then((r) => setConfig(r.data)).catch(() => setConfig(null));
  }, []);

  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      const res = await alertsApi.saveSettings({
        metric: config.metric,
        threshold: Number(config.threshold),
        platform: config.platform,
        enabled: config.enabled,
        min_age_days: Number(config.min_age_days),
      });
      setConfig(res.data);
      setMensagem("Limite salvo.");
    } catch {
      setMensagem("Não foi possível salvar o limite.");
    } finally {
      setSalvando(false);
    }
  }

  if (!config) return null;

  return (
    <form className="card" onSubmit={salvar}>
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangle size={18} className="text-flowity-purple" aria-hidden="true" />
        <h2 className="font-medium text-text-primary text-sm">Alertas</h2>
      </div>

      <p className="text-xs text-text-muted mb-4">
        Posts publicados que ficarem abaixo do limite aparecem no Dashboard e em Analytics.
        O valor sugerido de 2% no LinkedIn é apenas um ponto de partida: ajuste conforme o
        tamanho da sua audiência.
      </p>

      <div className="space-y-3">
        <div>
          <label htmlFor="alerta-limite" className="label">
            Taxa mínima de engajamento (%)
          </label>
          <input
            id="alerta-limite"
            type="number"
            min="0"
            max="100"
            step="0.1"
            className="input text-sm"
            value={(config.threshold * 100).toFixed(1)}
            onChange={(e) => setConfig({ ...config, threshold: Number(e.target.value) / 100 })}
            aria-describedby="alerta-limite-ajuda"
          />
          <p id="alerta-limite-ajuda" className="text-xs text-text-muted mt-1">
            Exemplo: 2 significa alertar posts com menos de 2% de engajamento.
          </p>
        </div>

        <div>
          <label htmlFor="alerta-dias" className="label">Só alertar depois de (dias)</label>
          <input
            id="alerta-dias"
            type="number"
            min="0"
            max="90"
            className="input text-sm"
            value={config.min_age_days}
            onChange={(e) => setConfig({ ...config, min_age_days: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="alerta-ativo"
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
          />
          <label htmlFor="alerta-ativo" className="text-sm text-text-secondary">
            Alertas ativos
          </label>
        </div>

        <button type="submit" className="btn-primary text-sm" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar limite"}
        </button>

        <p role="status" aria-live="polite" className="text-xs text-text-muted">
          {mensagem}
        </p>
      </div>
    </form>
  );
}
```

**Passo 10 - Exibir o banner nas duas telas**

Em `frontend/src/pages/AnalyticsPage.jsx`, importe e renderize logo abaixo do cabeçalho:

```jsx
import AlertBanner from "../components/alerts/AlertBanner";
```

```jsx
      <AlertBanner />
```

Em `frontend/src/pages/DashboardPage.jsx`, faça o mesmo com a versão compacta, acima do calendário:

```jsx
      <AlertBanner compacto />
```

**Passo 11 - Testar**

```bash
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
```

1. Registre uma métrica ruim em um post publicado há mais de 3 dias (por exemplo 1000 impressões e 5 curtidas: 0,5%).
2. Abra `/analytics`. O post precisa aparecer na lista.
3. Vá em Settings, mude o limite para 0,1% e salve. Volte em `/analytics`: o post sai da lista.
4. Com o leitor de tela (NVDA no Windows, ou VoiceOver no Mac), confirme que a mudança na quantidade de alertas é anunciada.

**Passo 12 - Commit e Pull Request**

```bash
git add backend/app/models/alert_setting.py backend/app/schemas/alert.py backend/app/repositories/alerts.py backend/app/routes/alerts.py backend/app/main.py backend/app/db/database.py backend/alembic/versions/0007_criar_alert_settings.py frontend/src/components/alerts/ frontend/src/lib/api.js frontend/src/pages/SettingsPage.jsx frontend/src/pages/AnalyticsPage.jsx frontend/src/pages/DashboardPage.jsx
git commit -m "feat(full-stack): alertas de posts abaixo do limite minimo configuravel

Cria a tabela alert_settings com metrica, limite, plataforma, janela de
espera e flag de ativacao, mais os endpoints de leitura, escrita e
listagem dos posts abaixo do limite. No frontend adiciona a secao
Alertas em Settings e o banner acessivel no Dashboard e em Analytics,
com role status, aria-live polite e indicacao por icone e texto, nunca
apenas por cor."
git push -u origin feat/pi2-14-alertas-engajamento
gh pr create --base main --title "[PI2][P1][Full-stack] Alertas de posts abaixo do limite minimo de engajamento" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

Configurar o limite em 2,5%:

```bash
curl -X PUT http://localhost:8000/settings/alerts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"metric":"engagement_rate","threshold":0.025,"platform":"linkedin","enabled":true,"min_age_days":3}'
```

Listar os alertas:

```bash
curl -s http://localhost:8000/alerts -H "Authorization: Bearer $TOKEN"
```

```json
{
  "configuracao": {
    "id": 1,
    "metric": "engagement_rate",
    "threshold": 0.025,
    "platform": "linkedin",
    "enabled": true,
    "min_age_days": 3,
    "updated_at": "2026-09-02T15:10:04"
  },
  "total": 2,
  "alertas": [
    {
      "post_id": 31,
      "hook": "O que ninguem te conta sobre churn silencioso",
      "platform": "linkedin",
      "published_at": "2026-08-26T09:00:00",
      "metric": "engagement_rate",
      "valor": 0.005,
      "limite": 0.025,
      "deficit_percentual": 80.0
    },
    {
      "post_id": 27,
      "hook": "Tres sinais que aparecem antes do cancelamento",
      "platform": "linkedin",
      "published_at": "2026-08-19T08:30:00",
      "metric": "engagement_rate",
      "valor": 0.018,
      "limite": 0.025,
      "deficit_percentual": 28.0
    }
  ]
}
```

Como o banner aparece na tela de Analytics:

```text
⚠ Abaixo do limite: 2 posts
Limite configurado: 2,50% em linkedin. Ajuste em Settings, seção Alertas.
─────────────────────────────────────────────────────────────────────────
O que ninguem te conta sobre churn silencioso   Abaixo do limite: 0,50% de 2,50% (80% abaixo)
linkedin — publicado em 26/08/2026
─────────────────────────────────────────────────────────────────────────
Tres sinais que aparecem antes do cancelamento  Abaixo do limite: 1,80% de 2,50% (28% abaixo)
linkedin — publicado em 19/08/2026
```

O ícone de triângulo e as palavras "Abaixo do limite" carregam a informação; o vermelho é só reforço visual.

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Limite realmente configurável | `PUT /settings/alerts` com 0.05, depois `GET /alerts` | a lista muda de tamanho de acordo com o novo limite, sem reiniciar a API |
| Janela de espera respeitada | Post publicado hoje com engajamento zero, `min_age_days = 3` | post não aparece em `GET /alerts` |
| Sem duplicidade por coletas antigas | Registrar 3 coletas do mesmo post na mesma plataforma | o post aparece uma única vez na lista |
| Alerta não depende de cor | DevTools, Rendering, Achromatopsia, na tela `/analytics` | 100% dos alertas continuam identificáveis por ícone e texto |
| Anúncio para leitor de tela | NVDA ou VoiceOver na mudança da quantidade de alertas | o total é anunciado, sem interromper a leitura em curso |
| Tempo de resposta | `GET /alerts` com 200 posts e 400 coletas | menos de 400 ms |

## Definition of Done

- [ ] Tabela `alert_settings` criada com `metric`, `threshold`, `platform`, `enabled`, `min_age_days` e `updated_at`
- [ ] Revisão `0007_criar_alert_settings` sobe e desce sem erro e insere a linha padrão de 2%
- [ ] `GET /settings/alerts`, `PUT /settings/alerts` e `GET /alerts` respondendo e protegidos por `get_current_admin`
- [ ] A query usa a coleta mais recente por par post e plataforma, sem duplicar posts
- [ ] Seção "Alertas" na `SettingsPage` salvando o limite e mostrando confirmação em `aria-live`
- [ ] `AlertBanner` com `role="status"` e `aria-live="polite"` no Dashboard e em Analytics
- [ ] Alerta indicado por ícone mais texto, nunca só pela cor vermelha
- [ ] Documentado no PR que 2% é sugestão inicial e não regra fixa
- [ ] Nenhuma rota existente quebrada
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- WAI-ARIA - `role="status"` e regiões live: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
- MDN - `aria-live`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live
- WCAG 2.1 - Critério 1.4.1 Uso de cor: https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html
- WCAG 2.1 - Critério 4.1.3 Mensagens de status: https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html
- SQLAlchemy 2.0 - Subqueries e joins: https://docs.sqlalchemy.org/en/20/tutorial/data_select.html#tutorial-subqueries-ctes
- FastAPI - Dependências e segurança: https://fastapi.tiangolo.com/tutorial/dependencies/
- Issue PI2-12, que entrega a tabela `post_metrics`
- Issue PI2-13, que entrega a página `/analytics`
