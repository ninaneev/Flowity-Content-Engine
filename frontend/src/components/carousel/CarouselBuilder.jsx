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
const novoItem = (texto = "") => ({ id: proximoId++, texto });

/**
 * Monta o carrossel: edita o texto de cada slide, reordena por botões,
 * adiciona e remove slides (de 3 a 10) e pede ao backend para gerar.
 */
export default function CarouselBuilder({ postId, slidesIniciais, onChange, onGerado }) {
  const [itens, setItens] = useState(() => slidesIniciais.map((t) => novoItem(t)));
  const [atual, setAtual] = useState(0);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const focoPendente = useRef(null);

  const textos = itens.map((i) => i.texto);
  const bloqueio = motivoParaNaoGerar(textos);

  useEffect(() => {
    onChange?.({ textos, atual });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens, atual]);

  // Depois de mover, adicionar ou remover, devolve o foco para um lugar previsível.
  useEffect(() => {
    const alvo = focoPendente.current;
    if (!alvo) return;
    focoPendente.current = null;
    const el = alvo.map((id) => document.getElementById(id)).find((e) => e && !e.disabled);
    el?.focus();
  }, [itens]);

  function alterarTexto(indice, texto) {
    setItens((lista) => lista.map((item, i) => (i === indice ? { ...item, texto } : item)));
  }

  function moverSlide(indice, direcao) {
    const item = itens[indice];
    const destino = indice + direcao;
    if (destino < 0 || destino >= itens.length) return;
    focoPendente.current = [
      `slide-${item.id}-${direcao < 0 ? "subir" : "descer"}`,
      `slide-${item.id}-${direcao < 0 ? "descer" : "subir"}`,
    ];
    setItens((lista) => mover(lista, indice, direcao));
    setAtual(destino);
    setAviso(`Slide movido da posição ${indice + 1} para a ${destino + 1}.`);
  }

  function adicionarSlide() {
    if (itens.length >= MAX_SLIDES) return;
    const item = novoItem("");
    // entra antes do fechamento (CTA), que continua sendo o último slide
    const posicao = Math.max(itens.length - 1, 1);
    focoPendente.current = [`slide-${item.id}-texto`];
    setItens((lista) => [...lista.slice(0, posicao), item, ...lista.slice(posicao)]);
    setAtual(posicao);
    setAviso(`Slide ${posicao + 1} adicionado. Escreva o texto dele.`);
  }

  function removerSlide(indice) {
    if (itens.length <= MIN_SLIDES) return;
    const vizinho = itens[indice + 1] || itens[indice - 1];
    focoPendente.current = [`slide-${vizinho.id}-texto`];
    setItens((lista) => lista.filter((_, i) => i !== indice));
    setAtual((a) => Math.min(a, itens.length - 2));
    setAviso(`Slide ${indice + 1} removido. O carrossel agora tem ${itens.length - 1} slides.`);
  }

  async function gerar() {
    if (bloqueio || gerando) return;
    setGerando(true);
    setErro("");
    setAviso("");
    try {
      const { data } = await postsApi.render.carousel(postId, textos.map((t) => t.trim()));
      setAviso(`Carrossel gerado com ${data?.total_slides ?? textos.length} slides.`);
      onGerado?.(data);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível gerar o carrossel. Tente de novo."));
    } finally {
      setGerando(false);
    }
  }

  return (
    <section aria-labelledby="montagem-titulo" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="montagem-titulo" className="text-base font-semibold text-text-primary">
          Slides ({itens.length} de no máximo {MAX_SLIDES})
        </h2>
        <p className="text-xs text-text-secondary">
          Mínimo {MIN_SLIDES}, máximo {MAX_SLIDES}. Use os botões para mudar a ordem.
        </p>
      </div>

      <ol aria-label="Slides do carrossel" className="space-y-3">
        {itens.map((item, indice) => (
          <SlideCard
            key={item.id}
            id={item.id}
            indice={indice}
            total={itens.length}
            texto={item.texto}
            atual={indice === atual}
            podeRemover={itens.length > MIN_SLIDES}
            onChange={(texto) => alterarTexto(indice, texto)}
            onMover={(direcao) => moverSlide(indice, direcao)}
            onRemover={() => removerSlide(indice)}
            onFocar={() => setAtual(indice)}
          />
        ))}
      </ol>

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
          disabled={Boolean(bloqueio) || gerando}
          aria-busy={gerando ? "true" : undefined}
          aria-describedby={bloqueio ? "gerar-bloqueio" : undefined}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
            bg-flowity-purple text-bg-base hover:bg-flowity-purple-hover
            disabled:bg-bg-elevated disabled:text-text-secondary disabled:border disabled:border-border
            disabled:cursor-not-allowed ${FOCO}`}
        >
          <Layers size={14} aria-hidden="true" />
          {gerando ? "Gerando carrossel..." : "Gerar carrossel"}
        </button>
        {itens.length >= MAX_SLIDES && (
          <span className="text-xs text-text-secondary">Limite de {MAX_SLIDES} slides atingido.</span>
        )}
      </div>

      {bloqueio && (
        <p id="gerar-bloqueio" className="text-sm text-amber-300">
          Para gerar: {bloqueio}
        </p>
      )}
      {erro && (
        <p role="alert" className="text-sm text-red-300 font-medium">
          Erro: {erro}
        </p>
      )}
      <p role="status" aria-live="polite" className="text-sm text-emerald-300">
        {aviso}
      </p>
    </section>
  );
}
