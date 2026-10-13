/**
 * Regras do carrossel do LinkedIn no front-end (Tarefa 10).
 * Sem React, para ficar fácil de testar com `node --test`.
 * Os limites são os mesmos do backend (carousel_renderer.py, Tarefa 8).
 */

export const MIN_SLIDES = 3;
export const MAX_SLIDES = 10;
export const MAX_CARACTERES = 220;

/** Divide o corpo do post em blocos de texto, um por slide. */
export function dividirEmSlides(body, maxCaracteres = MAX_CARACTERES) {
  const paragrafos = String(body || "").split(/\n{2,}/).map((p) => p.trim());
  return paragrafos.filter(Boolean).map((p) => p.slice(0, maxCaracteres));
}

/**
 * Monta os slides iniciais do post: capa (hook), blocos do corpo e CTA.
 * Se o corpo tiver blocos demais, junta vizinhos até caber no máximo de 10 slides,
 * como faz o `dividir_em_slides` do backend.
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

/** Troca o slide de posição com o vizinho. `direcao` é -1 (subir) ou +1 (descer). */
export function mover(slides, indice, direcao) {
  const destino = indice + direcao;
  if (destino < 0 || destino >= slides.length) return slides;
  const copia = [...slides];
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}

/** Quantidade está entre 3 e 10? */
export function quantidadeValida(total) {
  return total >= MIN_SLIDES && total <= MAX_SLIDES;
}

/**
 * Devolve o motivo que impede gerar o carrossel, ou "" se pode gerar.
 * `textos` é a lista de textos dos slides, na ordem.
 */
export function motivoParaNaoGerar(textos) {
  const total = textos.length;
  if (total < MIN_SLIDES) return `O carrossel precisa de pelo menos ${MIN_SLIDES} slides. Agora tem ${total}.`;
  if (total > MAX_SLIDES) return `O carrossel pode ter no máximo ${MAX_SLIDES} slides. Agora tem ${total}.`;
  const vazio = textos.findIndex((t) => !String(t || "").trim());
  if (vazio !== -1) return `O slide ${vazio + 1} está sem texto.`;
  return "";
}
