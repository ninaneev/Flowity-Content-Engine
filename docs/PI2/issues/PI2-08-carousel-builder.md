<!-- TITLE: [PI2][P0][Frontend] CarouselBuilder: montar, reordenar e pré-visualizar carrossel do LinkedIn -->
<!-- LABELS: area:frontend,prio:p0,sprint:pi2 -->

## Contexto (PI 2)

O PI 1 entregou um motor de conteúdo somente texto: o post nascia com hook, body e CTA e era publicado como texto puro. O PI 2 acrescenta o formato que mais engaja no LinkedIn hoje, o carrossel em PDF, e esta issue constrói a tela onde o editor transforma o corpo de um post em slides. A montagem precisa ser utilizável com mouse e também sem mouse: a reordenação por arrastar-e-soltar é a conveniência, mas os botões "mover para cima" e "mover para baixo" são o caminho acessível e são obrigatórios, conforme o critério 2.1.1 da WCAG 2.1 e o modelo eMAG. A geração final é feita pelo backend (`POST /posts/{id}/render/carousel`), especificado nas issues PI2-01 a PI2-06.

## Integrante responsável

Roger Luiz de Paula

## Branch

`feat/pi2-08-carousel-builder`

## Estimativa

14 a 18 horas

## Arquivos que você vai criar ou editar

- `frontend/src/pages/CarouselPage.jsx` - CRIAR. Página `/carousel/:postId`; carrega o post e os assets, orquestra estado e chamadas de API.
- `frontend/src/components/carousel/CarouselBuilder.jsx` - CRIAR. Lista de slides, drag-and-drop, botões de mover, limites de 3 a 10 slides e o botão "Gerar carrossel".
- `frontend/src/components/carousel/SlideCard.jsx` - CRIAR. Um slide na lista: edição inline do texto, controles de ordem e remoção.
- `frontend/src/components/carousel/SlidePreview.jsx` - CRIAR. Pré-visualização na proporção 1080x1350 (4:5) com marca Flowity.
- `frontend/src/App.jsx` - EDITAR. Nova rota `/carousel/:postId` dentro do `AppShell`.
- `frontend/src/components/layout/AppShell.jsx` - EDITAR. Novo item "Carrossel" no `NAV_ITEMS`.
- `frontend/src/lib/api.js` - EDITAR. Adicionar `render` em `postsApi` (o `assetsApi` já vem da issue PI2-07).

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-08-carousel-builder
```

**Passo 2 - Completar `frontend/src/lib/api.js`**

O `assetsApi` (com `list`, `upload`, `update`, `remove`, `reorder`) é entregue pela issue PI2-07. Aqui você só acrescenta os endpoints de render dentro de `postsApi`, mantendo o alinhamento do arquivo:

```js
// POSTS
export const postsApi = {
  list:     (params)        => api.get("/posts/", { params }),
  get:      (id)            => api.get(`/posts/${id}`),
  create:   (data)          => api.post("/posts/", data),
  update:   (id, data)      => api.put(`/posts/${id}`, data),
  calendar: (month)         => api.get("/posts/calendar", { params: { month } }),
  pipeline: ()              => api.get("/posts/", { params: {} }),

  // PI 2 - renderizacao de imagem unica e de carrossel
  renderImage:    (id)       => api.post(`/posts/${id}/render/image`),
  renderCarousel: (id, data) => api.post(`/posts/${id}/render/carousel`, data),
};
```

**Passo 3 - Criar `frontend/src/components/carousel/SlidePreview.jsx`**

A proporção do carrossel do LinkedIn é 1080x1350 px, ou seja 4:5. Use `aspect-[4/5]` do Tailwind para que a prévia seja fiel em qualquer largura.

```jsx
import React from "react";

const CORES_POR_TIPO = {
  capa: "from-flowity-purple/30 to-flowity-cyan/20",
  conteudo: "from-bg-elevated to-bg-surface",
  cta: "from-flowity-cyan/25 to-flowity-purple/20",
};

export default function SlidePreview({ slide, indice, total }) {
  return (
    <div
      className={`aspect-[4/5] w-full rounded-lg border border-border bg-gradient-to-br ${
        CORES_POR_TIPO[slide.tipo] || CORES_POR_TIPO.conteudo
      } p-5 flex flex-col justify-between overflow-hidden`}
    >
      <p className="text-[10px] uppercase tracking-wide text-text-muted">
        Flowity AI
      </p>

      <p
        className={`text-text-primary leading-snug break-words ${
          slide.tipo === "capa" ? "text-xl font-bold" : "text-sm"
        }`}
      >
        {slide.texto || "Slide sem texto"}
      </p>

      <p className="text-[10px] text-text-muted">
        {indice + 1} / {total} &middot; 1080x1350 (4:5)
      </p>
    </div>
  );
}
```

**Passo 4 - Criar `frontend/src/components/carousel/SlideCard.jsx`**

Cada slide traz: campo de texto editável inline, contador de caracteres, botões "mover para cima"/"mover para baixo" (o caminho acessível obrigatório) e remoção. Os botões trazem `aria-label` descritivo porque o ícone sozinho não é lido por leitor de tela.

```jsx
import React from "react";
import { ArrowUp, ArrowDown, GripVertical, Trash2 } from "lucide-react";
import SlidePreview from "./SlidePreview";

const LIMITE_CARACTERES = 220;

const ROTULO_TIPO = {
  capa: "Capa",
  conteudo: "Conteúdo",
  cta: "Chamada para ação",
};

export default function SlideCard({
  slide,
  indice,
  total,
  onTextoChange,
  onMover,
  onRemover,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const excedeu = slide.texto.length > LIMITE_CARACTERES;

  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, indice)}
      onDragOver={(e) => onDragOver(e, indice)}
      onDrop={(e) => onDrop(e, indice)}
      className="card grid grid-cols-1 md:grid-cols-[9rem_1fr] gap-4"
    >
      <SlidePreview slide={slide} indice={indice} total={total} />

      <div className="min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="badge bg-flowity-purple-dim text-flowity-purple">
            Slide {indice + 1} &middot; {ROTULO_TIPO[slide.tipo]}
          </span>

          <div className="flex items-center gap-1">
            <span className="text-text-muted" aria-hidden="true">
              <GripVertical size={14} />
            </span>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => onMover(indice, indice - 1)}
              disabled={indice === 0}
              aria-label={`Mover o slide ${indice + 1} para cima`}
            >
              <ArrowUp size={14} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => onMover(indice, indice + 1)}
              disabled={indice === total - 1}
              aria-label={`Mover o slide ${indice + 1} para baixo`}
            >
              <ArrowDown size={14} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="btn-ghost hover:text-status-failed"
              onClick={() => onRemover(indice)}
              aria-label={`Remover o slide ${indice + 1}`}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        </div>

        <label className="label" htmlFor={`slide-texto-${slide.id}`}>
          Texto do slide {indice + 1}
        </label>
        <textarea
          id={`slide-texto-${slide.id}`}
          className="textarea"
          rows={4}
          value={slide.texto}
          onChange={(e) => onTextoChange(slide.id, e.target.value)}
          aria-describedby={`slide-contador-${slide.id}`}
          aria-invalid={excedeu ? "true" : undefined}
        />
        <p
          id={`slide-contador-${slide.id}`}
          className={`text-[11px] mt-1 ${excedeu ? "text-status-failed font-medium" : "text-text-muted"}`}
        >
          {slide.texto.length}/{LIMITE_CARACTERES} caracteres recomendados para caber em 1080x1350.
        </p>
      </div>
    </li>
  );
}
```

**Passo 5 - Criar `frontend/src/components/carousel/CarouselBuilder.jsx`**

Este é o núcleo da issue. Repare em três coisas: a função `moverSlide` é compartilhada pelos botões e pelo drag-and-drop (uma única fonte de verdade), a persistência da ordem usa atualização otimista com rollback, e os limites de 3 e 10 slides bloqueiam a geração com aviso visual.

```jsx
import React, { useState, useRef } from "react";
import { Plus, Layers } from "lucide-react";
import SlideCard from "./SlideCard";
import { assetsApi, postsApi } from "../../lib/api";

const MIN_SLIDES = 3;
const MAX_SLIDES = 10;

// Funcao pura: reposiciona um item da lista. Usada pelos botoes E pelo drag-and-drop.
export function reordenar(lista, de, para) {
  if (para < 0 || para >= lista.length || de === para) return lista;
  const copia = [...lista];
  const [item] = copia.splice(de, 1);
  copia.splice(para, 0, item);
  return copia;
}

export default function CarouselBuilder({ postId, slidesIniciais, onGerado }) {
  const [slides, setSlides] = useState(slidesIniciais);
  const [status, setStatus] = useState("");
  const [erro, setErro] = useState(null);
  const [gerando, setGerando] = useState(false);
  const arrastadoRef = useRef(null);

  const totalConteudo = slides.filter((s) => s.tipo === "conteudo").length;
  const foraDoLimite = slides.length < MIN_SLIDES || slides.length > MAX_SLIDES;

  function handleTextoChange(id, texto) {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, texto } : s)));
  }

  // Atualizacao otimista: a UI muda na hora, a API confirma depois.
  // Se o PUT falhar, voltamos para a ordem anterior e avisamos o usuario.
  async function moverSlide(de, para) {
    const anterior = slides;
    const nova = reordenar(slides, de, para);
    if (nova === anterior) return;

    setSlides(nova);
    setErro(null);
    setStatus(`Slide movido para a posição ${para + 1} de ${nova.length}.`);

    const idsPersistiveis = nova.filter((s) => s.assetId).map((s) => s.assetId);
    if (idsPersistiveis.length === 0) return;

    try {
      await assetsApi.reorder(postId, idsPersistiveis);
    } catch {
      setSlides(anterior);
      setStatus("");
      setErro("Não foi possível salvar a nova ordem. A ordem anterior foi restaurada.");
    }
  }

  function handleDragStart(e, indice) {
    arrastadoRef.current = indice;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e, indice) {
    e.preventDefault();
    const de = arrastadoRef.current;
    arrastadoRef.current = null;
    if (de === null || de === indice) return;
    moverSlide(de, indice);
  }

  function adicionarSlide() {
    if (slides.length >= MAX_SLIDES) return;
    const posicaoCta = slides.findIndex((s) => s.tipo === "cta");
    const novo = { id: `novo-${Date.now()}`, tipo: "conteudo", texto: "", assetId: null };
    setSlides((prev) => {
      const copia = [...prev];
      copia.splice(posicaoCta === -1 ? copia.length : posicaoCta, 0, novo);
      return copia;
    });
  }

  function removerSlide(indice) {
    if (slides.length <= MIN_SLIDES) return;
    setSlides((prev) => prev.filter((_, i) => i !== indice));
  }

  async function gerarCarrossel() {
    if (foraDoLimite) return;
    setGerando(true);
    setErro(null);
    setStatus("Gerando o carrossel...");
    try {
      const { data } = await postsApi.renderCarousel(postId, {
        slides: slides.map((s, i) => ({ position: i, kind: s.tipo, text: s.texto })),
      });
      setStatus(`Carrossel gerado com ${slides.length} slides.`);
      onGerado(data);
    } catch (err) {
      setStatus("");
      setErro(err.response?.data?.detail || "Falha ao gerar o carrossel. Tente novamente.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <section aria-labelledby="titulo-builder" className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 id="titulo-builder" className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Layers size={18} className="text-flowity-cyan" aria-hidden="true" />
          Montagem do carrossel
        </h2>
        <button
          type="button"
          className="btn-secondary"
          onClick={adicionarSlide}
          disabled={slides.length >= MAX_SLIDES}
        >
          <Plus size={14} aria-hidden="true" />
          Adicionar slide de conteúdo
        </button>
      </div>

      <p className="text-xs text-text-muted">
        Estrutura recomendada: 1 capa, de 3 a 8 slides de conteúdo e 1 chamada para ação.
        Você tem {totalConteudo} slide(s) de conteúdo. Reordene arrastando ou pelos botões
        "mover para cima" e "mover para baixo".
      </p>

      {foraDoLimite && (
        <p role="alert" className="card border-status-failed/50 text-sm text-status-failed">
          O carrossel precisa ter entre {MIN_SLIDES} e {MAX_SLIDES} slides. Atualmente há {slides.length}.
        </p>
      )}

      <ul className="space-y-3" aria-label={`Slides do carrossel, ${slides.length} no total`}>
        {slides.map((slide, indice) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            indice={indice}
            total={slides.length}
            onTextoChange={handleTextoChange}
            onMover={moverSlide}
            onRemover={removerSlide}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </ul>

      {/* Regiao viva: anuncia mudancas de ordem e status da geracao. */}
      <p aria-live="polite" className="text-xs text-text-secondary min-h-4">{status}</p>
      {erro && <p role="alert" className="text-xs text-status-failed font-medium">{erro}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={gerarCarrossel}
          disabled={foraDoLimite || gerando}
          aria-busy={gerando ? "true" : undefined}
        >
          {gerando ? "Gerando..." : `Gerar carrossel (${slides.length} slides)`}
        </button>
      </div>
    </section>
  );
}
```

**Passo 6 - Criar `frontend/src/pages/CarouselPage.jsx`**

A página divide o `body` do post em slides. A heurística é simples e previsível: quebra por linha em branco, descarta linhas vazias, usa o `hook` como capa e o `cta` como último slide.

```jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CarouselBuilder from "../components/carousel/CarouselBuilder";
import { postsApi, assetsApi } from "../lib/api";

// Divide o corpo do post em slides: capa (hook) + conteudo (paragrafos) + CTA.
export function dividirEmSlides(post) {
  const paragrafos = (post.body || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8);

  const slides = [
    { id: "capa", tipo: "capa", texto: post.hook || "", assetId: null },
    ...paragrafos.map((texto, i) => ({
      id: `conteudo-${i}`,
      tipo: "conteudo",
      texto,
      assetId: null,
    })),
  ];

  if (post.cta) {
    slides.push({ id: "cta", tipo: "cta", texto: post.cta, assetId: null });
  }
  return slides;
}

export default function CarouselPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [slides, setSlides] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([postsApi.get(postId), assetsApi.list(postId)])
      .then(([respPost, respAssets]) => {
        if (!ativo) return;
        setPost(respPost.data);
        const existentes = respAssets.data.filter((a) => a.kind === "slide");
        setSlides(
          existentes.length > 0
            ? existentes
                .sort((a, b) => a.position - b.position)
                .map((a) => ({
                  id: `asset-${a.id}`,
                  tipo: a.position === 0 ? "capa" : "conteudo",
                  texto: a.caption || "",
                  assetId: a.id,
                }))
            : dividirEmSlides(respPost.data)
        );
      })
      .catch(() => ativo && setErro("Não foi possível carregar o post."))
      .finally(() => ativo && setCarregando(false));
    return () => { ativo = false; };
  }, [postId]);

  if (carregando) return <p className="p-6 text-sm text-text-muted">Carregando post...</p>;
  if (erro) return <p role="alert" className="p-6 text-sm text-status-failed">{erro}</p>;

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <Link to="/pipeline" className="btn-ghost">
        <ArrowLeft size={14} aria-hidden="true" />
        Voltar para o pipeline
      </Link>

      <header>
        <h1 className="text-2xl font-bold gradient-text">Carrossel do LinkedIn</h1>
        <p className="text-sm text-text-muted mt-1">
          Post #{post.id} &middot; {post.hook}
        </p>
      </header>

      <CarouselBuilder postId={post.id} slidesIniciais={slides} onGerado={setResultado} />

      {resultado && (
        <p className="card text-sm text-text-secondary">
          Carrossel gerado. Use a área de exportação (issue PI2-11) para baixar o PDF e os PNGs.
        </p>
      )}
    </div>
  );
}
```

**Passo 7 - Registrar a rota em `frontend/src/App.jsx`**

Adicione o import e a rota dentro do `<Routes>` interno, antes do `<Route path="*" ... />`:

```jsx
import CarouselPage from "./pages/CarouselPage";
```

```jsx
                <Route path="/carousel/:postId" element={<CarouselPage />} />
```

**Passo 8 - Adicionar o link no `AppShell.jsx`**

Importe o ícone e acrescente o item ao array `NAV_ITEMS`, entre "Generator" e "Pipeline":

```jsx
import {
  Calendar, BookOpen, Sparkles, LayoutList, Settings, LogOut, Zap, Images
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: Calendar, label: "Calendar" },
  { to: "/sources", icon: BookOpen, label: "Library" },
  { to: "/generator", icon: Sparkles, label: "Generator" },
  { to: "/carousel", icon: Images, label: "Carrossel" },
  { to: "/pipeline", icon: LayoutList, label: "Pipeline" },
  { to: "/settings", icon: Settings, label: "Settings" },
];
```

Como a rota exige um `postId`, adicione também em `App.jsx` uma rota de seleção simples que redireciona para o pipeline quando não há post escolhido:

```jsx
                <Route path="/carousel" element={<Navigate to="/pipeline" replace />} />
```

**Passo 9 - Testar manualmente**

```bash
cd frontend
npm run dev
```

Roteiro:
1. Abra `/carousel/1` com um post que tenha `body` com pelo menos três parágrafos.
2. Confirme que os slides aparecem: capa com o hook, conteúdo com os parágrafos e CTA no fim.
3. Arraste o slide 4 para a posição 2 e verifique no DevTools o `PUT /posts/1/assets/order`.
4. Repita a mesma reordenação usando somente os botões e o teclado (Tab até o botão, Enter).
5. Remova slides até ficar com 2 e confirme o aviso vermelho e o botão "Gerar carrossel" desabilitado.

**Passo 10 - Commit e Pull Request**

```bash
git add frontend/src/pages/CarouselPage.jsx \
        frontend/src/components/carousel/ \
        frontend/src/App.jsx \
        frontend/src/components/layout/AppShell.jsx \
        frontend/src/lib/api.js

git commit -m "feat(carousel): montagem, reordenacao e previa do carrossel do LinkedIn

Cria CarouselPage, CarouselBuilder, SlideCard e SlidePreview. Divide o corpo
do post em capa, slides de conteudo e CTA, com edicao inline de cada slide.
Reordenacao por drag-and-drop e tambem por botoes mover para cima/baixo,
que sao o caminho acessivel obrigatorio. Persiste a ordem com atualizacao
otimista via PUT /posts/{id}/assets/order e gera o carrossel via
POST /posts/{id}/render/carousel. Aplica limites de 3 a 10 slides e previa
na proporcao 1080x1350."

git push -u origin feat/pi2-08-carousel-builder
```

Abra o PR para `main` com o título "PI2-08: CarouselBuilder do LinkedIn" e escreva `Closes #<numero-da-issue>` no corpo.

## Exemplo de uso

```text
ENTRADA - post #17 vindo do Generator
-------------------------------------
hook: "Seu time responde rapido. Mas responde a coisa certa?"
body:
  "Toda empresa acha que ouve o cliente. Poucas conseguem provar."
  (linha em branco)
  "A maioria mede tempo de resposta, nao tema recorrente."
  (linha em branco)
  "Sinal organizacional e o que se repete, nao o que grita mais alto."
cta: "Comente 'sinal' e eu mando o mapa de leitura."

SAIDA - montagem automatica na CarouselPage
-------------------------------------------
 1  [Capa]      "Seu time responde rapido. Mas responde a coisa certa?"
 2  [Conteudo]  "Toda empresa acha que ouve o cliente. Poucas conseguem provar."
 3  [Conteudo]  "A maioria mede tempo de resposta, nao tema recorrente."
 4  [Conteudo]  "Sinal organizacional e o que se repete, nao o que grita mais alto."
 5  [CTA]       "Comente 'sinal' e eu mando o mapa de leitura."

INTERACAO DE REORDENACAO (somente teclado)
------------------------------------------
Tab ate "Mover o slide 4 para cima" -> Enter
  UI atualiza imediatamente (otimista):
     1 Capa | 2 Conteudo | 3 Sinal organizacional... | 4 A maioria mede... | 5 CTA
  aria-live anuncia: "Slide movido para a posicao 3 de 5."
  PUT /posts/17/assets/order  {"ids": [3, 1, 2]}
  Se o PUT falhar -> a lista volta a ordem anterior e aparece:
     "Nao foi possivel salvar a nova ordem. A ordem anterior foi restaurada."

GERACAO
-------
Clique em "Gerar carrossel (5 slides)"
  POST /posts/17/render/carousel
  200 -> {"pdf_url": "/media/posts/17/carousel.pdf", "slides": [...5 assets...]}
  aria-live anuncia: "Carrossel gerado com 5 slides."
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Reordenação sem mouse | Reordenar 3 slides usando apenas Tab e Enter nos botões mover | 100% das reordenações concluídas sem mouse |
| Violações de acessibilidade na CarouselPage | axe DevTools na página com 5 slides carregados | 0 violações críticas ou sérias |
| Fidelidade da proporção | Medir a prévia no DevTools (largura x altura) | Razão 4:5 com erro menor que 1% |
| Consistência da ordem persistida | Recarregar a página após reordenar e comparar com a ordem exibida antes | 100% de correspondência em 5 tentativas |
| Bloqueio dos limites | Tentar gerar com 2 slides e com 11 slides | Botão desabilitado e aviso `role="alert"` visível nos 2 casos |

## Definition of Done

- [ ] `CarouselPage.jsx` criada e rota `/carousel/:postId` registrada em `App.jsx`
- [ ] Item "Carrossel" adicionado ao `NAV_ITEMS` do `AppShell.jsx`
- [ ] O corpo do post é dividido em capa, de 3 a 8 slides de conteúdo e CTA
- [ ] Texto de cada slide editável inline com contador de caracteres
- [ ] Reordenação funciona por drag-and-drop E pelos botões "mover para cima"/"mover para baixo" com `aria-label` descritivo
- [ ] Botões de mover ficam `disabled` no primeiro e no último slide
- [ ] Atualização otimista implementada com rollback e mensagem de erro quando o `PUT .../assets/order` falha
- [ ] Prévia respeita 1080x1350 (`aspect-[4/5]`) e indica a proporção em texto
- [ ] Limites de 3 e 10 slides bloqueiam a geração com aviso visual `role="alert"`
- [ ] Botão "Gerar carrossel" chama `POST /posts/{id}/render/carousel` e usa `aria-busy` enquanto processa
- [ ] Mudanças de ordem e status anunciados por região `aria-live="polite"`
- [ ] `npm run build` executa sem erros
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- WCAG 2.1, critério 2.1.1 Teclado: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
- WCAG 2.1, critério 2.5.7 Movimentos de Arrasto: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- WCAG 2.1, critério 4.1.3 Mensagens de Status: https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html
- WAI-ARIA Authoring Practices, padrão de lista e reordenação: https://www.w3.org/WAI/ARIA/apg/patterns/
- MDN, API de arrastar e soltar: https://developer.mozilla.org/pt-BR/docs/Web/API/HTML_Drag_and_Drop_API
- MDN, `aria-live`: https://developer.mozilla.org/pt-BR/docs/Web/Accessibility/ARIA/Attributes/aria-live
- Tailwind CSS, utilitário `aspect-ratio`: https://tailwindcss.com/docs/aspect-ratio
- eMAG - Modelo de Acessibilidade em Governo Eletrônico: https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/eMAGv31.pdf/view
- Lei 13.146/2015 (Lei Brasileira de Inclusão): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
