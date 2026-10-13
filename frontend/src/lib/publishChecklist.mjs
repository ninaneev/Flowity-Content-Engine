/**
 * Checklist de publicação do carrossel no LinkedIn (Tarefa 12).
 * Calculada a partir dos dados reais do post, das imagens e do carrossel gerado.
 * Sem React, para ser testada com `node --test`.
 */
import { MAX_SLIDES, MIN_SLIDES } from "./carouselSlides.mjs";
import { ALT_MIN, tamanhoAlt } from "./imageUpload.mjs";

/** Texto que vai no campo de legenda do LinkedIn: hook, corpo e CTA separados por linha em branco. */
export function montarLegenda(post) {
  return [post?.hook, post?.body, post?.cta]
    .map((parte) => String(parte || "").trim())
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Devolve os itens da checklist, cada um com `pronto` (boolean) e um `detalhe` em texto.
 * - `totalSlides`: slides do carrossel gerado
 * - `imagens`: todas as imagens do post (fotos e slides), cada uma com `alt_text`
 * - `pdfBaixado`: o PDF já foi salvo nesta sessão
 */
export function montarChecklist({ post, totalSlides = 0, imagens = [], pdfBaixado = false }) {
  const semAlt = imagens.filter((img) => tamanhoAlt(img?.alt_text) < ALT_MIN).length;
  const faltando = ["hook", "body", "cta"].filter((campo) => !String(post?.[campo] || "").trim());
  const quantidadeOk = totalSlides >= MIN_SLIDES && totalSlides <= MAX_SLIDES;

  return [
    {
      id: "quantidade",
      rotulo: `O carrossel tem entre ${MIN_SLIDES} e ${MAX_SLIDES} slides`,
      pronto: quantidadeOk,
      detalhe: `${totalSlides} slides gerados.`,
    },
    {
      id: "alt",
      rotulo: `Todas as imagens têm texto alternativo com ${ALT_MIN} caracteres ou mais`,
      pronto: imagens.length > 0 && semAlt === 0,
      detalhe:
        imagens.length === 0
          ? "Nenhuma imagem encontrada no post."
          : semAlt === 0
            ? `${imagens.length} de ${imagens.length} imagens com texto alternativo.`
            : `${semAlt} de ${imagens.length} imagens sem texto alternativo suficiente.`,
    },
    {
      id: "texto",
      rotulo: "O post tem hook, corpo e CTA preenchidos",
      pronto: faltando.length === 0,
      detalhe: faltando.length === 0 ? "Hook, corpo e CTA preenchidos." : `Falta preencher: ${faltando.join(", ")}.`,
    },
    {
      id: "pdf",
      rotulo: "O PDF já foi baixado",
      pronto: Boolean(pdfBaixado),
      detalhe: pdfBaixado ? "PDF salvo neste computador." : 'Use o botão "Baixar PDF".',
    },
  ];
}
