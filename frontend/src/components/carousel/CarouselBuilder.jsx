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
 * Monta e gerencia o carrossel.
 *
 * - Edita o texto dos slides.
 * - Reordena e remove slides.
 * - Adiciona novos slides.
 * - Permite navegar pelo teclado.
 * - Anuncia alterações para leitores de tela.
 * - Preserva o foco após alterações na lista.
 * - Solicita ao backend a geração do carrossel.
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
   * Se os slides forem carregados de forma assíncrona,
   * inicializa a lista quando os dados chegarem.
   *
   * Não substitui slides que o usuário já começou a editar.
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
   * Informa ao componente pai o conteúdo e o slide atual.
   */
  useEffect(() => {
    onChange?.({
      textos,
      atual,
    });

    // onChange é uma prop externa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, atual]);

  /*
   * Restaura o foco depois que a lista é atualizada.
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
   * Mantém o índice selecionado dentro dos limites da lista.
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
   * Navega entre os slides com as setas.
   * O foco acompanha o slide selecionado.
   */
  function navegarSlide(direcao) {
    const novoIndice = Math.max(0, Math.min(atual + direcao, itens.length - 1));
    setAtual(novoIndice); 
    // leva o foco para o cartao do novo slide
    const cartao = document.querySelector(`[data-slide-id="${itens[novoIndice].id}"]`);
    cartao?.focus();
  }
  /*
   * Reordena os slides e devolve o foco a um controle
   * pertencente ao slide movido.
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
      `Slide movido da posição ${indice + 1} para a posição ${
        destino + 1
      }.`
    );
  }

  /*
   * Adiciona um slide antes do último slide,
   * preservando o fechamento/CTA no final.
   */
  function adicionarSlide() {
    if (itens.length >= MAX_SLIDES) {
      setAviso(`Limite de ${MAX_SLIDES} slides atingido.`);
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
      `Slide ${posicao + 1} adicionado. Escreva o texto dele.`
    );
  }

  /*
   * Remove um slide e transfere o foco para um vizinho.
   */
  function removerSlide(indice) {
    if (itens.length <= MIN_SLIDES) {
      setAviso(
        `O carrossel precisa ter pelo menos ${MIN_SLIDES} slides.`
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
      `Slide ${indice + 1} removido. O carrossel agora tem ${novoTotal} slides.`
    );
  }

  /*
   * Envia os textos para o backend gerar o carrossel.
   */
  async function gerar() {
    if (!postIdValido) {
      setErro("Não foi possível identificar a publicação. Volte ao Pipeline e abra o carrossel a partir de um post.");
      return;
    }

    if (bloqueio || gerando) {
      return;
    }

    setGerando(true);
    setErro("");
    setAviso("Gerando carrossel. Aguarde.");

    try {
      const { data } = await postsApi.render.carousel(
        postId,
        textos.map((texto) => texto.trim())
      );

      setAviso(
        `Carrossel gerado com ${
          data?.total_slides ?? textos.length
        } slides.`
      );

      onGerado?.(data);
    } catch (err) {
      setErro(
        mensagemDeErro(
          err,
          "Não foi possível gerar o carrossel. Tente de novo."
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
          Slides ({itens.length} de no máximo {MAX_SLIDES})
        </h2>

        <p className="text-xs text-text-secondary">
          Mínimo {MIN_SLIDES}, máximo {MAX_SLIDES}.
          Use os botões para mudar a ordem.
        </p>
      </div>

      <ol
        aria-label="Slides do carrossel"
        className="space-y-3"
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
          Nenhum slide foi carregado. Adicione um slide para começar.
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
          Adicionar slide
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
            ? "Gerando carrossel..."
            : "Gerar carrossel"}
        </button>

        {itens.length >= MAX_SLIDES && (
          <span className="text-xs text-text-secondary">
            Limite de {MAX_SLIDES} slides atingido.
          </span>
        )}
      </div>

      {!postIdValido && !erro && (
        <p role="alert" className="text-sm text-amber-300">
          Selecione uma publicação no Pipeline antes de gerar o carrossel.
        </p>
      )}

      {bloqueio && (
        <p
          id="gerar-bloqueio"
          className="text-sm text-amber-300"
        >
          Para gerar: {bloqueio}
        </p>
      )}

      {erro && (
        <p
          role="alert"
          className="text-sm text-red-300 font-medium"
        >
          Erro: {erro}
        </p>
      )}

      {/* Anúncio para leitores de tela */}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {itens.length > 0
          ? `Slide ${atual + 1} de ${itens.length}. ${aviso}`
          : aviso || "Nenhum slide carregado."}
      </p>

      {/* Mensagens visíveis para o usuário */}
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