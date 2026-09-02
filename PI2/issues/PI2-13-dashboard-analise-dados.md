<!-- TITLE: [PI2][P1][Frontend] Dashboard de análise de dados: fluxo de posts, engajamento e comparação LinkedIn x X -->
<!-- LABELS: area:frontend,prio:p1,sprint:pi2,type:task -->

## Contexto (PI 2)

O relatório final do PI 1 apontou duas lacunas ligadas: faltam relatórios e dashboards mostrando os dias de maior fluxo e de maior engajamento, e existe interesse em comparar o desempenho entre LinkedIn e X, que hoje só é possível abrindo as duas plataformas na mão. A issue PI2-12 entrega o endpoint `GET /metrics/summary` com esses números; esta issue os transforma em uma tela. Como o projeto não tem nenhuma biblioteca de gráficos instalada, o gráfico de barras é feito com SVG inline acessível, sem aumentar o bundle e sem depender de um pacote que não passa pela revisão de acessibilidade do PI 2.

## Integrante responsável

João Maike Silva de Jesus

## Branch

`feat/pi2-13-dashboard-analise-dados`

## Estimativa

12 a 16 horas

## Arquivos que você vai criar ou editar

- `frontend/src/pages/AnalyticsPage.jsx` - nova página do dashboard
- `frontend/src/components/analytics/StatCard.jsx` - cartão de indicador
- `frontend/src/components/analytics/BarChart.jsx` - gráfico de barras em SVG inline acessível
- `frontend/src/components/analytics/PlatformCompare.jsx` - comparação LinkedIn contra X
- `frontend/src/lib/api.js` - adiciona `metricsApi`
- `frontend/src/lib/analyticsFormat.mjs` - funções puras de formatação e de período (testáveis)
- `frontend/src/App.jsx` - registra a rota `/analytics`
- `frontend/src/components/layout/AppShell.jsx` - adiciona o item "Analytics" no menu lateral

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-13-dashboard-analise-dados
```

**Passo 2 - Adicionar o cliente da API**

Nunca use `fetch` direto: toda comunicação passa por `frontend/src/lib/api.js`. Acrescente o bloco abaixo depois de `generationApi`:

```javascript
// METRICS (PI 2)
export const metricsApi = {
  summary: (params) => api.get("/metrics/summary", { params }),
  create: (postId, data) => api.post(`/posts/${postId}/metrics`, data),
  import: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/metrics/import", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
```

**Passo 3 - Criar as funções puras de formatação**

Deixe a lógica sem React em um arquivo próprio, no mesmo estilo de `frontend/src/lib/generatorValidation.mjs`. Isso deixa a lógica testável pela issue PI2-16.

Crie `frontend/src/lib/analyticsFormat.mjs`:

```javascript
/**
 * Funções puras usadas pelo dashboard de análise (PI 2).
 * Sem React e sem acesso à rede, para poderem ser testadas isoladamente.
 */
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export const PRESETS = [
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "custom", label: "Período personalizado" },
];

/** Converte o preset escolhido nos parâmetros from/to do endpoint. */
export function periodoParaParams(preset, customFrom, customTo, hoje = new Date()) {
  if (preset === "custom") {
    if (!customFrom || !customTo) return null;
    return {
      from: startOfDay(new Date(customFrom)).toISOString(),
      to: endOfDay(new Date(customTo)).toISOString(),
    };
  }
  const dias = Number(preset);
  return {
    from: startOfDay(subDays(hoje, dias)).toISOString(),
    to: endOfDay(hoje).toISOString(),
  };
}

/** 0.0317 vira "3,17%". Valor ausente vira travessão. */
export function formatarTaxa(valor) {
  if (valor === null || valor === undefined) return "—";
  return `${(valor * 100).toFixed(2).replace(".", ",")}%`;
}

/** 9 vira "09h". */
export function formatarHora(hora) {
  if (hora === null || hora === undefined) return "—";
  return `${String(hora).padStart(2, "0")}h`;
}

/** "2026-W36" vira "sem. 36". */
export function rotuloSemana(semana) {
  const partes = String(semana).split("-W");
  return partes.length === 2 ? `sem. ${partes[1]}` : String(semana);
}

/** Texto do intervalo para o cabeçalho da página. */
export function rotuloPeriodo(from, to) {
  if (!from || !to) return "";
  return `${format(new Date(from), "dd/MM/yyyy")} a ${format(new Date(to), "dd/MM/yyyy")}`;
}
```

**Passo 4 - Criar o `StatCard`**

Crie `frontend/src/components/analytics/StatCard.jsx`. Ele usa as classes utilitárias do projeto (`card`, `text-text-muted`, `text-flowity-purple`) definidas em `src/styles/theme.css` e no `tailwind.config.js`.

```jsx
import React from "react";

/**
 * Cartão de indicador do dashboard.
 * O valor é lido por leitores de tela junto do rótulo por causa do aria-labelledby.
 */
export default function StatCard({ id, icon: Icon, label, value, hint, loading }) {
  return (
    <div className="card" role="group" aria-labelledby={`${id}-label`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon ? <Icon size={16} className="text-flowity-cyan" aria-hidden="true" /> : null}
        <h3 id={`${id}-label`} className="text-xs font-medium text-text-muted uppercase tracking-wide">
          {label}
        </h3>
      </div>

      {loading ? (
        <div className="h-7 w-24 bg-bg-elevated rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-semibold text-text-primary">{value}</p>
      )}

      {hint ? <p className="text-xs text-text-muted mt-1">{hint}</p> : null}
    </div>
  );
}
```

**Passo 5 - Criar o `BarChart` em SVG inline acessível**

Este é o passo mais importante da issue. Regras que valem para todos os gráficos do PI 2:

1. O `<svg>` recebe `role="img"` e um `aria-labelledby` apontando para `<title>` e `<desc>` internos.
2. Logo abaixo do gráfico vai uma `<table>` com os mesmos dados, escondida só visualmente com `sr-only`. Quem usa leitor de tela lê a tabela; quem enxerga vê o gráfico. Nunca use `display: none`, porque isso remove a tabela da árvore de acessibilidade.
3. A informação nunca é transmitida só pela cor: cada barra tem o valor escrito como rótulo de texto ao lado, e a barra destacada recebe também uma hachura (`pattern`) além da cor diferente.

Se a classe `sr-only` ainda não existir no projeto, acrescente em `frontend/src/styles/theme.css`:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Crie `frontend/src/components/analytics/BarChart.jsx`:

```jsx
import React, { useId } from "react";

/**
 * Gráfico de barras horizontais em SVG inline, sem biblioteca externa.
 *
 * props:
 *   titulo      - título do gráfico
 *   descricao   - frase que resume o gráfico para leitores de tela
 *   dados       - [{ rotulo, valor, valorFormatado, destaque }]
 *   unidade     - texto usado no cabeçalho da tabela escondida
 */
export default function BarChart({ titulo, descricao, dados, unidade = "Valor" }) {
  const idBase = useId();
  const tituloId = `${idBase}-titulo`;
  const descId = `${idBase}-desc`;
  const hachuraId = `${idBase}-hachura`;

  if (!dados || dados.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-medium text-text-primary mb-1">{titulo}</h3>
        <p className="text-sm text-text-muted">Sem dados no período selecionado.</p>
      </div>
    );
  }

  const maximo = Math.max(...dados.map((d) => d.valor), 1);
  const alturaBarra = 28;
  const espaco = 10;
  const larguraRotulo = 96;
  const larguraTotal = 520;
  const larguraUtil = larguraTotal - larguraRotulo - 64;
  const altura = dados.length * (alturaBarra + espaco);

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-text-primary mb-3">{titulo}</h3>

      <svg
        role="img"
        aria-labelledby={`${tituloId} ${descId}`}
        viewBox={`0 0 ${larguraTotal} ${altura}`}
        className="w-full h-auto"
      >
        <title id={tituloId}>{titulo}</title>
        <desc id={descId}>{descricao}</desc>

        <defs>
          {/* Hachura: o destaque não depende apenas da cor (WCAG 1.4.1). */}
          <pattern id={hachuraId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#1CD8DE" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#080810" strokeWidth="2" />
          </pattern>
        </defs>

        {dados.map((item, indice) => {
          const y = indice * (alturaBarra + espaco);
          const largura = Math.max((item.valor / maximo) * larguraUtil, 2);
          return (
            <g key={item.rotulo}>
              <text
                x="0"
                y={y + alturaBarra / 2 + 4}
                className="fill-current text-text-muted"
                fontSize="12"
              >
                {item.rotulo}
              </text>
              <rect
                x={larguraRotulo}
                y={y}
                width={largura}
                height={alturaBarra}
                rx="4"
                fill={item.destaque ? `url(#${hachuraId})` : "#9C83F7"}
                stroke={item.destaque ? "#1CD8DE" : "none"}
                strokeWidth={item.destaque ? 1.5 : 0}
              />
              <text
                x={larguraRotulo + largura + 8}
                y={y + alturaBarra / 2 + 4}
                className="fill-current text-text-secondary"
                fontSize="12"
              >
                {item.valorFormatado ?? item.valor}
                {item.destaque ? " (maior)" : ""}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Mesma informação em tabela, escondida visualmente e disponível ao leitor de tela. */}
      <table className="sr-only">
        <caption>{titulo}</caption>
        <thead>
          <tr>
            <th scope="col">Categoria</th>
            <th scope="col">{unidade}</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={item.rotulo}>
              <th scope="row">{item.rotulo}</th>
              <td>
                {item.valorFormatado ?? item.valor}
                {item.destaque ? " (maior valor do período)" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Passo 6 - Criar o `PlatformCompare`**

A comparação usa a mesma métrica normalizada nas duas plataformas, a taxa de engajamento, porque comparar impressões absolutas de LinkedIn e X levaria a conclusão errada: as bases de audiência são de tamanhos diferentes. As impressões continuam visíveis como contexto, mas não são a métrica da comparação.

Crie `frontend/src/components/analytics/PlatformCompare.jsx`:

```jsx
import React from "react";
import BarChart from "./BarChart";
import { formatarTaxa } from "../../lib/analyticsFormat.mjs";

const NOMES = { linkedin: "LinkedIn", x: "X" };

export default function PlatformCompare({ porPlataforma }) {
  const lista = porPlataforma ?? [];
  const melhor = lista.reduce(
    (acc, item) => (!acc || item.engagement_rate > acc.engagement_rate ? item : acc),
    null
  );

  const dados = lista.map((item) => ({
    rotulo: NOMES[item.platform] ?? item.platform,
    valor: item.engagement_rate,
    valorFormatado: formatarTaxa(item.engagement_rate),
    destaque: melhor ? item.platform === melhor.platform : false,
  }));

  return (
    <section aria-labelledby="comparacao-plataformas">
      <h2 id="comparacao-plataformas" className="text-sm font-medium text-text-primary mb-3">
        LinkedIn contra X
      </h2>

      <BarChart
        titulo="Taxa de engajamento por plataforma"
        descricao="Comparação da taxa de engajamento, calculada como curtidas mais comentários mais compartilhamentos dividido por impressões, entre LinkedIn e X no período selecionado."
        dados={dados}
        unidade="Taxa de engajamento"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {lista.map((item) => (
          <div key={item.platform} className="card">
            <h3 className="text-sm font-medium text-text-primary">
              {NOMES[item.platform] ?? item.platform}
            </h3>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Posts publicados</dt>
                <dd className="text-text-secondary">{item.posts}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Impressões</dt>
                <dd className="text-text-secondary">{item.impressions.toLocaleString("pt-BR")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Taxa de engajamento</dt>
                <dd className="text-text-secondary">{formatarTaxa(item.engagement_rate)}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Passo 7 - Criar a `AnalyticsPage`**

Crie `frontend/src/pages/AnalyticsPage.jsx`:

```jsx
import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, TrendingUp, CalendarDays, Clock } from "lucide-react";
import StatCard from "../components/analytics/StatCard";
import BarChart from "../components/analytics/BarChart";
import PlatformCompare from "../components/analytics/PlatformCompare";
import SelectField from "../components/shared/SelectField";
import EmptyState from "../components/shared/EmptyState";
import { metricsApi } from "../lib/api";
import {
  PRESETS,
  periodoParaParams,
  formatarTaxa,
  formatarHora,
  rotuloSemana,
  rotuloPeriodo,
} from "../lib/analyticsFormat.mjs";

export default function AnalyticsPage() {
  const [preset, setPreset] = useState("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    const params = periodoParaParams(preset, customFrom, customTo);
    if (!params) return;

    setLoading(true);
    setErro("");
    try {
      const res = await metricsApi.summary(params);
      setResumo(res.data);
    } catch {
      setErro("Não foi possível carregar as métricas. Verifique se a API está no ar.");
      setResumo(null);
    } finally {
      setLoading(false);
    }
  }, [preset, customFrom, customTo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const semanas = (resumo?.posts_por_semana ?? []).map((item) => {
    const maior = Math.max(...(resumo?.posts_por_semana ?? []).map((s) => s.publicados), 0);
    return {
      rotulo: rotuloSemana(item.semana),
      valor: item.publicados,
      valorFormatado: `${item.publicados} posts`,
      destaque: item.publicados === maior && maior > 0,
    };
  });

  const semDados = !loading && !erro && (resumo?.total_publicados ?? 0) === 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Analytics</h1>
        <p className="text-text-muted text-sm mt-0.5">
          Fluxo de publicações, engajamento e comparação entre plataformas
          {resumo ? ` — ${rotuloPeriodo(resumo.periodo_de, resumo.periodo_ate)}` : ""}
        </p>
      </div>

      {/* ── Filtro de período ─────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label htmlFor="periodo" className="label">Período</label>
          <SelectField
            id="periodo"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            options={PRESETS}
            selectClassName="w-52 text-sm"
          />
        </div>

        {preset === "custom" && (
          <>
            <div>
              <label htmlFor="de" className="label">De</label>
              <input
                id="de"
                type="date"
                className="input text-sm"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ate" className="label">Até</label>
              <input
                id="ate"
                type="date"
                className="input text-sm"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {loading ? "Carregando métricas" : `Métricas atualizadas para ${resumo?.total_publicados ?? 0} posts publicados`}
      </p>

      {erro && (
        <div role="alert" className="card border border-status-failed/40 mb-6">
          <p className="text-sm text-text-secondary">{erro}</p>
        </div>
      )}

      {/* ── Cartões ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <StatCard
          id="publicados"
          icon={BarChart3}
          label="Posts publicados"
          value={resumo?.total_publicados ?? 0}
          loading={loading}
        />
        <StatCard
          id="taxa"
          icon={TrendingUp}
          label="Taxa média de engajamento"
          value={formatarTaxa(resumo?.engagement_rate)}
          hint="(curtidas + comentários + compartilhamentos) / impressões"
          loading={loading}
        />
        <StatCard
          id="melhor-dia"
          icon={CalendarDays}
          label="Melhor dia da semana"
          value={resumo?.melhor_dia_engajamento?.dia_semana ?? "—"}
          hint={
            resumo?.melhor_dia_engajamento
              ? formatarTaxa(resumo.melhor_dia_engajamento.engagement_rate_medio)
              : undefined
          }
          loading={loading}
        />
        <StatCard
          id="melhor-horario"
          icon={Clock}
          label="Melhor horário"
          value={formatarHora(resumo?.melhor_horario_engajamento?.hora)}
          hint={
            resumo?.melhor_horario_engajamento
              ? formatarTaxa(resumo.melhor_horario_engajamento.engagement_rate_medio)
              : undefined
          }
          loading={loading}
        />
      </div>

      {semDados ? (
        <EmptyState
          title="Nenhuma métrica no período"
          description="Registre métricas em um post publicado ou importe um CSV para ver os gráficos."
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <BarChart
            titulo="Publicações por semana"
            descricao="Número de posts publicados em cada semana do período selecionado."
            dados={semanas}
            unidade="Posts publicados"
          />
          <PlatformCompare porPlataforma={resumo?.por_plataforma} />
        </div>
      )}
    </div>
  );
}
```

**Passo 8 - Registrar a rota e o item do menu**

Em `frontend/src/App.jsx`, importe a página e acrescente a rota dentro do `<Routes>` interno:

```jsx
import AnalyticsPage from "./pages/AnalyticsPage";
```

```jsx
                <Route path="/analytics" element={<AnalyticsPage />} />
```

Em `frontend/src/components/layout/AppShell.jsx`, acrescente `BarChart3` ao import do `lucide-react` e o item ao `NAV_ITEMS`, entre Pipeline e Settings:

```jsx
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
```

**Passo 9 - Conferir a acessibilidade na mão**

```bash
cd frontend
npm run dev
```

Com a página aberta em `http://localhost:5173/analytics`:

1. Navegue só com Tab. Todo controle precisa receber foco visível, na ordem em que aparece na tela.
2. Abra o DevTools, aba Elements, e confirme que a `<table class="sr-only">` está no DOM com os mesmos números do gráfico.
3. No DevTools, force a simulação de daltonismo (Rendering, Emulate vision deficiencies, Achromatopsia). Todos os números continuam legíveis, porque cada barra tem rótulo de texto e a barra destacada tem hachura.
4. Rode o Lighthouse na categoria Accessibility.

**Passo 10 - Commit e Pull Request**

```bash
git add frontend/src/pages/AnalyticsPage.jsx frontend/src/components/analytics/ frontend/src/lib/analyticsFormat.mjs frontend/src/lib/api.js frontend/src/App.jsx frontend/src/components/layout/AppShell.jsx frontend/src/styles/theme.css
git commit -m "feat(frontend): cria dashboard de analise com fluxo, engajamento e comparacao de plataformas

Adiciona a pagina Analytics com quatro cartoes de indicador, grafico de
publicacoes por semana e comparacao LinkedIn contra X pela taxa de
engajamento normalizada. Os graficos sao SVG inline com title, desc e
tabela equivalente em sr-only, e o destaque usa hachura e rotulo de
texto, nunca apenas cor."
git push -u origin feat/pi2-13-dashboard-analise-dados
gh pr create --base main --title "[PI2][P1][Frontend] Dashboard de analise de dados" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

Tela `/analytics` com o filtro em "Últimos 30 dias":

```text
Analytics
Fluxo de publicações, engajamento e comparação entre plataformas — 03/08/2026 a 02/09/2026

Período: [ Últimos 30 dias  v ]

┌ POSTS PUBLICADOS ─┐ ┌ TAXA MÉDIA DE ENG. ┐ ┌ MELHOR DIA ──────┐ ┌ MELHOR HORÁRIO ──┐
│ 18                │ │ 2,98%              │ │ quarta           │ │ 09h              │
│                   │ │ (l+c+s)/impressões │ │ 4,12%            │ │ 4,55%            │
└───────────────────┘ └────────────────────┘ └──────────────────┘ └──────────────────┘

Publicações por semana                 LinkedIn contra X
sem. 31  ████████            4 posts   LinkedIn  ▓▓▓▓▓▓▓▓▓▓▓  3,31% (maior)
sem. 32  ██████████  5 posts (maior)   X         ██████       1,89%
sem. 33  ████████            4 posts
sem. 34  ██████████  5 posts (maior)

(a barra destacada usa hachura ciano com borda, além do rótulo "(maior)")
```

Trecho equivalente lido por leitor de tela, vindo da tabela `sr-only`:

```html
<table class="sr-only">
  <caption>Taxa de engajamento por plataforma</caption>
  <thead><tr><th scope="col">Categoria</th><th scope="col">Taxa de engajamento</th></tr></thead>
  <tbody>
    <tr><th scope="row">LinkedIn</th><td>3,31% (maior valor do período)</td></tr>
    <tr><th scope="row">X</th><td>1,89%</td></tr>
  </tbody>
</table>
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Tabela equivalente presente | Contar `<table class="sr-only">` no DOM da página | 1 tabela por gráfico, com o mesmo número de linhas das barras |
| Informação sem depender de cor | DevTools, Rendering, Emulate vision deficiencies, Achromatopsia | 100% dos valores continuam identificáveis por texto ou hachura |
| Violações de acessibilidade | Lighthouse, categoria Accessibility, na rota `/analytics` | pontuação maior ou igual a 95 e 0 erro de contraste |
| Navegação por teclado | Percorrer a página só com Tab e Shift+Tab | todo controle alcançável, com foco visível, sem armadilha de foco |
| Tempo até a tela pintar | DevTools, aba Network, com o backend local respondendo | menos de 1,5 s do clique no menu até os cartões preenchidos |
| Nenhuma dependência nova | `git diff frontend/package.json` | arquivo sem alteração |

## Definition of Done

- [ ] `AnalyticsPage.jsx`, `StatCard.jsx`, `BarChart.jsx` e `PlatformCompare.jsx` criados
- [ ] Rota `/analytics` registrada no `App.jsx` e item "Analytics" no menu do `AppShell.jsx`
- [ ] `metricsApi` adicionado em `src/lib/api.js` e nenhum `fetch` direto na página
- [ ] Gráfico em SVG inline com `role="img"`, `<title>`, `<desc>` e `aria-labelledby`
- [ ] Cada gráfico tem uma `<table class="sr-only">` com os mesmos dados
- [ ] Barra destacada usa hachura e rótulo de texto, além da cor
- [ ] Filtro de período com 30 dias, 90 dias e intervalo personalizado usando `date-fns`
- [ ] Estado de carregamento, estado de erro com `role="alert"` e estado vazio implementados
- [ ] Nenhuma biblioteca de gráficos adicionada ao `package.json`
- [ ] Print da tela e resultado do Lighthouse anexados ao PR
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- WAI - Complex images e alternativas textuais: https://www.w3.org/WAI/tutorials/images/complex/
- WCAG 2.1 - Critério 1.4.1 Uso de cor: https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html
- WCAG 2.1 - Critério 1.1.1 Conteúdo não textual: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
- MDN - Elemento `<svg>` e acessibilidade: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/title
- MDN - `<table>` com `scope` e `caption`: https://developer.mozilla.org/en-US/docs/Learn/HTML/Tables/Advanced
- date-fns - `subDays`, `startOfDay`, `format`: https://date-fns.org/docs/Getting-Started
- React - `useId`: https://react.dev/reference/react/useId
- Chrome DevTools - Emular deficiências visuais: https://developer.chrome.com/docs/devtools/rendering/emulate-css
- Issue PI2-12, que entrega o endpoint `GET /metrics/summary`
