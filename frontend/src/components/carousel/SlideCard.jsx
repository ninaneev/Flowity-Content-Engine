import React from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { MAX_CARACTERES } from "../../lib/carouselSlides.mjs";

export const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan";

const BOTAO =
  `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border
   bg-bg-elevated text-text-primary hover:border-flowity-purple
   disabled:text-text-secondary disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-border ${FOCO}`;

/** Nome curto do papel do slide, mostrado junto do número. */
function papel(indice, total) {
  if (indice === 0) return "capa";
  if (indice === total - 1) return "fechamento";
  return "conteúdo";
}

/**
 * Um slide do carrossel: número, texto editável e botões de ordem.
 * A reordenação é por botões (<button> de verdade), sem drag-and-drop.
 */
export default function SlideCard({
  id,
  indice,
  total,
  texto,
  atual,
  podeRemover,
  onChange,
  onMover,
  onRemover,
  onFocar,
}) {
  const numero = indice + 1;
  const campoId = `slide-${id}-texto`;
  const contadorId = `slide-${id}-contador`;
  const vazio = !texto.trim();

  return (
    <li
      data-slide-id={id}
      aria-current={atual ? "true" : undefined}
      className={`rounded-lg border p-3 bg-bg-surface transition-colors ${
        atual ? "border-flowity-purple" : "border-border"
      }`}
      onFocus={onFocar}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-text-primary">
          Slide {numero} de {total}
          <span className="ml-2 text-xs font-normal text-text-secondary">({papel(indice, total)})</span>
          {atual && <span className="ml-2 text-xs font-medium text-flowity-purple">em pré-visualização</span>}
        </h3>
      </div>

      <label htmlFor={campoId} className="sr-only">
        Texto do slide {numero} de {total}
      </label>
      <textarea
        id={campoId}
        className="textarea"
        rows={3}
        value={texto}
        maxLength={MAX_CARACTERES}
        aria-describedby={contadorId}
        aria-invalid={vazio ? "true" : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      <p id={contadorId} className={`text-xs mt-1 ${vazio ? "text-amber-300" : "text-text-secondary"}`}>
        {vazio ? "Slide sem texto. " : ""}
        {texto.length}/{MAX_CARACTERES} caracteres
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        <button
          type="button"
          id={`slide-${id}-subir`}
          className={BOTAO}
          disabled={indice === 0}
          onClick={() => onMover(-1)}
        >
          <ArrowUp size={14} aria-hidden="true" />
          Mover para cima<span className="sr-only"> o slide {numero}</span>
        </button>
        <button
          type="button"
          id={`slide-${id}-descer`}
          className={BOTAO}
          disabled={indice === total - 1}
          onClick={() => onMover(1)}
        >
          <ArrowDown size={14} aria-hidden="true" />
          Mover para baixo<span className="sr-only"> o slide {numero}</span>
        </button>
        <button type="button" className={`${BOTAO} ml-auto`} disabled={!podeRemover} onClick={onRemover}>
          <Trash2 size={14} aria-hidden="true" />
          Remover slide<span className="sr-only"> {numero}</span>
        </button>
      </div>
    </li>
  );
}
