<!-- TITLE: [PI2][P1][Frontend] Navegação por teclado e leitor de tela no carrossel e no calendário -->
<!-- LABELS: area:frontend,prio:p1,sprint:pi2 -->

## Contexto (PI 2)

A issue PI2-09 deixa a aplicação semanticamente correta e a PI2-08 entrega o construtor de carrossel. Falta a camada de interação: hoje um usuário de teclado precisaria dar dezenas de Tab para atravessar os slides, o `PostModal` deixa o foco escapar para trás do overlay e o calendário não é navegável sem mouse. Esta issue implementa roving tabindex nos slides, atalhos de seta, focus trap no modal com devolução do foco ao elemento de origem, rotulagem ARIA de cada slide e navegação por teclado nas células do calendário. É o que separa "tem código acessível" de "dá para usar sem enxergar a tela", conforme os critérios 2.1.1, 2.1.2 e 2.4.3 da WCAG 2.1, a Lei 13.146/2015 e o eMAG.

## Integrante responsável

Roger Luiz de Paula

## Branch

`feat/pi2-10-teclado-leitor-tela-carrossel`

## Estimativa

12 a 16 horas

## Arquivos que você vai criar ou editar

- `frontend/src/components/carousel/CarouselBuilder.jsx` - EDITAR. Roving tabindex, handler de teclado e região `aria-live` do slide atual.
- `frontend/src/components/carousel/SlideCard.jsx` - EDITAR. `role="group"`, `aria-roledescription="slide"`, `aria-label="Slide 2 de 7"`, `tabIndex` controlado e `ref` encaminhada.
- `frontend/src/components/posts/PostModal.jsx` - EDITAR. Focus trap, foco inicial e devolução do foco no fechamento.
- `frontend/src/components/calendar/CalendarDayCell.jsx` - EDITAR. Célula focável com setas, Home/End e Enter.
- `frontend/src/components/calendar/ContentCalendar.jsx` - EDITAR. `role="grid"` na grade e coordenação do foco entre as células.
- `frontend/src/lib/useFocusTrap.js` - CRIAR. Hook reutilizável de prisão e devolução de foco.

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-10-teclado-leitor-tela-carrossel
```

**Passo 2 - Criar o hook `frontend/src/lib/useFocusTrap.js`**

Este hook faz três coisas: guarda quem tinha o foco antes do modal abrir, prende o Tab dentro do contêiner e devolve o foco ao fechar.

```js
import { useEffect, useRef } from "react";

const SELETOR_FOCAVEIS = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/**
 * Prende o foco dentro de `ref` enquanto `ativo` for verdadeiro e devolve
 * o foco ao elemento que estava focado antes de abrir.
 * WCAG 2.1 - 2.1.2 (Sem Bloqueio de Teclado) e 2.4.3 (Ordem de Foco).
 */
export default function useFocusTrap(ativo, onEscape) {
  const containerRef = useRef(null);
  const origemRef = useRef(null);

  useEffect(() => {
    if (!ativo) return undefined;

    origemRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return undefined;

    // Foca o primeiro elemento util dentro do dialogo.
    const focaveis = container.querySelectorAll(SELETOR_FOCAVEIS);
    (focaveis[0] || container).focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;

      const lista = Array.from(container.querySelectorAll(SELETOR_FOCAVEIS)).filter(
        (el) => el.offsetParent !== null
      );
      if (lista.length === 0) return;

      const primeiro = lista[0];
      const ultimo = lista[lista.length - 1];

      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      // Devolve o foco para quem abriu o dialogo.
      if (origemRef.current instanceof HTMLElement) {
        origemRef.current.focus();
      }
    };
  }, [ativo, onEscape]);

  return containerRef;
}
```

**Passo 3 - Aplicar o focus trap no `PostModal.jsx`**

Substitua o `useEffect` atual que só escuta Escape no `window` (ele fecha o modal mas não devolve o foco nem prende o Tab):

```jsx
import useFocusTrap from "../../lib/useFocusTrap";
```

```jsx
  const dialogoRef = useFocusTrap(Boolean(post), onClose);
```

Apague o bloco antigo:

```jsx
  // REMOVER - substituido pelo useFocusTrap
  // useEffect(() => {
  //   const handleKey = (e) => { if (e.key === "Escape") onClose(); };
  //   window.addEventListener("keydown", handleKey);
  //   return () => window.removeEventListener("keydown", handleKey);
  // }, [onClose]);
```

E ligue a `ref` no contêiner do diálogo:

```jsx
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-post"
        tabIndex={-1}
        className="bg-bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
      >
```

**Passo 4 - Implementar roving tabindex no `CarouselBuilder.jsx`**

Roving tabindex significa: a lista inteira ocupa uma única parada de Tab; dentro dela, as setas movem o foco. Só o slide ativo tem `tabIndex={0}`, os demais têm `tabIndex={-1}`.

Adicione ao estado do componente:

```jsx
  const [slideAtivo, setSlideAtivo] = useState(0);
  const [anuncio, setAnuncio] = useState("");
  const slideRefs = useRef([]);

  function focarSlide(indice) {
    const limitado = Math.max(0, Math.min(indice, slides.length - 1));
    setSlideAtivo(limitado);
    slideRefs.current[limitado]?.focus();
    setAnuncio(`Slide ${limitado + 1} de ${slides.length}. ${slides[limitado].texto.slice(0, 80)}`);
  }

  // Setas navegam, Home/End vao para as pontas, Enter/Espaco entram na edicao,
  // Alt+setas reordenam sem sair do slide.
  function handleKeyDownLista(e) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        if (e.altKey) { moverSlide(slideAtivo, slideAtivo + 1); setSlideAtivo(slideAtivo + 1); }
        else focarSlide(slideAtivo + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        if (e.altKey) { moverSlide(slideAtivo, slideAtivo - 1); setSlideAtivo(slideAtivo - 1); }
        else focarSlide(slideAtivo - 1);
        break;
      case "Home":
        e.preventDefault();
        focarSlide(0);
        break;
      case "End":
        e.preventDefault();
        focarSlide(slides.length - 1);
        break;
      case "Enter":
      case " ":
        // So intercepta quando o foco esta no grupo, nao dentro do textarea.
        if (e.target.dataset.slideGrupo === "true") {
          e.preventDefault();
          const campo = document.getElementById(`slide-texto-${slides[slideAtivo].id}`);
          campo?.focus();
          setAnuncio(`Editando o texto do slide ${slideAtivo + 1}.`);
        }
        break;
      default:
        break;
    }
  }
```

Ligue tudo na `<ul>` e passe as props novas para o `SlideCard`:

```jsx
      <ul
        className="space-y-3"
        aria-label={`Slides do carrossel, ${slides.length} no total`}
        onKeyDown={handleKeyDownLista}
      >
        {slides.map((slide, indice) => (
          <SlideCard
            key={slide.id}
            ref={(el) => { slideRefs.current[indice] = el; }}
            slide={slide}
            indice={indice}
            total={slides.length}
            ativo={indice === slideAtivo}
            onFocarSlide={() => setSlideAtivo(indice)}
            onTextoChange={handleTextoChange}
            onMover={moverSlide}
            onRemover={removerSlide}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </ul>

      {/* Anuncia a mudanca de slide sem mover o foco (WCAG 4.1.3) */}
      <p aria-live="polite" className="sr-only">{anuncio}</p>

      <p className="text-[11px] text-text-muted">
        Dentro da lista: setas navegam entre slides, Home e End vão para o primeiro
        e o último, Enter edita o texto, Alt + setas reordenam.
      </p>
```

**Passo 5 - Rotular cada slide no `SlideCard.jsx`**

O componente passa a receber `ref` (use `forwardRef`) e as props `ativo` e `onFocarSlide`. O `<li>` vira o grupo focável:

```jsx
import React, { forwardRef } from "react";
```

```jsx
const SlideCard = forwardRef(function SlideCard(
  { slide, indice, total, ativo, onFocarSlide, onTextoChange, onMover, onRemover,
    onDragStart, onDragOver, onDrop },
  ref
) {
  const excedeu = slide.texto.length > LIMITE_CARACTERES;

  return (
    <li
      ref={ref}
      data-slide-grupo="true"
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${indice + 1} de ${total}, ${ROTULO_TIPO[slide.tipo]}`}
      tabIndex={ativo ? 0 : -1}
      onFocus={onFocarSlide}
      draggable
      onDragStart={(e) => onDragStart(e, indice)}
      onDragOver={(e) => onDragOver(e, indice)}
      onDrop={(e) => onDrop(e, indice)}
      className={`card grid grid-cols-1 md:grid-cols-[9rem_1fr] gap-4 ${
        ativo ? "border-flowity-purple/40" : ""
      }`}
    >
```

E feche o componente com:

```jsx
});

export default SlideCard;
```

Importante: `aria-roledescription="slide"` só é lido por leitores de tela quando o elemento tem um `role` explícito - por isso o `role="group"` no `<li>`.

**Passo 6 - Tornar o calendário navegável por teclado**

Em `ContentCalendar.jsx`, envolva a grade com os papéis de tabela de dados e coordene o dia focado:

```jsx
  const [diaFocado, setDiaFocado] = useState(0);
  const celulaRefs = useRef([]);

  function moverFoco(novoIndice, totalDias) {
    const limitado = Math.max(0, Math.min(novoIndice, totalDias - 1));
    setDiaFocado(limitado);
    celulaRefs.current[limitado]?.focus();
  }

  function handleKeyDownGrade(e, indice, totalDias) {
    const mapa = {
      ArrowRight: indice + 1,
      ArrowLeft: indice - 1,
      ArrowDown: indice + 7,
      ArrowUp: indice - 7,
      Home: indice - (indice % 7),
      End: indice - (indice % 7) + 6,
      PageUp: 0,
      PageDown: totalDias - 1,
    };
    if (!(e.key in mapa)) return;
    e.preventDefault();
    moverFoco(mapa[e.key], totalDias);
  }
```

```jsx
      <div role="grid" aria-label="Calendário editorial do mês" className="grid grid-cols-7 gap-2">
        {/* ...cabecalho dos dias da semana com role="columnheader"... */}
        {dias.map((day, indice) => (
          <CalendarDayCell
            key={indice}
            ref={(el) => { celulaRefs.current[indice] = el; }}
            day={day}
            posts={postsPorDia[indice] || []}
            isToday={ehHoje(day)}
            focado={indice === diaFocado}
            onKeyDown={(e) => handleKeyDownGrade(e, indice, dias.length)}
            onAddPost={onAddPost}
            onEditPost={onEditPost}
          />
        ))}
      </div>
```

Em `CalendarDayCell.jsx`, a célula ganha `role="gridcell"`, `tabIndex` controlado e rótulo em português:

```jsx
    <div
      ref={ref}
      role="gridcell"
      tabIndex={focado ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAddPost(day);
        } else {
          onKeyDown(e);
        }
      }}
      aria-label={`${day.toLocaleDateString("pt-BR", {
        day: "numeric", month: "long",
      })}, ${posts.length} post(s) agendado(s)`}
      className={`bg-bg-surface border rounded-lg min-h-24 p-2 group transition-colors hover:border-border-bright ${
        isToday ? "border-flowity-purple/50" : "border-border"
      }`}
    >
```

**Passo 7 - Tabela de atalhos para documentar na interface**

Adicione um bloco de ajuda visível na `CarouselPage.jsx`, acima do builder, com exatamente estes atalhos:

```jsx
      <details className="card">
        <summary className="text-sm font-medium text-text-primary cursor-pointer">
          Atalhos de teclado
        </summary>
        <dl className="mt-3 grid grid-cols-[9rem_1fr] gap-y-1 text-xs">
          <dt className="font-mono text-flowity-cyan">Tab</dt>
          <dd className="text-text-secondary">Entra e sai da lista de slides</dd>
          <dt className="font-mono text-flowity-cyan">Seta esquerda / direita</dt>
          <dd className="text-text-secondary">Slide anterior / próximo</dd>
          <dt className="font-mono text-flowity-cyan">Seta cima / baixo</dt>
          <dd className="text-text-secondary">Slide anterior / próximo</dd>
          <dt className="font-mono text-flowity-cyan">Home / End</dt>
          <dd className="text-text-secondary">Primeiro / último slide</dd>
          <dt className="font-mono text-flowity-cyan">Enter ou Espaço</dt>
          <dd className="text-text-secondary">Edita o texto do slide em foco</dd>
          <dt className="font-mono text-flowity-cyan">Alt + setas</dt>
          <dd className="text-text-secondary">Reordena o slide em foco</dd>
          <dt className="font-mono text-flowity-cyan">Escape</dt>
          <dd className="text-text-secondary">Sai da edição / fecha o modal</dd>
        </dl>
      </details>
```

**Passo 8 - Rodar o roteiro de teste manual com NVDA**

Baixe o NVDA em https://www.nvaccess.org/download/ (gratuito, Windows). Instale, abra e siga o roteiro. Anote o que o leitor falou em cada passo, em `docs/PI2/evidencias/nvda-roteiro.md`.

```text
ROTEIRO DE TESTE COM NVDA - Flowity Content Engine (PI 2)
Tecla NVDA = Insert (ou Caps Lock, se voce escolheu laptop layout)

PREPARACAO
  1. Abra o NVDA. Espere o som de inicializacao.
  2. NVDA + S ate ouvir "fala sob demanda desligada" (fala normal).
  3. Abra o Chrome em http://localhost:5173 e faca login.

TESTE 1 - Skip link e landmarks
  4. Pressione Tab uma vez.
     ESPERADO: "Pular para o conteudo principal, link"
  5. Pressione Enter.
     ESPERADO: o foco vai para a regiao principal.
  6. Pressione D repetidamente (navegacao por landmarks).
     ESPERADO: "banner", "navegacao principal", "principal", "informacoes de rodape"

TESTE 2 - Navegacao do carrossel
  7. Navegue ate /carousel/1. Pressione Tab ate ouvir:
     ESPERADO: "Slide 1 de 5, Capa, slide, grupo"
  8. Pressione Seta direita.
     ESPERADO: "Slide 2 de 5, Conteudo, slide, grupo" e, pela regiao viva,
               o inicio do texto do slide.
  9. Pressione End.
     ESPERADO: "Slide 5 de 5, Chamada para acao, slide, grupo"
 10. Pressione Home, depois Enter.
     ESPERADO: "Texto do slide 1, edicao, multilinha" e o NVDA entra em
               modo de foco (som grave).
 11. Pressione Escape para sair da edicao e Alt + Seta para baixo.
     ESPERADO: a regiao viva anuncia "Slide movido para a posicao 2 de 5."

TESTE 3 - Botoes de reordenacao
 12. Com Tab, chegue ao botao de mover.
     ESPERADO: "Mover o slide 2 para cima, botao"
 13. No primeiro slide, o mesmo botao deve anunciar "indisponivel" ou "esmaecido".

TESTE 4 - Modal de post e devolucao de foco
 14. Va para /pipeline e abra um post com Enter.
     ESPERADO: "Post numero 42, dialogo" e o foco cai no primeiro campo.
 15. Pressione Tab ate o ultimo botao ("Salvar alteracoes") e Tab de novo.
     ESPERADO: o foco volta para o PRIMEIRO elemento do dialogo, nunca
               para a pagina atras do overlay.
 16. Pressione Shift + Tab no primeiro elemento.
     ESPERADO: o foco vai para o ultimo elemento do dialogo.
 17. Pressione Escape.
     ESPERADO: o dialogo fecha e o NVDA anuncia de novo o card do post
               que voce abriu - o foco voltou para a origem.

TESTE 5 - Calendario
 18. Va para / e pressione Tab ate entrar na grade.
     ESPERADO: "Calendario editorial do mes, grade" e depois
               "1 de setembro, 2 posts agendados, celula"
 19. Seta direita, Seta para baixo, Home, End.
     ESPERADO: o foco anda dia a dia e semana a semana, sem sair da grade.
 20. Pressione Enter em um dia vazio.
     ESPERADO: abre o modal de novo post naquele dia.

CRITERIO DE APROVACAO
  Todos os 20 passos executados sem mouse e sem nenhum "clicavel" generico,
  "botao sem nome" ou silencio do leitor de tela.
```

**Passo 9 - Commit e Pull Request**

```bash
git add frontend/src/lib/useFocusTrap.js \
        frontend/src/components/carousel/ \
        frontend/src/components/posts/PostModal.jsx \
        frontend/src/components/calendar/ \
        frontend/src/pages/CarouselPage.jsx \
        docs/PI2/evidencias/nvda-roteiro.md

git commit -m "feat(a11y): navegacao por teclado e leitor de tela no carrossel e no calendario

Implementa roving tabindex na lista de slides com setas, Home/End,
Enter/Espaco para editar e Alt+setas para reordenar. Cada slide recebe
role=group, aria-roledescription=slide e aria-label 'Slide N de T', com
anuncio da mudanca por regiao aria-live. Cria o hook useFocusTrap que
prende o Tab dentro do PostModal, fecha no Escape e devolve o foco ao
elemento que abriu o dialogo. Torna as celulas do calendario navegaveis
por setas dentro de um role=grid. Documenta os atalhos na interface e
inclui o roteiro de teste manual com NVDA."

git push -u origin feat/pi2-10-teclado-leitor-tela-carrossel
```

Abra o PR para `main` com o título "PI2-10: navegação por teclado e leitor de tela" e escreva `Closes #<numero-da-issue>` no corpo, anexando o `nvda-roteiro.md` preenchido.

## Exemplo de uso

```text
TABELA DE ATALHOS IMPLEMENTADA
------------------------------
CONTEXTO          TECLA                  ACAO
Global            Tab (1a vez)           Revela o skip link
Lista de slides   Tab                    Entra na lista (uma unica parada)
Lista de slides   Seta direita / baixo   Proximo slide
Lista de slides   Seta esquerda / cima   Slide anterior
Lista de slides   Home                   Primeiro slide
Lista de slides   End                    Ultimo slide
Lista de slides   Enter ou Espaco        Edita o texto do slide em foco
Lista de slides   Alt + seta baixo       Move o slide uma posicao adiante
Lista de slides   Alt + seta cima        Move o slide uma posicao atras
Edicao de slide   Escape                 Sai do campo, volta ao grupo
PostModal         Tab / Shift+Tab        Circula SO dentro do dialogo
PostModal         Escape                 Fecha e devolve o foco a origem
Calendario        Setas                  Anda por dia e por semana
Calendario        Home / End             Inicio / fim da semana
Calendario        PageUp / PageDown      Primeiro / ultimo dia do mes
Calendario        Enter ou Espaco        Cria post no dia em foco

O QUE O NVDA FALA (antes x depois)
----------------------------------
ANTES
  Tab, Tab, Tab...  "clicavel"  "clicavel"  "grafico"  "botao"
  (o usuario nao sabe em que slide esta nem o que o botao faz)

DEPOIS
  Tab               "Slides do carrossel, 5 no total, lista"
                    "Slide 1 de 5, Capa, slide, grupo"
  Seta direita      "Slide 2 de 5, Conteudo, slide, grupo"
                    (regiao viva) "Slide 2 de 5. Toda empresa acha que ouve..."
  Tab               "Mover o slide 2 para cima, botao"
  Alt + seta baixo  (regiao viva) "Slide movido para a posicao 3 de 5."
  Escape no modal   "Post 42, Seu time responde rapido, botao"
                    (o foco voltou exatamente para o card que abriu o modal)
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Roteiro NVDA concluído | Executar os 20 passos do Passo 8 sem mouse | 20/20 passos aprovados, 0 anúncios de "clicável" ou "botão sem nome" |
| Paradas de Tab na lista de slides | Contar os Tabs necessários para atravessar 8 slides | Exatamente 1 parada para o grupo (roving tabindex funcionando) |
| Devolução de foco ao fechar o modal | Abrir e fechar o `PostModal` 5 vezes por Escape e pelo botão fechar | 5/5 retornos ao elemento de origem |
| Violações do axe DevTools | Scan em `/carousel/:postId` e em `/` com o modal aberto | 0 violações críticas ou sérias |
| Pontuação de acessibilidade no Lighthouse | Lighthouse, categoria Accessibility, na CarouselPage | >= 95 |

## Definition of Done

- [ ] Hook `useFocusTrap.js` criado, prendendo Tab e Shift+Tab dentro do diálogo
- [ ] `PostModal` fecha no Escape e devolve o foco ao elemento que o abriu
- [ ] `PostModal` recebe o foco no primeiro campo ao abrir
- [ ] Roving tabindex implementado: apenas o slide ativo tem `tabIndex={0}`
- [ ] Setas esquerda/direita e cima/baixo navegam entre slides; Home e End vão às pontas
- [ ] Enter e Espaço entram na edição do texto do slide em foco
- [ ] Alt + setas reordenam o slide sem tirar o foco do grupo
- [ ] Cada slide tem `role="group"`, `aria-roledescription="slide"` e `aria-label="Slide N de T"`
- [ ] Mudança de slide e de ordem anunciadas por região `aria-live="polite"`
- [ ] Grade do calendário com `role="grid"`, células com `role="gridcell"` e navegação por setas
- [ ] Tabela de atalhos visível na interface dentro de um `<details>`
- [ ] Roteiro NVDA executado e resultado registrado em `docs/PI2/evidencias/nvda-roteiro.md`
- [ ] `npm run build` executa sem erros
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- WCAG 2.1, critério 2.1.1 Teclado: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
- WCAG 2.1, critério 2.1.2 Sem Bloqueio de Teclado: https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html
- WCAG 2.1, critério 2.4.3 Ordem de Foco: https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html
- WCAG 2.1, critério 4.1.3 Mensagens de Status: https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html
- WAI-ARIA APG, padrão Carousel: https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
- WAI-ARIA APG, padrão Dialog (Modal): https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- WAI-ARIA APG, padrão Grid: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
- WAI-ARIA APG, gerenciamento de foco e roving tabindex: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- MDN, `aria-roledescription`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-roledescription
- MDN, evento `keydown`: https://developer.mozilla.org/pt-BR/docs/Web/API/Element/keydown_event
- NVDA - download e guia do usuário: https://www.nvaccess.org/download/
- eMAG - Modelo de Acessibilidade em Governo Eletrônico: https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/eMAGv31.pdf/view
- Lei 13.146/2015 (Lei Brasileira de Inclusão), art. 63: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
