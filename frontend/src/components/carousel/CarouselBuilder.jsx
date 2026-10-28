import React, { useEffect, useRef, useState } from "react";
import { Layers, Plus } from "lucide-react";
import SlideCard, { FOCO } from "./SlideCard";
import { postsApi } from "../../lib/api";
import { mensagemDeErro } from "../../lib/imageUpload.mjs";
import {
  MAX_SLIDES,
  MIN_SLIDES,
  motivoParaNaoGerar,
  mover,
} from "../../lib/carouselSlides.mjs";

let proximoId = 1;

const novoItem = (texto = "") => ({
  id: proximoId++,
  texto: typeof texto === "string" ? texto : "",
});

function normalizarSlides(slides) {
  if (!Array.isArray(slides)) {
    return [];
  }

  return slides.map((slide) => {
    if (typeof slide === "string") {
      return novoItem(slide);
    }

    if (slide && typeof slide.texto === "string") {
      return novoItem(slide.texto);
    }

    return novoItem("");
  });
}

/**
 * Builds and manages the carousel.
 *
 * - Edits slide text.
 * - Reorders and removes slides.
 * - Adds new slides.
 * - Supports keyboard navigation.
 * - Announces changes to screen readers.
 * - Preserves focus after list changes.
 * - Asks the backend to generate the carousel.
 */
export default function CarouselBuilder({
  postId,
  slidesIniciais = [],
  onChange,
  onGerado,
}) {
  const [itens, setItens] = useState(() =>
    normalizarSlides(slidesIniciais)
  );

  const [atual, setAtual] = useState(0);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const focoPendente = useRef(null);
  const inicializacaoAplicada = useRef(false);

  /*
   * If the slides are loaded asynchronously,
   * initializes the list when the data arrives.
   *
   * Does not replace slides the user has already started editing.
   */
  useEffect(() => {
    if (
      inicializacaoAplicada.current ||
      !Array.isArray(slidesIniciais) ||
      slidesIniciais.length === 0
    ) {
      return;
    }

    inicializacaoAplicada.current = true;

    setItens((listaAtual) => {
      if (listaAtual.length > 0) {
        return listaAtual;
      }

      return normalizarSlides(slidesIniciais);
    });
  }, [slidesIniciais]);

  const textos = itens.map((item) => item.texto);
  const bloqueio = motivoParaNaoGerar(textos);
  const postIdValido = Number.isInteger(Number(postId)) && Number(postId) > 0;

  /*
   * Tells the parent component the content and the current slide.
   */
  useEffect(() => {
    onChange?.({
      textos,
      atual,
    });

    // onChange is an external prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, atual]);

  /*
   * Restores focus after the list is updated.
   */
  useEffect(() => {
    const alvos = focoPendente.current;

    if (!alvos || alvos.length === 0) {
      return;
    }

    focoPendente.current = null;

    requestAnimationFrame(() => {
      for (const id of alvos) {
        const elemento = document.getElementById(id);

        if (
          elemento &&
          !elemento.disabled &&
          elemento.getAttribute("aria-hidden") !== "true"
        ) {
          elemento.focus();
          return;
        }
      }
    });
  }, [itens]);

  /*
   * Keeps the selected index within the list bounds.
   */
  useEffect(() => {
    setAtual((indice) => {
      if (itens.length === 0) {
        return 0;
      }

      return Math.min(indice, itens.length - 1);
    });
  }, [itens.length]);

  function alterarTexto(indice, texto) {
    setItens((lista) =>
      lista.map((item, i) =>
        i === indice
          ? {
              ...item,
              texto,
            }
          : item
      )
    );
  }

  /*
   * Navigates between slides with the arrow keys.
   * Focus follows the selected slide.
   */
  function navegarSlide(indice, direcao) {
    if (itens.length === 0) {
      return;
    }

    const novoIndice = Math.max(
      0,
      Math.min(indice + direcao, itens.length - 1)
    );

    setAtual(novoIndice);

    // Moves focus to the selected slide's card.
    const item = itens[novoIndice];
    const cartao = document.querySelector(
      `[data-slide-id="${item.id}"]`
    );

    cartao?.focus();
  }

  /*
   * Allows navigating slides with the left/right arrow keys.
   * Does not intercept the arrows while the person is typing.
   */
  function handleListaKeyDown(event) {
    // Avoids handling again a key already handled by a slide.
    if (event.defaultPrevented) {
      return;
    }

    const alvo = event.target;

    if (
      alvo instanceof HTMLElement &&
      alvo.closest(
        'input, textarea, select, [contenteditable="true"]'
      )
    ) {
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      navegarSlide(atual, 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      navegarSlide(atual, -1);
    }
  }
  /*
   * Reorders the slides and returns focus to a control
   * belonging to the moved slide.
   */
  function moverSlide(indice, direcao) {
    const item = itens[indice];
    const destino = indice + direcao;

    if (!item) {
      return;
    }

    if (destino < 0 || destino >= itens.length) {
      return;
    }

    const botaoPrincipal =
      direcao < 0
        ? `slide-${item.id}-subir`
        : `slide-${item.id}-descer`;

    const botaoAlternativo =
      direcao < 0
        ? `slide-${item.id}-descer`
        : `slide-${item.id}-subir`;

    focoPendente.current = [
      botaoPrincipal,
      botaoAlternativo,
      `slide-${item.id}-texto`,
      `slide-${item.id}`,
    ];

    setItens((lista) => mover(lista, indice, direcao));
    setAtual(destino);

    setAviso(
      `Slide moved from position ${indice + 1} to position ${
        destino + 1
      }.`
    );
  }

  /*
   * Adds a slide before the last slide,
   * keeping the closing/CTA at the end.
   */
  function adicionarSlide() {
    if (itens.length >= MAX_SLIDES) {
      setAviso(`Limit of ${MAX_SLIDES} slides reached.`);
      return;
    }

    const item = novoItem("");
    const posicao = Math.max(itens.length - 1, 0);

    focoPendente.current = [
      `slide-${item.id}-texto`,
      `slide-${item.id}`,
    ];

    setItens((lista) => [
      ...lista.slice(0, posicao),
      item,
      ...lista.slice(posicao),
    ]);

    setAtual(posicao);

    setAviso(
      `Slide ${posicao + 1} added. Write its text.`
    );
  }

  /*
   * Removes a slide and moves focus to a neighbour.
   */
  function removerSlide(indice) {
    if (itens.length <= MIN_SLIDES) {
      setAviso(
        `The carousel needs at least ${MIN_SLIDES} slides.`
      );
      return;
    }

    const removido = itens[indice];

    if (!removido) {
      return;
    }

    const vizinho =
      itens[indice + 1] ||
      itens[indice - 1];

    if (vizinho) {
      focoPendente.current = [
        `slide-${vizinho.id}-texto`,
        `slide-${vizinho.id}`,
      ];
    }

    const novoTotal = itens.length - 1;

    setItens((lista) =>
      lista.filter((_, i) => i !== indice)
    );

    setAtual((valorAtual) =>
      Math.min(valorAtual, Math.max(0, novoTotal - 1))
    );

    setAviso(
      `Slide ${indice + 1} removed. The carousel now has ${novoTotal} slides.`
    );
  }

  /*
   * Sends the texts to the backend to generate the carousel.
   */
  async function gerar() {
    if (!postIdValido) {
      setErro("Could not identify the post. Go back to the Pipeline and open the carousel from a post.");
      return;
    }

    if (bloqueio || gerando) {
      return;
    }

    setGerando(true);
    setErro("");
    setAviso("Generating carousel. Please wait.");

    try {
      const { data } = await postsApi.render.carousel(
        postId,
        textos.map((texto) => texto.trim())
      );

      setAviso(
        `Carousel generated with ${
          data?.total_slides ?? textos.length
        } slides.`
      );

      onGerado?.(data);
    } catch (err) {
      setErro(
        mensagemDeErro(
          err,
          "Could not generate the carousel. Try again."
        )
      );

      setAviso("");
    } finally {
      setGerando(false);
    }
  }

  return (
    <section
      aria-labelledby="montagem-titulo"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="montagem-titulo"
          className="text-base font-semibold text-text-primary"
        >
          Slides ({itens.length} of at most {MAX_SLIDES})
        </h2>

        <p className="text-xs text-text-secondary">
          Minimum {MIN_SLIDES}, maximum {MAX_SLIDES}.
          Use the buttons to change the order.
        </p>
      </div>

      <ol
        aria-label="Carousel slides. Use the left and right arrow keys to navigate."
        className="space-y-3"
        onKeyDown={handleListaKeyDown}
        tabIndex={0}
      >
        {itens.map((item, indice) => (
          <SlideCard
            key={item.id}
            id={item.id}
            indice={indice}
            total={itens.length}
            texto={item.texto}
            atual={indice === atual}
            podeRemover={itens.length > MIN_SLIDES}
            onChange={(texto) =>
              alterarTexto(indice, texto)
            }
            onMover={(direcao) =>
              moverSlide(indice, direcao)
            }
            onRemover={() =>
              removerSlide(indice)
            }
            onFocar={() => {
              setAtual(indice);
            }}
            onNavegar={(direcao) =>
              navegarSlide(indice, direcao)
            }
          />
        ))}
      </ol>

      {itens.length === 0 && (
        <p className="text-sm text-text-secondary">
          No slides loaded. Add a slide to get started.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={adicionarSlide}
          disabled={itens.length >= MAX_SLIDES}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border
            bg-bg-elevated text-text-primary hover:border-flowity-purple
            disabled:text-text-secondary disabled:opacity-60 disabled:cursor-not-allowed ${FOCO}`}
        >
          <Plus size={14} aria-hidden="true" />
          Add slide
        </button>

        <button
          type="button"
          onClick={gerar}
          disabled={!postIdValido || Boolean(bloqueio) || gerando}
          aria-busy={gerando ? "true" : undefined}
          aria-describedby={
            bloqueio ? "gerar-bloqueio" : undefined
          }
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
            bg-flowity-purple text-bg-base hover:bg-flowity-purple-hover
            disabled:bg-bg-elevated disabled:text-text-secondary disabled:border disabled:border-border
            disabled:cursor-not-allowed ${FOCO}`}
        >
          <Layers size={14} aria-hidden="true" />

          {gerando
            ? "Generating carousel..."
            : "Generate carousel"}
        </button>

        {itens.length >= MAX_SLIDES && (
          <span className="text-xs text-text-secondary">
            Limit of {MAX_SLIDES} slides reached.
          </span>
        )}
      </div>

      {!postIdValido && !erro && (
        <p role="alert" className="text-sm text-amber-300">
          Select a post in the Pipeline before generating the carousel.
        </p>
      )}

      {bloqueio && (
        <p
          id="gerar-bloqueio"
          className="text-sm text-amber-300"
        >
          To generate: {bloqueio}
        </p>
      )}

      {erro && (
        <p
          role="alert"
          className="text-sm text-red-300 font-medium"
        >
          Error: {erro}
        </p>
      )}

      {/* Announcement for screen readers */}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {itens.length > 0
          ? `Slide ${atual + 1} of ${itens.length}. ${aviso}`
          : aviso || "No slides loaded."}
      </p>

      {/* Messages visible to the user */}
      {aviso && (
        <p
          aria-hidden="true"
          className="text-sm text-emerald-300"
        >
          {aviso}
        </p>
      )}
    </section>
  );
}