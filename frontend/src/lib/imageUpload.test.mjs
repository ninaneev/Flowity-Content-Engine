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

test("rejects types other than PNG/JPEG/GIF with a text message", () => {
  assert.equal(validarArquivo({ type: "image/gif", size: 10 }), null);
  assert.equal(validarArquivo({ type: "application/pdf", size: 10 }), "Use only PNG, JPEG or GIF.");
});

test("rejects files over 5 MB", () => {
  assert.equal(
    validarArquivo({ type: "image/png", size: MAX_BYTES + 1 }),
    "The image must be 5 MB or smaller."
  );
});

test("no file asks to choose one", () => {
  assert.equal(validarArquivo(null), "Choose an image file.");
});

test("alt text needs 10 to 300 characters, ignoring edge spaces", () => {
  assert.equal(altTextValido(""), false);
  assert.equal(altTextValido("   curto   "), false);
  assert.equal(altTextValido("a".repeat(ALT_MIN)), true);
  assert.equal(altTextValido("a".repeat(ALT_MAX)), true);
  assert.equal(altTextValido("a".repeat(ALT_MAX + 1)), false);
});

test("counter says how many characters are missing", () => {
  assert.equal(descreverContador("abc"), "3/300 characters. 7 more needed to reach the minimum of 10.");
  assert.equal(descreverContador("a".repeat(12)), "12/300 characters. Minimum of 10 reached.");
});

test("mensagemDeErro reads the backend detail", () => {
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
  assert.match(mensagemDeErro({ request: {} }), /No connection/);
  assert.equal(mensagemDeErro({}, "padrão"), "padrão");
});
