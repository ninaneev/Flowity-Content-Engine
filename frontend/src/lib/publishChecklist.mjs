/**
 * LinkedIn carousel publish checklist (Task 12).
 * Computed from the post's real data, its images and the generated carousel.
 * No React, so it can be tested with `node --test`.
 */
import { MAX_SLIDES, MIN_SLIDES } from "./carouselSlides.mjs";
import { ALT_MIN, tamanhoAlt } from "./imageUpload.mjs";

/** Text for the LinkedIn caption field: hook, body and CTA separated by a blank line. */
export function montarLegenda(post) {
  return [post?.hook, post?.body, post?.cta]
    .map((parte) => String(parte || "").trim())
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Returns the checklist items, each with `pronto` (boolean) and a text `detalhe`.
 * - `totalSlides`: slides in the generated carousel
 * - `imagens`: all the post's images (photos and slides), each with `alt_text`
 * - `pdfBaixado`: the PDF has already been saved in this session
 */
export function montarChecklist({ post, totalSlides = 0, imagens = [], pdfBaixado = false }) {
  const semAlt = imagens.filter((img) => tamanhoAlt(img?.alt_text) < ALT_MIN).length;
  const faltando = ["hook", "body", "cta"].filter((campo) => !String(post?.[campo] || "").trim());
  const quantidadeOk = totalSlides >= MIN_SLIDES && totalSlides <= MAX_SLIDES;

  return [
    {
      id: "quantidade",
      rotulo: `The carousel has between ${MIN_SLIDES} and ${MAX_SLIDES} slides`,
      pronto: quantidadeOk,
      detalhe: `${totalSlides} slides generated.`,
    },
    {
      id: "alt",
      rotulo: `All images have alt text of ${ALT_MIN} characters or more`,
      pronto: imagens.length > 0 && semAlt === 0,
      detalhe:
        imagens.length === 0
          ? "No images found on the post."
          : semAlt === 0
            ? `${imagens.length} of ${imagens.length} images have alt text.`
            : `${semAlt} of ${imagens.length} images lack sufficient alt text.`,
    },
    {
      id: "texto",
      rotulo: "The post has a hook, body and CTA filled in",
      pronto: faltando.length === 0,
      detalhe: faltando.length === 0 ? "Hook, body and CTA are filled in." : `Still to fill in: ${faltando.join(", ")}.`,
    },
    {
      id: "pdf",
      rotulo: "The PDF has been downloaded",
      pronto: Boolean(pdfBaixado),
      detalhe: pdfBaixado ? "PDF saved on this computer." : 'Use the "Download PDF" button.',
    },
  ];
}
