import assert from "node:assert/strict";
import test from "node:test";
import {
  ALT_MAX,
  ALT_MIN,
  MAX_BYTES,
  altTextValido,
  descreverContador,
  mensagemDeErro,
  validarArquivo,
} from "./imageUpload.mjs";

test("aceita PNG e JPEG dentro do limite", () => {
  assert.equal(validarArquivo({ type: "image/png", size: 1000 }), null);
  assert.equal(validarArquivo({ type: "image/jpeg", size: MAX_BYTES }), null);
});

test("recusa tipo fora de PNG/JPEG com mensagem em texto", () => {
  assert.equal(validarArquivo({ type: "image/gif", size: 10 }), "Use apenas PNG ou JPEG.");
  assert.equal(validarArquivo({ type: "application/pdf", size: 10 }), "Use apenas PNG ou JPEG.");
});

test("recusa arquivo acima de 5 MB", () => {
  assert.equal(
    validarArquivo({ type: "image/png", size: MAX_BYTES + 1 }),
    "A imagem precisa ter no máximo 5 MB."
  );
});

test("sem arquivo pede para escolher um", () => {
  assert.equal(validarArquivo(null), "Escolha um arquivo de imagem.");
});

test("alt text exige de 10 a 300 caracteres, sem contar espaços nas pontas", () => {
  assert.equal(altTextValido(""), false);
  assert.equal(altTextValido("   curto   "), false);
  assert.equal(altTextValido("a".repeat(ALT_MIN)), true);
  assert.equal(altTextValido("a".repeat(ALT_MAX)), true);
  assert.equal(altTextValido("a".repeat(ALT_MAX + 1)), false);
});

test("contador diz quantos caracteres faltam", () => {
  assert.equal(descreverContador("abc"), "3/300 caracteres. Faltam 7 para o mínimo de 10.");
  assert.equal(descreverContador("a".repeat(12)), "12/300 caracteres. Mínimo de 10 atingido.");
});

test("mensagemDeErro lê o detail do backend", () => {
  assert.equal(
    mensagemDeErro({ response: { data: { detail: { code: "X", message: "Formato não suportado" } } } }),
    "Formato não suportado"
  );
  assert.equal(mensagemDeErro({ response: { data: { detail: "Post não encontrado" } } }), "Post não encontrado");
  assert.equal(
    mensagemDeErro({
      response: {
        data: {
          detail: {
            error: { code: "acessibilidade_pendente", message: "1 imagem(ns) sem texto alternativo válido." },
          },
        },
      },
    }),
    "1 imagem(ns) sem texto alternativo válido."
  );
  assert.match(mensagemDeErro({ request: {} }), /Sem conexão/);
  assert.equal(mensagemDeErro({}, "padrão"), "padrão");
});
