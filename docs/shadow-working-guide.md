# Guia de Shadow Working — Como um time técnico trabalha

> Leia este guia antes de começar qualquer tarefa.
> Ele explica como funcionam issues, branches e pull requests.

---

## Por que existe esse processo?

Quando várias pessoas mexem no mesmo projeto ao mesmo tempo, o código pode se misturar e quebrar.
O Git resolve isso: **cada pessoa trabalha em uma cópia separada do código (branch)** e só junta tudo quando está pronto e revisado.

---

## O fluxo de trabalho em 6 etapas

```
1. Pegar a issue  →  2. Criar a branch  →  3. Fazer o código
      ↓
4. Commitar  →  5. Abrir PR  →  6. Aguardar aprovação e merge
```

---

## Etapa 1 — Pegar a issue

1. Acesse o GitHub Projects do repositório
2. Encontre a coluna **"Ready"**
3. Encontre o card com o seu nome
4. Clique nele e leia **tudo**
5. Mova o card para **"In Progress"**

**O que é uma issue?**
É uma tarefa documentada. Tem:
- Um **título** (o que fazer)
- Uma **descrição** (como fazer, passo a passo)
- Um **Definition of Done** (como saber que terminou)

---

## Etapa 2 — Criar a branch

Abra o terminal no seu computador, dentro da pasta do projeto:

```bash
# Passo 1: vá para a branch main e baixe as atualizações mais recentes
git checkout main
git pull origin main

# Passo 2: crie sua branch com o nome da sua tarefa
# Formato: feat/issue-NUMERO-nome-curto
git checkout -b feat/issue-1-sources-page
```

**O que é uma branch?**
Imagine que o projeto principal é um tronco de árvore (main).
Sua branch é um galho separado — você mexe só no seu galho, sem afetar o tronco.

---

## Etapa 3 — Fazer o código

1. Abra o VS Code (ou outro editor) na pasta do projeto
2. Encontre os arquivos da sua tarefa (estão indicados na issue e em `docs/team-tasks.md`)
3. Leia os comentários `TODO` dentro dos arquivos — eles explicam exatamente o que fazer
4. Faça as alterações
5. Teste antes de commitar (veja "Como testar" em cada tarefa)

---

## Etapa 4 — Commitar

Commitar é como tirar uma foto do seu progresso. Faça commits pequenos e frequentes.

```bash
# Passo 1: veja o que mudou
git status

# Passo 2: adicione os arquivos que você alterou
git add frontend/src/components/sources/SourceCard.jsx

# Passo 3: crie o commit com uma mensagem clara
git commit -m "feat: implementar SourceCard com título e badge de tipo"

# Passo 4: envie para o GitHub
git push origin feat/issue-1-sources-page
```

**Regras de mensagem de commit:**
- Use `feat:` para código novo
- Use `fix:` para correção de bug
- Use `style:` para mudanças visuais
- Escreva em português ou inglês, mas seja claro

---

## Etapa 5 — Abrir o Pull Request (PR)

O PR é o pedido para juntar seu código ao projeto principal (main).

1. Acesse **github.com/ninaneev/PI-Univesp**
2. Clique no banner amarelo que aparece: **"Compare & pull request"**
3. Preencha:
   - **Título:** `feat: implementar SourceCard e listagem na SourcesPage`
   - **Descrição:** o que você fez + `Closes #1` (substituindo 1 pelo número da sua issue)
4. Clique em **"Create pull request"**

**Por que `Closes #1` é importante?**
Quando o PR for aprovado e mergeado, o GitHub fecha automaticamente a issue #1.

---

## Etapa 6 — Aguardar revisão

1. Mova seu card no kanban para **"In Review"**
2. O líder vai revisar seu código
3. Pode acontecer duas coisas:
   - ✅ **Aprovado:** o líder faz o merge — seu código vai para o main
   - 💬 **Pedido de mudança:** o líder deixa comentários — você corrige e faz novo push

**A revisão não é crítica pessoal.** É parte normal do processo profissional. O objetivo é melhorar a qualidade.

---

## Como responder a um pedido de mudança

1. Leia o comentário do líder
2. Faça a correção no seu código
3. Commit novamente:
   ```bash
   git add arquivo-que-mudou.jsx
   git commit -m "fix: ajustar layout do SourceCard conforme review"
   git push origin feat/issue-1-sources-page
   ```
4. O PR atualiza automaticamente — comente "Pronto para nova revisão"

---

## Estrutura do projeto (mapa rápido)

```
PI-Univesp/
├── frontend/          ← tudo que o usuário vê (React)
│   └── src/
│       ├── pages/     ← as TELAS (DashboardPage, SourcesPage, etc.)
│       └── components/← os BLOCOS de cada tela
│           ├── sources/   ← componentes de sources (sua tarefa se for T1, T2 ou T7)
│           ├── calendar/  ← componentes do calendário (T3)
│           ├── posts/     ← componentes de posts (T4)
│           └── shared/    ← componentes usados em várias telas
│
├── backend/           ← a lógica e o banco de dados (Python/FastAPI)
│   └── app/
│       ├── routes/    ← os ENDPOINTS da API (T5, T6)
│       ├── models/    ← a estrutura das tabelas
│       └── services/  ← a lógica de geração com IA
│
└── docs/              ← documentação (você está aqui)
```

---

## Termos técnicos rápidos

| Termo | Significado simples |
|-------|---------------------|
| `main` | Branch principal — o código que está "em produção" |
| `branch` | Uma cópia isolada do código para você trabalhar |
| `commit` | Uma foto do seu progresso com uma mensagem |
| `push` | Enviar seus commits para o GitHub |
| `pull` | Baixar as atualizações do GitHub |
| `PR (Pull Request)` | Pedido para juntar sua branch ao main |
| `merge` | O ato de juntar uma branch ao main |
| `review` | Revisão do código antes do merge |
| `issue` | Uma tarefa documentada no GitHub |
| `kanban` | O quadro de tarefas (Backlog → Ready → In Progress → In Review → Done) |

---

## Perguntas frequentes

**"Fiz um commit errado, o que faço?"**
Não entre em pânico. Fale com o líder antes de tentar "desfazer" qualquer coisa.

**"Meu push deu erro de 'rejected'"**
Provavelmente tem atualizações que você não baixou:
```bash
git pull origin feat/minha-branch
# Resolva conflitos se houver, depois push novamente
```

**"Não entendi o que precisa fazer"**
Leia os comentários TODO no código. Se ainda não entender, pergunte para o líder no canal do time — nunca fique preso sozinho por mais de 30 minutos.
