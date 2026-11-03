/**
 * Validation rules for uploading a post image (Task 9).
 * No React, so they are easy to test with `node --test`.
 */

export const TIPOS = ["image/png", "image/jpeg", "image/gif"];
export const MAX_BYTES = 5 * 1024 * 1024;
export const ALT_MIN = 10;
export const ALT_MAX = 300;

/** Returns the file's error message, or null if it can be uploaded. */
export function validarArquivo(file) {
  if (!file) return "Choose an image file.";
  if (!TIPOS.includes(file.type)) return "Use only PNG, JPEG or GIF.";
  if (file.size > MAX_BYTES) return "The image must be 5 MB or smaller.";
  return null;
}

/** How many characters the alt text has, not counting leading and trailing spaces. */
export function tamanhoAlt(altText) {
  return String(altText || "").trim().length;
}

/** Is the alt text between ALT_MIN and ALT_MAX characters? */
export function altTextValido(altText) {
  const n = tamanhoAlt(altText);
  return n >= ALT_MIN && n <= ALT_MAX;
}

/** Counter sentence linked to the field by aria-describedby. */
export function descreverContador(altText) {
  const n = tamanhoAlt(altText);
  if (n < ALT_MIN) {
    const faltam = ALT_MIN - n;
    return `${n}/${ALT_MAX} characters. ${faltam} more needed to reach the minimum of ${ALT_MIN}.`;
  }
  return `${n}/${ALT_MAX} characters. Minimum of ${ALT_MIN} reached.`;
}

/** Turns the axios error into a sentence to show on screen. */
export function mensagemDeErro(erro, padrao = "Could not complete the action. Try again.") {
  const detail = erro?.response?.data?.detail;
  if (typeof detail === "string" && detail) return detail;
  if (detail && typeof detail.message === "string") return detail.message;
  // format of the 422 "acessibilidade_pendente" error from Task 6: { error: { code, message } }
  if (detail?.error && typeof detail.error.message === "string") return detail.error.message;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (erro?.request && !erro?.response) return "No connection to the server. Check that the backend is running.";
  return padrao;
}
