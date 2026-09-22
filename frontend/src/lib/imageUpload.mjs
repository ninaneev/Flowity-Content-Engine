/**
 * Regras de validação do envio de imagem do post (Tarefa 9).
 * Sem React, para ser fácil de testar com `node --test`.
 */

export const TIPOS = ["image/png", "image/jpeg"];
export const MAX_BYTES = 5 * 1024 * 1024;
export const ALT_MIN = 10;
export const ALT_MAX = 300;

/** Devolve a mensagem de erro do arquivo, ou null se ele pode ser enviado. */
export function validarArquivo(file) {
  if (!file) return "Escolha um arquivo de imagem.";
  if (!TIPOS.includes(file.type)) return "Use apenas PNG ou JPEG.";
  if (file.size > MAX_BYTES) return "A imagem precisa ter no máximo 5 MB.";
  return null;
}

/** Quantos caracteres o texto alternativo tem, sem contar espaços nas pontas. */
export function tamanhoAlt(altText) {
  return String(altText || "").trim().length;
}

/** O texto alternativo tem entre ALT_MIN e ALT_MAX caracteres? */
export function altTextValido(altText) {
  const n = tamanhoAlt(altText);
  return n >= ALT_MIN && n <= ALT_MAX;
}

/** Frase do contador ligada ao campo por aria-describedby. */
export function descreverContador(altText) {
  const n = tamanhoAlt(altText);
  if (n < ALT_MIN) {
    const faltam = ALT_MIN - n;
    return `${n}/${ALT_MAX} caracteres. Faltam ${faltam} para o mínimo de ${ALT_MIN}.`;
  }
  return `${n}/${ALT_MAX} caracteres. Mínimo de ${ALT_MIN} atingido.`;
}

/** Transforma o erro do axios numa frase para mostrar na tela. */
export function mensagemDeErro(erro, padrao = "Não foi possível concluir a ação. Tente de novo.") {
  const detail = erro?.response?.data?.detail;
  if (typeof detail === "string" && detail) return detail;
  if (detail && typeof detail.message === "string") return detail.message;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (erro?.request && !erro?.response) return "Sem conexão com o servidor. Confira se o backend está rodando.";
  return padrao;
}
