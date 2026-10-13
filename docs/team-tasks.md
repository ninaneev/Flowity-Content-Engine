# Tarefas dos Integrantes — Flowity Content Engine

> Cada tarefa é uma **Issue** no GitHub Projects.
> Cada integrante trabalha numa **branch separada**.
> Toda alteração entra por **Pull Request**, que precisa ser aprovado pelo líder.

---

## Scrum Simplificado

| Cerimônia | Quando | Duração |
|-----------|--------|---------|
| Sprint Planning | Início do sprint | 30 min |
| Daily (async) | Todo dia | 5 min (comentar na issue) |
| Sprint Review | Fim do sprint | 20 min |
| Retrospectiva | Após o review | 15 min |

**Duração do sprint:** 1 semana
**Scrum Master:** Líder do projeto (você)
**Velocidade esperada:** 1 tarefa por integrante por sprint

---

## Tarefa 0 — Demo Guiada: Melhorar a SettingsPage

| Campo | Valor |
|-------|-------|
| **Integrante** | Líder do projeto |
| **Issue** | #75 |
| **Branch** | `feat/issue-0-settings-demo` |
| **Área** | Frontend |
| **Prioridade** | 🟢 Baixa |
| **Estimativa** | 30–60 minutos |

### O que fazer (passo a passo)

**Objetivo da T0:** fazer uma tarefa pequena, real e visível para mostrar ao time o fluxo completo:
issue → branch → código → commit → push → pull request.

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/issue-0-settings-demo
```

**Passo 2 — Abra o arquivo** `frontend/src/pages/SettingsPage.jsx`

**Passo 3 — Adicione uma nova seção/card chamada** `Ambiente Local`

Esse card deve mostrar links rápidos para:

- Frontend → `http://localhost:5173`
- Backend Docs → `http://localhost:8000/docs`
- n8n → `http://localhost:5678`

**Passo 4 — Regras visuais**
- Use a mesma linguagem visual dos outros cards da tela
- Use classes já existentes como `card`, `text-text-primary`, `text-text-muted`
- Os links devem abrir em nova aba

**Passo 5 — Adicione um pequeno texto de apoio**
- Exemplo: "Use estes links durante a demo local do projeto."

**Passo 6 — Teste**
```bash
cd frontend
npm install
npm run dev
# Abra http://localhost:5173/settings
```

Valide:

- o novo card aparece sem quebrar o layout
- os 3 links aparecem corretamente
- os links abrem os serviços certos

**Passo 7 — Commit e PR**
```bash
git add frontend/src/pages/SettingsPage.jsx
git commit -m "feat: adicionar card de ambiente local na SettingsPage"
git push origin feat/issue-0-settings-demo
# Abra PR: Closes #75
```

### Definition of Done ✅
- [ ] A página `/settings` continua abrindo normalmente
- [ ] Existe um card novo chamado `Ambiente Local`
- [ ] O card mostra links para frontend, backend docs e n8n
- [ ] Os links funcionam em nova aba
- [ ] PR aberto com `Closes #75`

---

## Tarefa 1 — Library / Sources Page

| Campo | Valor |
|-------|-------|
| **Integrante** | Integrante 1 |
| **Issue** | #1 |
| **Branch** | `feat/issue-1-sources-page` |
| **Área** | Frontend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–6 horas |

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/issue-1-sources-page
```

**Passo 2 — Abra o arquivo** `frontend/src/components/sources/SourceCard.jsx`

**Passo 3 — Implemente o card visual:**
- Mostre o `title` em destaque
- Mostre `source_type` e `theme` como badges coloridos
- Mostre os primeiros 100 caracteres do `content`
- Adicione borda colorida quando `selected = true`

**Passo 4 — Abra o arquivo** `frontend/src/pages/SourcesPage.jsx`

**Passo 5 — Encontre o bloco `TODO Integrante 1`** (linha ~95) e substitua pelo código indicado nos comentários

**Passo 6 — Teste:**
```bash
cd frontend && npm install && npm run dev
# Acesse http://localhost:5173/sources
```

**Passo 7 — Commite e abra o PR:**
```bash
git add frontend/src/components/sources/SourceCard.jsx frontend/src/pages/SourcesPage.jsx
git commit -m "feat: implementar SourceCard e listagem na SourcesPage"
git push origin feat/issue-1-sources-page
# Abra PR no GitHub: Closes #1
```

### Definition of Done ✅
- [ ] A página `/sources` abre sem erros
- [ ] Os cards das sources aparecem na tela
- [ ] Cada card mostra título, tipo e trecho do conteúdo
- [ ] O campo de busca filtra os resultados
- [ ] PR aberto com `Closes #1` na descrição

---

## Tarefa 2 — Formulário de Nova Source

| Campo | Valor |
|-------|-------|
| **Integrante** | Integrante 2 |
| **Issue** | #2 |
| **Branch** | `feat/issue-2-new-source-form` |
| **Área** | Frontend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–6 horas |

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main && git pull origin main
git checkout -b feat/issue-2-new-source-form
```

**Passo 2 — Abra** `frontend/src/components/sources/NewSourceForm.jsx`

**Passo 3 — Adicione os campos que faltam** (leia os comentários `TODO` no arquivo):
- `source_type` → `<select>` com as opções (já tem a lista `SOURCE_TYPES` no arquivo)
- `content` → `<textarea>` com 6 linhas, obrigatório
- `theme` → `<input>` texto, opcional
- `origin` → `<input>` texto, opcional
- `notes` → `<textarea>` com 3 linhas, opcional

**Passo 4 — Use as classes CSS do tema:**
```jsx
<label className="label">Nome do campo</label>
<input className="input" name="campo" ... />
<textarea className="textarea" rows={6} ... />
<select className="select" name="source_type" ...>
  {SOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
</select>
```

**Passo 5 — Teste:** Abra `/sources`, clique em "Nova source", preencha e salve

**Passo 6 — Commit e PR:**
```bash
git add frontend/src/components/sources/NewSourceForm.jsx
git commit -m "feat: adicionar campos ao NewSourceForm"
git push origin feat/issue-2-new-source-form
# Abra PR: Closes #2
```

### Definition of Done ✅
- [ ] Formulário tem todos os 6 campos
- [ ] Campos obrigatórios bloqueiam envio se vazios
- [ ] Ao salvar, a source aparece na lista
- [ ] Visual está limpo e consistente com o tema

---

## Tarefa 3 — Calendário Mensal

| Campo | Valor |
|-------|-------|
| **Integrante** | Integrante 3 |
| **Issue** | #3 |
| **Branch** | `feat/issue-3-calendar` |
| **Área** | Frontend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 5–7 horas |

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main && git pull origin main
git checkout -b feat/issue-3-calendar
```

**Passo 2 — Arquivos para editar:**
- `frontend/src/components/calendar/PostEventCard.jsx` → melhorar o card do post
- `frontend/src/components/calendar/CalendarDayCell.jsx` → mostrar "+N mais" se >3 posts
- `frontend/src/components/calendar/ContentCalendar.jsx` → o grid já está pronto, mas teste e ajuste

**Passo 3 — Em `PostEventCard.jsx`**, adicione um ícone para o canal:
```jsx
import { Linkedin, Twitter } from "lucide-react";  // ou use texto simples
// Antes do texto do hook, mostre:
{post.channel === "linkedin" ? <span>LI</span> : <span>X</span>}
```

**Passo 4 — Em `CalendarDayCell.jsx`**, limite a 3 cards e mostre "+N mais":
```jsx
const visiblePosts = posts.slice(0, 3);
const extraCount   = posts.length - 3;
// Depois dos cards visíveis:
{extraCount > 0 && <p className="text-xs text-text-muted">+{extraCount} mais</p>}
```

**Passo 5 — Teste:** Acesse `/` e navegue entre os meses

**Passo 6 — Commit e PR:**
```bash
git add frontend/src/components/calendar/
git commit -m "feat: implementar PostEventCard e melhorias no calendário"
git push origin feat/issue-3-calendar
# Abra PR: Closes #3
```

### Definition of Done ✅
- [ ] Calendário abre em `/` (dashboard)
- [ ] Cards dos posts aparecem nos dias certos
- [ ] Clicar num dia vazio abre um aviso (ou redireciona para Generator)
- [ ] Clicar num card abre o PostModal

---

## Tarefa 4 — Modal do Post

| Campo | Valor |
|-------|-------|
| **Integrante** | Integrante 4 |
| **Issue** | #4 |
| **Branch** | `feat/issue-4-post-modal` |
| **Área** | Frontend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–6 horas |

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main && git pull origin main
git checkout -b feat/issue-4-post-modal
```

**Passo 2 — Abra** `frontend/src/components/posts/PostModal.jsx`

**Passo 3 — Adicione os campos que faltam** (os TODOs estão marcados no arquivo):
- `body` → textarea, 8 linhas
- `cta` → input texto
- `short_x` → input texto, label "Versão para X (máx 280 chars)"
- `status` → select com as opções: idea, draft, revised, scheduled, published, failed
- `channel` → select: linkedin / x
- `scheduled_at` → `<input type="datetime-local">`
- `notes` → textarea, 3 linhas

**Passo 4 — Para o select de status:**
```jsx
<select className="select" name="status" value={form.status} onChange={handleChange}>
  {["idea","draft","revised","scheduled","published","failed"].map(s => (
    <option key={s} value={s}>{s}</option>
  ))}
</select>
```

**Passo 5 — Teste:** Crie um post no Generator, vá para o Pipeline e clique no post

**Passo 6 — Commit e PR:**
```bash
git add frontend/src/components/posts/PostModal.jsx
git commit -m "feat: implementar campos do PostModal"
git push origin feat/issue-4-post-modal
# Abra PR: Closes #4
```

### Definition of Done ✅
- [ ] Modal abre ao clicar num post
- [ ] Todos os campos aparecem e são editáveis
- [ ] Botão "Salvar" atualiza o post no banco
- [ ] ESC fecha o modal
- [ ] Clicar fora do modal fecha

---

## Tarefa 5 — API de Sources (Backend)

| Campo | Valor |
|-------|-------|
| **Integrante** | Integrante 5 |
| **Issue** | #5 |
| **Branch** | `feat/issue-5-sources-api` |
| **Área** | Backend |
| **Prioridade** | 🟡 Média-Alta |
| **Estimativa** | 5–7 horas |

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main && git pull origin main
git checkout -b feat/issue-5-sources-api
```

**Passo 2 — Configure o ambiente Python:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

**Passo 3 — Configure o .env** (copie o .env.example e preencha DATABASE_URL)

**Passo 4 — Abra** `backend/app/routes/sources.py`

**Passo 5 — Para CADA rota**, substitua o `raise HTTPException(501...)` pelo código indicado no comentário TODO.

Exemplo — Rota 1 (list_sources):
```python
# Substitua:
raise HTTPException(status_code=501, detail="TODO Integrante 5: implementar list_sources")
# Por:
return source_repo.get_all(db)
```

**Passo 6 — Teste com o Swagger:**
```bash
cd backend
uvicorn app.main:app --reload
# Acesse: http://localhost:8000/docs
# Teste cada rota pelo botão "Try it out"
```

**Passo 7 — Commit e PR:**
```bash
git add backend/app/routes/sources.py
git commit -m "feat: implementar rotas da API de sources"
git push origin feat/issue-5-sources-api
# Abra PR: Closes #5
```

### Definition of Done ✅
- [ ] `GET /sources/` retorna lista (pode estar vazia)
- [ ] `POST /sources/` cria uma source e retorna com ID
- [ ] `GET /sources/{id}` retorna a source (404 se não existir)
- [ ] `PUT /sources/{id}` atualiza (404 se não existir)
- [ ] Tudo testado pelo Swagger em `/docs`

---

## Tarefa 6 — API de Posts (Backend)

| Campo | Valor |
|-------|-------|
| **Integrante** | Integrante 6 |
| **Issue** | #6 |
| **Branch** | `feat/issue-6-posts-api` |
| **Área** | Backend |
| **Prioridade** | 🟡 Média-Alta |
| **Estimativa** | 5–7 horas |

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main && git pull origin main
git checkout -b feat/issue-6-posts-api
```

**Passo 2 — Configure o Python** (igual à Tarefa 5)

**Passo 3 — Abra** `backend/app/routes/posts.py`

**Passo 4 — Implemente cada rota** substituindo os `raise HTTPException(501...)` pelos códigos nos TODOs.

**Atenção especial — Rota de calendar:**
```python
# O parâmetro month chega como string "2025-06"
# Você precisa separar o ano e o mês:
year, m = map(int, month.split("-"))
return post_repo.get_for_calendar(db, year, m)
```

**Passo 5 — Teste com o Swagger** em `http://localhost:8000/docs`

**Passo 6 — Commit e PR:**
```bash
git add backend/app/routes/posts.py
git commit -m "feat: implementar rotas da API de posts"
git push origin feat/issue-6-posts-api
# Abra PR: Closes #6
```

### Definition of Done ✅
- [ ] `GET /posts/` retorna lista
- [ ] `POST /posts/` cria um post
- [ ] `GET /posts/{id}` retorna o post
- [ ] `PUT /posts/{id}` atualiza
- [ ] `GET /posts/calendar?month=2025-06` retorna posts do mês

---

## Tarefa 7 — UI Polish e Refinamento Visual

| Campo | Valor |
|-------|-------|
| **Integrante** | Integrante 7 |
| **Issue** | #7 |
| **Branch** | `feat/issue-7-ui-polish` |
| **Área** | Frontend / Design |
| **Prioridade** | 🟢 Média |
| **Estimativa** | 4–6 horas |

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main && git pull origin main
git checkout -b feat/issue-7-ui-polish
```

**Passo 2 — Abra** `frontend/src/components/shared/StatusBadge.jsx` e melhore:
- Adicione ícones do `lucide-react` ao lado de cada status
- Exemplo: `published` → `<CheckCircle size={10} />`, `failed` → `<XCircle size={10} />`

**Passo 3 — Abra** `frontend/src/components/sources/SourceFilters.jsx` e adicione:
- Um `<select>` para filtrar por `source_type`
- Ele deve receber `typeFilter` e `onTypeFilterChange` como props

**Passo 4 — Percorra todas as telas** e melhore:
- Espaçamentos inconsistentes
- Cores que não seguem o tema
- Botões que parecem iguais (primários vs secundários)
- Cards sem estado hover

**Passo 5 — Commit e PR:**
```bash
git add frontend/src/components/shared/StatusBadge.jsx frontend/src/components/sources/SourceFilters.jsx
git commit -m "feat: ui polish — ícones no StatusBadge e filtro por tipo nas Sources"
git push origin feat/issue-7-ui-polish
# Abra PR: Closes #7
```

### Definition of Done ✅
- [ ] StatusBadge tem ícones
- [ ] SourceFilters tem filtro por tipo
- [ ] Interface parece mais sofisticada que antes
- [ ] Não quebrou nenhuma funcionalidade existente
