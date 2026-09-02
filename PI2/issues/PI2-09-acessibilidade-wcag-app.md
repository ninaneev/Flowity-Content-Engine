<!-- TITLE: [PI2][P0][Frontend] Acessibilidade WCAG 2.1 AA na aplicação (semântica, foco, contraste, skip link) -->
<!-- LABELS: area:frontend,prio:p0,sprint:pi2 -->

## Contexto (PI 2)

O PI 1 priorizou a entrega funcional do motor de conteúdo e deixou a acessibilidade para trás: hoje existem `div` clicáveis fazendo papel de botão (por exemplo no `CalendarDayCell`), a aplicação não tem landmarks nem skip link, o foco do teclado é o outline padrão do navegador e alguns tokens de cor não passam no contraste mínimo. O PI 2 corrige essa dívida e leva a aplicação ao nível WCAG 2.1 AA, requisito legal para produtos digitais no Brasil segundo a Lei 13.146/2015 (LBI) e o modelo eMAG. Esta issue é transversal: ela toca o `AppShell`, o `theme.css`, o `index.html` e os componentes de calendário e posts.

## Integrante responsável

Pedro Luiz Simonetti Filho

## Branch

`feat/pi2-09-acessibilidade-wcag-app`

## Estimativa

12 a 16 horas

## Arquivos que você vai criar ou editar

- `frontend/index.html` - EDITAR. Confirmar `lang="pt-BR"` e adicionar `<meta name="description">`.
- `frontend/src/components/layout/AppShell.jsx` - EDITAR. Skip link, landmarks `header`/`nav`/`main`/`footer`, `aria-current` na navegação.
- `frontend/src/styles/theme.css` - EDITAR. `.skip-link`, `:focus-visible` global, `.sr-only` e correção dos tokens de contraste.
- `frontend/tailwind.config.js` - EDITAR. Ajustar `text.muted` e a cor do texto do botão primário.
- `frontend/src/components/calendar/CalendarDayCell.jsx` - EDITAR. Trocar a `div` clicável por `button` real.
- `frontend/src/components/calendar/PostEventCard.jsx` - EDITAR. Mesmo tratamento, elemento interativo semântico.
- `frontend/src/components/posts/PostModal.jsx` - EDITAR. `role="dialog"`, `aria-modal`, `h2` do título e `aria-live` para o status de salvamento.
- `frontend/src/pages/DashboardPage.jsx`, `SourcesPage.jsx`, `GeneratorPage.jsx`, `PipelinePage.jsx`, `SettingsPage.jsx` - EDITAR. Hierarquia de headings `h1` a `h3` sem saltos.

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-09-acessibilidade-wcag-app
```

**Passo 2 - Auditar o estado atual e guardar o "antes"**

Antes de mudar qualquer coisa, gere a linha de base. Suba a aplicação, abra o Chrome, instale a extensão axe DevTools e rode:

1. Lighthouse (aba Lighthouse do DevTools), categoria "Accessibility", em `/`, `/sources`, `/generator`, `/pipeline` e `/settings`.
2. axe DevTools, botão "Scan ALL of my page", nas mesmas cinco telas.

Salve as capturas em `PI2/evidencias/antes-*.png`. Elas vão para o corpo do PR.

**Passo 3 - Corrigir o `index.html`**

O arquivo já tem `lang="pt-BR"` - confirme que continua assim e acrescente a descrição:

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Flowity Content Engine - plataforma interna de geração, revisão e agendamento de conteúdo."
    />
    <title>Flowity Content Engine</title>
```

**Passo 4 - Corrigir os tokens de contraste em `tailwind.config.js`**

Medições feitas sobre o fundo real do projeto, `bg.base = #07080F`:

| Token | Cor atual | Contraste sobre `#07080F` | Situação |
|---|---|---|---|
| `text.muted` | `#5C6A82` | 3,66:1 | REPROVA no AA (mínimo 4,5:1) |
| `text.secondary` | `#A8B3C7` | 9,43:1 | aprova |
| `text.primary` | `#F0F2FF` | 17,7:1 | aprova |
| `flowity.purple` | `#9C83F7` | 6,67:1 | aprova |
| `flowity.cyan` | `#1CD8DE` | 11,35:1 | aprova |

`text.muted` é usado em dezenas de lugares (contadores, textos de ajuda, nav inativa) sempre em tamanho pequeno, então não se aplica a exceção de texto grande. Corrija o token:

```js
        // ── Texto ───────────────────────────────────────────────────
        text: {
          primary:   "#F0F2FF",
          secondary: "#A8B3C7",
          // PI 2: #5C6A82 dava apenas 3,66:1 sobre #07080F e reprovava no
          // WCAG 2.1 AA. #7C8AA3 entrega 5,7:1 mantendo a hierarquia visual.
          muted:     "#7C8AA3",
        },
```

Segundo problema medido: a classe `.btn-primary` usa `text-white` sobre o gradiente roxo-ciano. Branco sobre `#9C83F7` dá 3,0:1 e sobre `#1CD8DE` dá apenas 1,76:1 - reprova largamente. Troque o texto do botão primário para o fundo escuro da marca, que dá 6,67:1 na ponta roxa e 11,35:1 na ponta ciano.

**Passo 5 - Editar `frontend/src/styles/theme.css`**

Substitua o bloco `.btn-primary` e acrescente skip link, anel de foco e `sr-only`. Cole isto dentro do `@layer components`:

```css
  /* Primary button — purple gradient
     PI 2: texto escuro em vez de branco. Branco sobre o gradiente
     reprovava no WCAG 2.1 AA (3,0:1 no roxo e 1,76:1 no ciano). */
  .btn-primary {
    @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
           transition-all duration-200 cursor-pointer;
    background: var(--gradient);
    color: #07080F;
  }

  /* Skip link — invisivel ate receber foco pelo teclado (WCAG 2.4.1) */
  .skip-link {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 100;
    padding: 0.625rem 1rem;
    border-radius: 0 0 8px 0;
    background: var(--color-cyan);
    color: #07080F;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
  }
  .skip-link:focus,
  .skip-link:focus-visible {
    left: 0;
    outline: 2px solid #F0F2FF;
    outline-offset: 2px;
  }

  /* Conteudo apenas para leitores de tela */
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

E acrescente o anel de foco global logo depois do bloco `body`, fora do `@layer components`:

```css
/* ── Foco visivel (WCAG 2.1 - 2.4.7 Foco Visivel) ───────────────
   Anel de 2px no ciano da marca, com 11,35:1 de contraste sobre o
   fundo #07080F. Usamos :focus-visible para nao poluir o clique
   de mouse, e mantemos :focus para navegadores antigos. */
:focus-visible {
  outline: 2px solid #1CD8DE;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Nunca remover o outline sem colocar outro no lugar. */
:focus:not(:focus-visible) {
  outline: none;
}

/* Respeita quem pediu menos animacao no sistema operacional. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Passo 6 - Reescrever o `AppShell.jsx` com landmarks e skip link**

O `AppShell` hoje tem `aside` + `nav` + `main`, mas sem skip link, sem `header`, sem `footer` e sem `aria-current`. A versão corrigida:

```jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Calendar, BookOpen, Sparkles, LayoutList, Settings, LogOut, Zap
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: Calendar, label: "Calendário" },
  { to: "/sources", icon: BookOpen, label: "Biblioteca" },
  { to: "/generator", icon: Sparkles, label: "Gerador" },
  { to: "/pipeline", icon: LayoutList, label: "Pipeline" },
  { to: "/settings", icon: Settings, label: "Configurações" },
];

export default function AppShell({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("flowity_token");
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      {/* Primeiro elemento focavel da pagina (WCAG 2.4.1) */}
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo principal
      </a>

      <aside className="w-56 flex-shrink-0 bg-bg-surface border-r border-border flex flex-col">
        <header className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-flowity-cyan" aria-hidden="true" />
            <span className="font-bold text-sm gradient-text">Flowity</span>
          </div>
          <p className="text-text-muted text-xs mt-0.5 pl-6">Content Engine</p>
        </header>

        <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Navegação principal">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-flowity-purple-dim text-flowity-purple border border-flowity-purple/20"
                        : "text-text-muted hover:text-text-secondary hover:bg-bg-elevated"
                    }`
                  }
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="px-2 py-3 border-t border-border">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-status-failed hover:bg-bg-elevated w-full transition-all duration-150"
          >
            <LogOut size={16} aria-hidden="true" />
            Sair da conta
          </button>
        </footer>
      </aside>

      <main id="conteudo-principal" tabIndex={-1} className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
```

Observação sobre o `NavLink`: se a versão do `react-router-dom` do projeto não aceitar função em `aria-current`, use a forma simples `aria-current="page"` dentro do `className` render prop ou envolva o link em um componente auxiliar. O `NavLink` v6 já aplica `aria-current="page"` automaticamente no link ativo, então basta confirmar no DevTools que o atributo aparece.

**Passo 7 - Trocar as `div` clicáveis por elementos interativos reais**

Em `CalendarDayCell.jsx`, a célula do dia é uma `div` com `onClick` - invisível para o teclado e para o leitor de tela. Troque por `button`:

```jsx
    <div
      className={`bg-bg-surface border rounded-lg min-h-24 p-2 group transition-colors hover:border-border-bright ${
        isToday ? "border-flowity-purple/50" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
            isToday ? "bg-flowity-purple text-white" : "text-text-muted"
          }`}
        >
          {day.getDate()}
        </span>

        <button
          type="button"
          onClick={() => onAddPost(day)}
          className="btn-ghost p-1 opacity-60 focus-visible:opacity-100 group-hover:opacity-100 transition-opacity"
          aria-label={`Criar post em ${day.toLocaleDateString("pt-BR", {
            day: "numeric", month: "long", year: "numeric",
          })}`}
        >
          <Plus size={12} aria-hidden="true" />
        </button>
      </div>
```

Regra geral para a issue inteira: se o elemento navega, é `<a>`; se executa uma ação, é `<button type="button">`. Nunca `div` com `onClick`. Aplique a mesma correção em `PostEventCard.jsx`.

**Passo 8 - Corrigir a hierarquia de headings**

Percorra as cinco páginas e garanta exatamente um `h1` por tela, seguido de `h2` para seções e `h3` para subseções, sem pular níveis. Padrão a adotar:

```jsx
      <h1 className="text-2xl font-bold gradient-text">Calendário editorial</h1>
      ...
        <h2 className="text-lg font-semibold text-text-primary">Posts agendados</h2>
        ...
          <h3 className="text-sm font-semibold text-text-primary">Aprovação editorial</h3>
```

No `PostModal.jsx` o título "Editorial approval" já é um `h3` mas não existe `h2` acima dele dentro do diálogo - promova o cabeçalho do modal a `h2`.

**Passo 9 - Tornar o `PostModal` um diálogo acessível**

No contêiner interno do modal, adicione os atributos de diálogo e o cabeçalho referenciado:

```jsx
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-post"
        className="bg-bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <StatusBadge status={form.status} />
            <div>
              <h2 id="titulo-modal-post" className="text-sm text-text-secondary">
                {mode === "create" ? "Novo post" : `Post #${post.id}`}
              </h2>
              <p className="text-xs text-text-muted">
                {CHANNEL_LABELS[form.channel] || form.channel || "LinkedIn"}
              </p>
            </div>
          </div>
          <button type="button" className="btn-ghost" onClick={onClose} aria-label="Fechar o post">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
```

O foco preso dentro do modal (focus trap) e a devolução do foco ao fechar são escopo da issue PI2-10.

**Passo 10 - Adicionar região de status com `aria-live`**

Toda mensagem que aparece sem o usuário navegar até ela precisa ser anunciada. No `PostModal`, substitua o `window.alert` de validação por uma região viva:

```jsx
  const [mensagemStatus, setMensagemStatus] = useState("");
```

```jsx
          {/* Regiao viva: leitores de tela anunciam sem roubar o foco */}
          <p aria-live="polite" className="text-xs text-status-scheduled min-h-4">
            {mensagemStatus}
          </p>
```

E dentro de `handleSave`:

```jsx
    if (form.status === "scheduled" && !form.scheduled_at) {
      setMensagemStatus(
        "Escolha uma data e hora de publicação antes de mover o post para Scheduled."
      );
      return;
    }
    setMensagemStatus("");
```

**Passo 11 - Associar todos os rótulos de formulário**

O projeto usa `<label className="label">` sem `htmlFor` em vários campos. Sem `htmlFor` + `id`, o clique no rótulo não foca o campo e o leitor de tela não anuncia o nome. Corrija cada par:

```jsx
            <label className="label" htmlFor="campo-hook">Hook / título principal</label>
            <textarea
              id="campo-hook"
              className="textarea text-base font-medium"
              name="hook"
              ...
            />
```

Repita para `body`, `cta`, `short_x`, `scheduled_at`, `generation_mode`, `notes`, e para os campos de `NewSourceForm.jsx`, `SourceFilters.jsx` e `GeneratorPage.jsx`. No `SelectField.jsx`, propague uma prop `id` para o `<select>` interno.

**Passo 12 - Reauditar e registrar o "depois"**

```bash
cd frontend
npm run dev
```

Rode de novo Lighthouse e axe DevTools nas cinco telas e salve as capturas em `PI2/evidencias/depois-*.png`. Teste também sem mouse: carregue `/`, aperte Tab uma vez - o skip link "Pular para o conteúdo principal" deve aparecer no canto superior esquerdo; aperte Enter e o foco deve ir para o `<main>`.

**Passo 13 - Commit e Pull Request**

```bash
git add frontend/index.html \
        frontend/tailwind.config.js \
        frontend/src/styles/theme.css \
        frontend/src/components/layout/AppShell.jsx \
        frontend/src/components/calendar/ \
        frontend/src/components/posts/PostModal.jsx \
        frontend/src/components/shared/ \
        frontend/src/pages/ \
        PI2/evidencias/

git commit -m "feat(a11y): conformidade WCAG 2.1 AA na aplicacao

Adiciona skip link para o conteudo principal, landmarks header/nav/main/footer
no AppShell e aria-current na navegacao. Substitui divs clicaveis por button
e a no calendario. Corrige a hierarquia de headings h1-h3 nas cinco paginas.
Define anel de foco :focus-visible de 2px no ciano da marca e respeita
prefers-reduced-motion. Corrige contraste: text.muted de #5C6A82 (3,66:1)
para #7C8AA3 (5,7:1) e texto do btn-primary de branco (1,76:1 no ciano)
para #07080F. Associa labels por htmlFor e adiciona regiao aria-live."

git push -u origin feat/pi2-09-acessibilidade-wcag-app
```

Abra o PR para `main` com o título "PI2-09: acessibilidade WCAG 2.1 AA na aplicação", escreva `Closes #<numero-da-issue>` e **anexe no corpo do PR as capturas de antes e depois** do Lighthouse e do axe DevTools, lado a lado.

## Exemplo de uso

```text
ANTES
-----
Tab na tela inicial:
  1. (nada visivel acontece - o foco vai direto para o link "Calendar")
  2. Link Calendar        outline azul padrao do Chrome, quase invisivel no #07080F
  3. ...
  ... 14 tabs depois ...
  15. Primeiro elemento do conteudo
  As celulas do calendario NAO recebem foco (sao div com onClick).

  axe DevTools: 11 violacoes
    - serious: Elements must meet minimum color contrast ratio (7 nos)
    - serious: Form elements must have labels (5 nos)
    - moderate: Page must have one main landmark (ja existia, ok)
    - serious: Interactive controls must be focusable (2 nos)
  Lighthouse Accessibility: 74

DEPOIS
------
Tab na tela inicial:
  1. [Pular para o conteudo principal]   <- barra ciano aparece no topo esquerdo
     Enter -> foco salta para <main id="conteudo-principal">
  2. Link Calendario      anel ciano de 2px, 11,35:1 de contraste
  3. ...
  As celulas do calendario tem um <button> "Criar post em 14 de setembro de 2025".

  axe DevTools: 0 violacoes criticas ou serias
  Lighthouse Accessibility: 100

CONTRASTE CORRIGIDO
-------------------
  text-text-muted   #5C6A82 -> #7C8AA3   3,66:1 -> 5,70:1   sobre #07080F
  .btn-primary      #FFFFFF -> #07080F   1,76:1 -> 11,35:1  sobre a ponta ciano
                                          3,00:1 -> 6,67:1  sobre a ponta roxa
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Violações do axe DevTools | "Scan ALL of my page" em `/`, `/sources`, `/generator`, `/pipeline`, `/settings` | 0 violações críticas e 0 sérias em todas as 5 telas |
| Pontuação de acessibilidade no Lighthouse | Aba Lighthouse, categoria Accessibility, modo desktop, nas 5 telas | >= 95 em todas, sendo 100 na tela inicial |
| Contraste de texto e ícones | axe DevTools (regra color-contrast) e conferência manual dos tokens | 100% dos textos >= 4,5:1 e componentes de interface >= 3:1 |
| Elementos interativos focáveis | Percorrer cada tela só com Tab e contar os controles alcançados | 100% dos controles clicáveis alcançáveis, com foco sempre visível |
| Campos de formulário rotulados | axe DevTools (regra label) + inspeção manual dos `htmlFor` | 100% dos campos com `<label>` associado |

## Definition of Done

- [ ] Capturas de tela do Lighthouse e do axe DevTools ANTES salvas em `PI2/evidencias/`
- [ ] `lang="pt-BR"` confirmado no `index.html` e `<meta name="description">` adicionada
- [ ] Skip link "Pular para o conteúdo principal" implementado, invisível por padrão e visível ao receber foco
- [ ] Landmarks `header`, `nav` (com `aria-label`), `main` (com `id="conteudo-principal"` e `tabIndex={-1}`) e `footer` presentes no `AppShell`
- [ ] Nenhuma `div` ou `span` com `onClick` restante; toda ação usa `button` e toda navegação usa `a`/`NavLink`
- [ ] Hierarquia de headings validada nas 5 páginas: um `h1` por tela, sem saltos até `h3`
- [ ] `:focus-visible` com outline de 2px em `#1CD8DE` aplicado globalmente no `theme.css`
- [ ] `text.muted` corrigido para `#7C8AA3` e `.btn-primary` com texto `#07080F`
- [ ] Todos os campos de formulário com `<label htmlFor>` associado ao `id` do campo
- [ ] Região `aria-live="polite"` anunciando mensagens de status no `PostModal`
- [ ] `prefers-reduced-motion` respeitado
- [ ] Lighthouse Accessibility >= 95 nas 5 telas e 0 violações críticas no axe DevTools
- [ ] Capturas DEPOIS anexadas ao corpo do Pull Request, ao lado das de antes
- [ ] `npm run build` executa sem erros
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- WCAG 2.1 (tradução W3C): https://www.w3.org/Translations/WCAG21-pt-br/
- WCAG 2.1, critério 1.4.3 Contraste Mínimo: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- WCAG 2.1, critério 1.4.11 Contraste de Conteúdo Não Textual: https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
- WCAG 2.1, critério 2.4.1 Ignorar Blocos: https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html
- WCAG 2.1, critério 2.4.7 Foco Visível: https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html
- WCAG 2.1, critério 1.3.1 Informações e Relações: https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html
- WAI-ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- MDN, `:focus-visible`: https://developer.mozilla.org/pt-BR/docs/Web/CSS/:focus-visible
- MDN, elementos de seção e landmarks: https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element#elementos_de_seção_de_conteúdo
- axe DevTools (extensão do navegador): https://www.deque.com/axe/devtools/
- Lighthouse - auditoria de acessibilidade: https://developer.chrome.com/docs/lighthouse/accessibility/scoring
- eMAG - Modelo de Acessibilidade em Governo Eletrônico: https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/eMAGv31.pdf/view
- Lei 13.146/2015 (Lei Brasileira de Inclusão), art. 63: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
