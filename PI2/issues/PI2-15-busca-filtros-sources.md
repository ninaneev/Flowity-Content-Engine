<!-- TITLE: [PI2][P1][Full-stack] Busca e filtros avançados na biblioteca de referências (Sources) -->
<!-- LABELS: area:backend,area:frontend,prio:p1,sprint:pi2,type:task -->

## Contexto (PI 2)

O relatório final do PI 1 registrou que a busca e a classificação das referências cadastradas precisa de mais filtros: com a biblioteca crescendo, encontrar a referência certa na hora de escrever um post ficou lento. Hoje `GET /sources/` devolve a tabela inteira e o filtro acontece dentro do navegador, em memória, sobre título e tipo apenas. Esta issue move a busca para o banco e acrescenta busca textual em título, conteúdo e notas, filtro por tags, por período, por uso, ordenação e paginação. É a issue que fecha a pergunta em aberto do PI 1 sobre localizar referências relacionadas de forma eficiente.

## Integrante responsável

Diego Gustavo Franco

## Branch

`feat/pi2-15-busca-filtros-sources`

## Estimativa

12 a 16 horas

## Arquivos que você vai criar ou editar

- `backend/app/repositories/sources.py` - nova função `search()` com todos os filtros e a contagem total
- `backend/app/routes/sources.py` - `GET /sources/` ganha os parâmetros e o header `X-Total-Count`
- `backend/app/schemas/source.py` - schema `SourceListParams` e o campo derivado `used`
- `backend/app/models/source.py` - nada muda na tabela; documenta o uso de `tags_json`
- `frontend/src/lib/api.js` - `sourcesApi.list` passa a aceitar parâmetros
- `frontend/src/lib/useDebounce.mjs` - hook de debounce de 300 ms
- `frontend/src/components/sources/SourceFilters.jsx` - busca com debounce, chips de tags, contador e ordenação
- `frontend/src/pages/SourcesPage.jsx` - passa a buscar no servidor e mostra o estado vazio explicativo

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-15-busca-filtros-sources
```

**Passo 2 - Entender o modelo antes de mexer**

Leia `backend/app/models/source.py`. A tabela `sources` já existe com:

```python
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, ...)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    theme: Mapped[str | None] = mapped_column(String(100))
    audience: Mapped[str | None] = mapped_column(String(100))
    origin: Mapped[str | None] = mapped_column(String(255))
    tags_json: Mapped[str | None] = mapped_column(Text, comment="JSON array de tags, ex: [\"ia\",\"saas\"]")
    notes: Mapped[str | None] = mapped_column(Text)
```

As tags já existem como coluna `tags_json`, guardando um array JSON em texto. Não crie tabela nova de tags e não troque para uma coluna JSON nativa: PostgreSQL tem `JSONB` mas o SQLite do ambiente local não, e a mudança quebraria o desenvolvimento offline do time. O filtro de tags é feito com `LIKE` sobre o texto do array, que funciona igual nos dois bancos. Nenhuma migração é necessária nesta issue.

**Passo 3 - Escrever o `search()` no repositório**

Acrescente ao final de `backend/app/repositories/sources.py`. Mantenha a função `get_all` existente, porque o gerador ainda a usa.

```python
"""(continuação de backend/app/repositories/sources.py)"""
import json
from datetime import datetime
from sqlalchemy import select, func, or_, and_, desc, asc
from app.models.post import Post

SORT_OPTIONS = {"recentes", "mais_usadas", "alfabetica"}


def _clausula_busca(q: str):
    """Busca textual em título, conteúdo e notas, sem diferenciar maiúsculas."""
    termo = f"%{q.strip().lower()}%"
    return or_(
        func.lower(Source.title).like(termo),
        func.lower(Source.content).like(termo),
        func.lower(func.coalesce(Source.notes, "")).like(termo),
    )


def _clausulas_tags(tags: list[str], modo: str):
    """
    Filtro por tags sobre a coluna tags_json.
    modo "and": a source precisa ter todas as tags.
    modo "or":  basta ter uma delas.
    """
    condicoes = [
        func.lower(func.coalesce(Source.tags_json, "")).like(f'%"{t.strip().lower()}"%')
        for t in tags if t.strip()
    ]
    if not condicoes:
        return None
    return and_(*condicoes) if modo == "and" else or_(*condicoes)


def search(
    db: Session,
    q: str | None = None,
    tags: list[str] | None = None,
    tags_mode: str = "and",
    source_type: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    used: bool | None = None,
    sort: str = "recentes",
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[Source], int]:
    """
    Busca com filtros combináveis.
    Retorna a página pedida e o total de resultados antes da paginação,
    que a rota devolve no header X-Total-Count.
    """
    # Subquery com a contagem de posts em que cada source foi usada.
    usos = (
        select(
            post_sources.c.source_id.label("source_id"),
            func.count(post_sources.c.post_id).label("total"),
        )
        .group_by(post_sources.c.source_id)
        .subquery()
    )

    stmt = select(Source, func.coalesce(usos.c.total, 0).label("usos")).outerjoin(
        usos, usos.c.source_id == Source.id
    )

    if q:
        stmt = stmt.where(_clausula_busca(q))

    if tags:
        clausula = _clausulas_tags(tags, tags_mode)
        if clausula is not None:
            stmt = stmt.where(clausula)

    if source_type:
        stmt = stmt.where(Source.source_type == source_type)

    if date_from:
        stmt = stmt.where(Source.created_at >= date_from)

    if date_to:
        stmt = stmt.where(Source.created_at <= date_to)

    if used is True:
        stmt = stmt.where(func.coalesce(usos.c.total, 0) > 0)
    elif used is False:
        stmt = stmt.where(func.coalesce(usos.c.total, 0) == 0)

    # Total antes de paginar, para o X-Total-Count.
    total = db.execute(
        select(func.count()).select_from(stmt.order_by(None).subquery())
    ).scalar_one()

    if sort == "mais_usadas":
        stmt = stmt.order_by(desc("usos"), desc(Source.created_at))
    elif sort == "alfabetica":
        stmt = stmt.order_by(asc(func.lower(Source.title)))
    else:  # recentes
        stmt = stmt.order_by(desc(Source.created_at))

    stmt = stmt.limit(limit).offset(offset)

    resultados = []
    for source, usos_da_source in db.execute(stmt).all():
        source.used = usos_da_source > 0   # campos derivados, não persistidos
        source.usage_count = usos_da_source
        resultados.append(source)

    return resultados, total


def listar_tags(db: Session) -> list[str]:
    """Todas as tags distintas já cadastradas, para montar os chips do filtro."""
    tags: set[str] = set()
    for (texto,) in db.execute(select(Source.tags_json).where(Source.tags_json.is_not(None))):
        try:
            for tag in json.loads(texto) or []:
                if isinstance(tag, str) and tag.strip():
                    tags.add(tag.strip().lower())
        except (ValueError, TypeError):
            continue  # linha com JSON inválido é ignorada, não derruba a listagem
    return sorted(tags)
```

Se `post_sources` ainda não estiver importável, defina a tabela de associação uma única vez em `backend/app/models/post_source.py` (ela já existe no banco, conforme o modelo de dados documentado no `CLAUDE.md`) e importe no repositório:

```python
"""Tabela de associação entre posts e sources."""
from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.database import Base

post_sources = Table(
    "post_sources",
    Base.metadata,
    Column("id", Integer, primary_key=True),
    Column("post_id", Integer, ForeignKey("posts.id", ondelete="CASCADE"), index=True),
    Column("source_id", Integer, ForeignKey("sources.id", ondelete="CASCADE"), index=True),
    extend_existing=True,
)
```

**Passo 4 - Atualizar os schemas**

Em `backend/app/schemas/source.py`, acrescente os dois campos derivados ao `SourceResponse`. Eles não existem na tabela: são preenchidos pelo repositório e servem para o frontend mostrar o selo "já usada".

```python
class SourceResponse(SourceBase):
    id: int
    created_at: datetime
    updated_at: datetime
    used: bool = False
    usage_count: int = 0

    model_config = {"from_attributes": True}
```

**Passo 5 - Atualizar a rota**

Substitua `list_sources` em `backend/app/routes/sources.py`. Repare no `Response` injetado: é assim que o FastAPI deixa a rota escrever um header sem abrir mão do `response_model`.

```python
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Response


@router.get("/", response_model=list[SourceResponse])
def list_sources(
    response: Response,
    q: str | None = Query(None, description="Busca em título, conteúdo e notas"),
    tags: list[str] | None = Query(None, description="Repita o parâmetro: tags=ia&tags=saas"),
    tags_mode: str = Query("and", pattern="^(and|or)$"),
    type: str | None = Query(None, alias="type"),
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    used: bool | None = Query(None, description="true: já usada em algum post; false: nunca usada"),
    sort: str = Query("recentes", pattern="^(recentes|mais_usadas|alfabetica)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Lista as sources com busca, filtros, ordenação e paginação."""
    resultados, total = source_repo.search(
        db,
        q=q,
        tags=tags,
        tags_mode=tags_mode,
        source_type=type,
        date_from=date_from,
        date_to=date_to,
        used=used,
        sort=sort,
        limit=limit,
        offset=offset,
    )
    response.headers["X-Total-Count"] = str(total)
    response.headers["Access-Control-Expose-Headers"] = "X-Total-Count"
    return resultados


@router.get("/tags", response_model=list[str])
def list_tags(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Todas as tags já cadastradas, usadas para montar os chips do filtro."""
    return source_repo.listar_tags(db)
```

Atenção à ordem das rotas: `/tags` precisa estar declarada antes de `/{source_id}`, senão o FastAPI tenta interpretar "tags" como um id e devolve 422.

O `Access-Control-Expose-Headers` é obrigatório: sem ele o navegador recebe o header mas o axios não consegue lê-lo, porque a requisição é cross-origin entre a porta 5173 e a 8000.

**Passo 6 - Atualizar o cliente da API**

Em `frontend/src/lib/api.js`, troque o bloco de sources:

```javascript
// SOURCES
export const sourcesApi = {
  list:   (params)    => api.get("/sources/", { params }),
  tags:   ()          => api.get("/sources/tags"),
  get:    (id)        => api.get(`/sources/${id}`),
  create: (data)      => api.post("/sources/", data),
  update: (id, data)  => api.put(`/sources/${id}`, data),
};
```

O axios serializa `{ tags: ["ia", "saas"] }` como `tags[]=ia&tags[]=saas`, que o FastAPI não entende. Configure o `paramsSerializer` na instância, logo depois do `axios.create`:

```javascript
api.defaults.paramsSerializer = {
  indexes: null, // gera tags=ia&tags=saas, do jeito que o FastAPI espera
};
```

**Passo 7 - Criar o hook de debounce**

Sem debounce, cada tecla digitada vira uma requisição. Trezentos milissegundos é o intervalo que espera o fim da digitação sem parecer lento.

Crie `frontend/src/lib/useDebounce.mjs`:

```javascript
import { useState, useEffect } from "react";

/** Devolve o valor só depois de `atraso` ms sem mudanças. */
export function useDebounce(valor, atraso = 300) {
  const [debounced, setDebounced] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setDebounced(valor), atraso);
    return () => clearTimeout(temporizador);
  }, [valor, atraso]);

  return debounced;
}
```

**Passo 8 - Reescrever o `SourceFilters`**

Regras de acessibilidade deste componente:

1. Cada chip de tag é um `<button type="button">` de verdade, nunca uma `<div>` com `onClick`, para funcionar com Tab e Enter.
2. Cada chip tem `aria-label="Remover filtro X"`, porque o "x" desenhado dentro dele não diz nada a um leitor de tela.
3. O contador de resultados fica em uma região `aria-live="polite"`, para ser anunciado quando a lista muda sem que o foco saia do campo de busca.
4. O campo de busca tem `<label>` associado por `htmlFor`; o `placeholder` não substitui rótulo.

Substitua `frontend/src/components/sources/SourceFilters.jsx`:

```jsx
import React from "react";
import { Search, X } from "lucide-react";
import SelectField from "../shared/SelectField";

const SOURCE_TYPE_OPTIONS = [
  { value: "post_antigo", label: "Old post" },
  { value: "insight", label: "Insight" },
  { value: "frase", label: "Positioning line" },
  { value: "objecao", label: "Objection" },
  { value: "dor", label: "Pain point" },
  { value: "trecho", label: "Excerpt" },
  { value: "comentario", label: "Comment" },
  { value: "newsletter", label: "Newsletter" },
  { value: "referencia", label: "Reference" },
];

const SORT_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "mais_usadas", label: "Mais usadas" },
  { value: "alfabetica", label: "Ordem alfabética" },
];

const USED_OPTIONS = [
  { value: "", label: "Usadas e não usadas" },
  { value: "true", label: "Já usadas em posts" },
  { value: "false", label: "Ainda não usadas" },
];

export default function SourceFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  tagsDisponiveis,
  tagsSelecionadas,
  onToggleTag,
  tagsMode,
  onTagsModeChange,
  usedFilter,
  onUsedFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sort,
  onSortChange,
  total,
  carregando,
  onLimpar,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <label htmlFor="busca-sources" className="label">Buscar</label>
          <Search
            size={14}
            className="absolute left-3 top-[34px] text-text-muted"
            aria-hidden="true"
          />
          <input
            id="busca-sources"
            type="search"
            className="input pl-8 text-sm bg-bg-surface focus:ring-1 focus:ring-flowity-cyan transition"
            placeholder="Título, conteúdo ou notas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-describedby="contador-sources"
          />
        </div>

        <div>
          <label htmlFor="filtro-tipo" className="label">Tipo</label>
          <SelectField
            id="filtro-tipo"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            options={[{ value: "", label: "Todos os tipos" }, ...SOURCE_TYPE_OPTIONS]}
            selectClassName="w-40 text-sm"
          />
        </div>

        <div>
          <label htmlFor="filtro-uso" className="label">Uso</label>
          <SelectField
            id="filtro-uso"
            value={usedFilter}
            onChange={(e) => onUsedFilterChange(e.target.value)}
            options={USED_OPTIONS}
            selectClassName="w-48 text-sm"
          />
        </div>

        <div>
          <label htmlFor="ordenacao" className="label">Ordenar por</label>
          <SelectField
            id="ordenacao"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            options={SORT_OPTIONS}
            selectClassName="w-44 text-sm"
          />
        </div>

        <div>
          <label htmlFor="data-de" className="label">De</label>
          <input
            id="data-de"
            type="date"
            className="input text-sm"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="data-ate" className="label">Até</label>
          <input
            id="data-ate"
            type="date"
            className="input text-sm"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>
      </div>

      {/* ── Tags disponíveis ─────────────────────────────────── */}
      {tagsDisponiveis.length > 0 && (
        <fieldset>
          <legend className="label">Tags</legend>
          <div className="flex flex-wrap gap-2">
            {tagsDisponiveis.map((tag) => {
              const ativa = tagsSelecionadas.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  aria-pressed={ativa}
                  className={`px-2 py-1 rounded-full text-xs border transition ${
                    ativa
                      ? "bg-flowity-purple-dim text-flowity-purple border-flowity-purple/40"
                      : "text-text-muted border-border hover:text-text-secondary"
                  }`}
                >
                  {ativa ? "✓ " : "+ "}{tag}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* ── Chips das tags selecionadas ──────────────────────── */}
      {tagsSelecionadas.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted">Filtros ativos:</span>
          {tagsSelecionadas.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              aria-label={`Remover filtro ${tag}`}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-flowity-purple-dim text-flowity-purple border border-flowity-purple/40"
            >
              {tag}
              <X size={11} aria-hidden="true" />
            </button>
          ))}

          {tagsSelecionadas.length > 1 && (
            <SelectField
              id="modo-tags"
              value={tagsMode}
              onChange={(e) => onTagsModeChange(e.target.value)}
              options={[
                { value: "and", label: "Todas as tags" },
                { value: "or", label: "Qualquer tag" },
              ]}
              selectClassName="w-40 text-xs"
              aria-label="Combinação das tags"
            />
          )}

          <button type="button" onClick={onLimpar} className="text-xs text-text-muted underline">
            Limpar filtros
          </button>
        </div>
      )}

      {/* ── Contador anunciado por leitor de tela ────────────── */}
      <p id="contador-sources" role="status" aria-live="polite" className="text-xs text-text-muted">
        {carregando
          ? "Buscando referências..."
          : `${total} ${total === 1 ? "referência encontrada" : "referências encontradas"}`}
      </p>
    </div>
  );
}
```

**Passo 9 - Ligar a `SourcesPage` na busca do servidor**

Em `frontend/src/pages/SourcesPage.jsx`, apague o `const filtered = sources.filter(...)` e o filtro em memória. A busca agora acontece no banco. O trecho central fica assim:

```jsx
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [tagsDisponiveis, setTagsDisponiveis] = useState([]);
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [tagsMode, setTagsMode] = useState("and");
  const [usedFilter, setUsedFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("recentes");
  const [total, setTotal] = useState(0);

  const buscaComDebounce = useDebounce(search, 300);

  useEffect(() => {
    sourcesApi.tags().then((r) => setTagsDisponiveis(r.data)).catch(() => setTagsDisponiveis([]));
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sourcesApi.list({
        q: buscaComDebounce || undefined,
        type: typeFilter || undefined,
        tags: tagsSelecionadas.length ? tagsSelecionadas : undefined,
        tags_mode: tagsMode,
        used: usedFilter === "" ? undefined : usedFilter === "true",
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sort,
        limit: 20,
        offset: 0,
      });
      setSources(res.data);
      setTotal(Number(res.headers["x-total-count"] ?? res.data.length));
    } finally {
      setLoading(false);
    }
  }, [buscaComDebounce, typeFilter, tagsSelecionadas, tagsMode, usedFilter, dateFrom, dateTo, sort]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function alternarTag(tag) {
    setTagsSelecionadas((atuais) =>
      atuais.includes(tag) ? atuais.filter((t) => t !== tag) : [...atuais, tag]
    );
  }

  function limparFiltros() {
    setSearch("");
    setTypeFilter("");
    setTagsSelecionadas([]);
    setUsedFilter("");
    setDateFrom("");
    setDateTo("");
    setSort("recentes");
  }

  const temFiltroAtivo =
    Boolean(search || typeFilter || usedFilter || dateFrom || dateTo) || tagsSelecionadas.length > 0;
```

O estado vazio precisa explicar o motivo e oferecer a saída, em vez de mostrar só "nada encontrado":

```jsx
      {!loading && sources.length === 0 && (
        <EmptyState
          title={temFiltroAtivo ? "Nenhuma referência com esses filtros" : "Biblioteca vazia"}
          description={
            temFiltroAtivo
              ? `Nenhuma das ${total === 0 ? "referências cadastradas" : "referências"} combina com a busca "${search}" e os filtros ativos. Remova uma tag ou amplie o período.`
              : "Cadastre a primeira referência para começar a alimentar o gerador de posts."
          }
          action={
            temFiltroAtivo ? (
              <button type="button" className="btn-secondary text-sm" onClick={limparFiltros}>
                Limpar filtros
              </button>
            ) : null
          }
        />
      )}
```

**Passo 10 - Testar**

```bash
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
```

1. Digite no campo de busca e observe a aba Network: precisa sair uma requisição por pausa de digitação, não uma por tecla.
2. Selecione duas tags e alterne entre "Todas as tags" e "Qualquer tag": a quantidade de resultados precisa mudar.
3. Navegue só com Tab até um chip e pressione Enter: o filtro sai.
4. Confirme no Network que a resposta traz o header `X-Total-Count`.

**Passo 11 - Commit e Pull Request**

```bash
git add backend/app/repositories/sources.py backend/app/routes/sources.py backend/app/schemas/source.py backend/app/models/post_source.py frontend/src/lib/api.js frontend/src/lib/useDebounce.mjs frontend/src/components/sources/SourceFilters.jsx frontend/src/pages/SourcesPage.jsx
git commit -m "feat(full-stack): busca e filtros avancados na biblioteca de referencias

GET /sources/ passa a aceitar busca textual em titulo, conteudo e notas,
filtro por tags com combinacao AND ou OR, tipo, periodo, uso em posts,
ordenacao e paginacao, devolvendo o total em X-Total-Count. No frontend
a busca vai para o servidor com debounce de 300 ms, as tags viram chips
removiveis por teclado, o contador de resultados e anunciado em aria-live
e o estado vazio explica o motivo e oferece limpar os filtros."
git push -u origin feat/pi2-15-busca-filtros-sources
gh pr create --base main --title "[PI2][P1][Full-stack] Busca e filtros avancados na biblioteca de referencias" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

Buscar referências sobre churn, com as tags `ia` e `saas`, ainda não usadas em nenhum post, ordenadas pelas mais recentes:

```bash
curl -i "http://localhost:8000/sources/?q=churn&tags=ia&tags=saas&tags_mode=and&used=false&sort=recentes&limit=2&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 200 OK
content-type: application/json
x-total-count: 7
access-control-expose-headers: X-Total-Count
```

```json
[
  {
    "id": 41,
    "title": "Churn silencioso em contas enterprise",
    "source_type": "insight",
    "content": "A conta some do produto tres semanas antes de cancelar...",
    "theme": "retencao",
    "audience": "founders",
    "origin": "call com cliente",
    "tags_json": "[\"ia\",\"saas\",\"churn\"]",
    "notes": null,
    "created_at": "2026-08-28T11:02:00",
    "updated_at": "2026-08-28T11:02:00",
    "used": false,
    "usage_count": 0
  },
  {
    "id": 33,
    "title": "Objeção: ja temos dashboard",
    "source_type": "objecao",
    "content": "Dashboard mostra o que aconteceu, nao o que vai acontecer...",
    "theme": "posicionamento",
    "audience": "founders",
    "origin": "linkedin",
    "tags_json": "[\"ia\",\"saas\"]",
    "notes": "usar em resposta a comentario",
    "created_at": "2026-08-21T09:40:00",
    "updated_at": "2026-08-21T09:40:00",
    "used": false,
    "usage_count": 0
  }
]
```

Tela da biblioteca com dois filtros ativos:

```text
Buscar [ churn                 ]  Tipo [ Todos v ]  Uso [ Ainda não usadas v ]  Ordenar [ Mais recentes v ]

Tags
[✓ ia] [✓ saas] [+ churn] [+ retencao] [+ produto]

Filtros ativos: [ia ×] [saas ×]  [ Todas as tags v ]  Limpar filtros

7 referências encontradas
```

O chip "[ia ×]" é um `<button>` com `aria-label="Remover filtro ia"`; o leitor de tela anuncia "Remover filtro ia, botão" e, ao acionar, "6 referências encontradas".

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Requisições enquanto digita | Digitar "churn silencioso" e contar as chamadas na aba Network | no máximo 3 requisições, contra 17 sem debounce |
| Cobertura da busca textual | Buscar um termo que só existe no campo `notes` | a referência aparece no resultado |
| Combinação de tags | Duas tags com `tags_mode=and` e depois `or` | o total do modo `or` é maior ou igual ao do modo `and` |
| Total exposto ao frontend | Ler `res.headers["x-total-count"]` no navegador | valor numérico presente, igual ao contador da tela |
| Acessibilidade dos chips | Percorrer os chips só com Tab e acionar com Enter | 100% dos chips removíveis sem mouse, com `aria-label` correto |
| Tempo de resposta da busca | `GET /sources/` com 500 referências cadastradas e `q` preenchido | menos de 300 ms |

## Definition of Done

- [ ] `search()` implementado em `repositories/sources.py` com `q`, `tags`, `tags_mode`, `type`, `date_from`, `date_to`, `used`, `sort`, `limit` e `offset`
- [ ] `GET /sources/` devolve `X-Total-Count` e expõe o header via `Access-Control-Expose-Headers`
- [ ] `GET /sources/tags` declarado antes de `/{source_id}`
- [ ] Nenhuma migração de banco necessária, `tags_json` reaproveitada e o motivo documentado no PR
- [ ] Busca no frontend com debounce de 300 ms e sem filtro em memória sobrando
- [ ] Chips de tags são `<button>` com `aria-label="Remover filtro X"` e funcionam por teclado
- [ ] Contador de resultados em região `aria-live="polite"`
- [ ] Estado vazio explica o motivo e oferece o botão de limpar filtros
- [ ] `GET /sources/` sem nenhum parâmetro continua funcionando para o gerador (sem regressão)
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- FastAPI - Parâmetros de query, listas e alias: https://fastapi.tiangolo.com/tutorial/query-params-str-validations/
- FastAPI - Resposta com headers personalizados: https://fastapi.tiangolo.com/advanced/response-headers/
- MDN - `Access-Control-Expose-Headers`: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers
- SQLAlchemy 2.0 - `or_`, `and_` e operadores de comparação: https://docs.sqlalchemy.org/en/20/core/operators.html
- SQLAlchemy 2.0 - Subqueries e joins: https://docs.sqlalchemy.org/en/20/tutorial/data_select.html
- Axios - `paramsSerializer`: https://axios-http.com/docs/req_config
- WAI-ARIA APG - Botões e `aria-pressed`: https://www.w3.org/WAI/ARIA/apg/patterns/button/
- WCAG 2.1 - Critério 2.1.1 Teclado: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
- Relatório final do PI 1, seção de questões em aberto sobre classificação das referências
