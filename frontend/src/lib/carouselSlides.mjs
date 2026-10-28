/**
 * LinkedIn carousel rules on the front end (Task 10).
 * No React, so they are easy to test with `node --test`.
 * The limits match the backend (carousel_renderer.py, Task 8).
 */

export const MIN_SLIDES = 3;
export const MAX_SLIDES = 10;
export const MAX_CARACTERES = 220;

/** Splits the post body into text blocks, one per slide. */
export function dividirEmSlides(body, maxCaracteres = MAX_CARACTERES) {
  const paragrafos = String(body || "").split(/\n{2,}/).map((p) => p.trim());
  return paragrafos.filter(Boolean).map((p) => p.slice(0, maxCaracteres));
}

/**
 * Builds the post's initial slides: cover (hook), body blocks and CTA.
 * If the body has too many blocks, it merges neighbours until it fits in 10 slides,
 * like the backend's `dividir_em_slides`.
 */
export function slidesDoPost(post, maxCaracteres = MAX_CARACTERES) {
  const hook = String(post?.hook || "").trim();
  const cta = String(post?.cta || "").trim();
  const fixos = (hook ? 1 : 0) + (cta ? 1 : 0);
  const cabem = MAX_SLIDES - fixos;

  let blocos = dividirEmSlides(post?.body, Infinity);
  if (blocos.length > cabem) {
    const passo = Math.ceil(blocos.length / cabem);
    const juntos = [];
    for (let i = 0; i < blocos.length; i += passo) juntos.push(blocos.slice(i, i + passo).join(" "));
    blocos = juntos;
  }

  const slides = [];
  if (hook) slides.push(hook);
  slides.push(...blocos);
  if (cta) slides.push(cta);
  return slides.map((s) => s.slice(0, maxCaracteres));
}

/** Swaps the slide with its neighbour. `direcao` is -1 (up) or +1 (down). */
export function mover(slides, indice, direcao) {
  const destino = indice + direcao;
  if (destino < 0 || destino >= slides.length) return slides;
  const copia = [...slides];
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}

/** Is the count between 3 and 10? */
export function quantidadeValida(total) {
  return total >= MIN_SLIDES && total <= MAX_SLIDES;
}

/**
 * Returns the reason the carousel cannot be generated, or "" if it can.
 * `textos` is the list of slide texts, in order.
 */
export function motivoParaNaoGerar(textos) {
  const total = textos?.length;
  if (total < MIN_SLIDES) return `The carousel needs at least ${MIN_SLIDES} slides. It has ${total} now.`;
  if (total > MAX_SLIDES) return `The carousel can have at most ${MAX_SLIDES} slides. It has ${total} now.`;
  const vazio = textos?.findIndex((t) => !String(t || "").trim());
  if (vazio !== -1) return `Slide ${vazio + 1} has no text.`;
  return "";
}
