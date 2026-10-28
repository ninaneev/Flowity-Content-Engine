import React, { useRef } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { MAX_CARACTERES } from "../../lib/carouselSlides.mjs";

export const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan";

const BOTAO =
  `inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border
   bg-bg-elevated text-text-primary hover:border-flowity-purple
   disabled:text-text-secondary disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-border ${FOCO}`;

function papel(indice, total) {
  if (indice === 0) return "cover";
  if (indice === total - 1) return "closing";
  return "content";
}

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
  onNavegar,
}) {
  const numero = indice + 1;
  const campoId = `slide-${id}-texto`;
  const contadorId = `slide-${id}-contador`;
  const instrucaoId = `slide-${id}-instrucao`;
  const vazio = !texto.trim();

  const textareaRef = useRef(null);

  function handleKeyDown(e) {
    // Only handles shortcuts when the card itself is focused.
    // This way it does not interfere with the buttons or typing in the textarea.
    if (e.target !== e.currentTarget || e.defaultPrevented) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      textareaRef.current?.focus();
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onNavegar?.(-1);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      onNavegar?.(1);
    }
  }

  return (
    <li
      data-slide-id={id}
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${numero} of ${total}`}
      aria-current={atual ? "true" : undefined}
      aria-describedby={instrucaoId}
      tabIndex={0}
      className={`rounded-lg border p-3 bg-bg-surface transition-colors ${
        atual ? "border-flowity-purple" : "border-border"
      } ${FOCO}`}
      onFocus={onFocar}
      onKeyDown={handleKeyDown}
    >
      <p id={instrucaoId} className="sr-only">
        Press Enter or Space to edit this slide's text.
        Use the left and right arrow keys to move between slides.
      </p>

      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="font-medium text-text-primary">
            Slide {numero} of {total}
            {atual && (
              <span className="ml-2 text-xs font-medium text-flowity-purple">
                previewing
              </span>
            )}
          </h3>

          <p className="text-xs text-text-secondary">
            {papel(indice, total)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            id={`slide-${id}-subir`}
            className={BOTAO}
            onClick={() => onMover(-1)}
            disabled={indice === 0}
            aria-label={`Move slide ${numero} up`}
          >
            <ArrowUp size={14} aria-hidden="true" />
            Up
          </button>

          <button
            type="button"
            id={`slide-${id}-descer`}
            className={BOTAO}
            onClick={() => onMover(1)}
            disabled={indice === total - 1}
            aria-label={`Move slide ${numero} down`}
          >
            <ArrowDown size={14} aria-hidden="true" />
            Down
          </button>

          <button
            type="button"
            className={BOTAO}
            onClick={onRemover}
            disabled={!podeRemover}
            aria-label={`Remove slide ${numero}`}
          >
            <Trash2 size={14} aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>

      <label htmlFor={campoId} className="sr-only">
        Text of slide {numero} of {total}
      </label>

      <textarea
        ref={textareaRef}
        id={campoId}
        className="textarea"
        rows={3}
        value={texto}
        maxLength={MAX_CARACTERES}
        aria-describedby={contadorId}
        aria-invalid={vazio ? "true" : undefined}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="flex items-center justify-between mt-1">
        <span
          id={contadorId}
          className={`text-xs ${
            texto.length >= MAX_CARACTERES
              ? "text-amber-300"
              : "text-text-secondary"
          }`}
        >
          {texto.length}/{MAX_CARACTERES}
        </span>

        {vazio && (
          <span className="text-xs text-amber-300">
            Fill in this slide.
          </span>
        )}
      </div>
    </li>
  );
}
