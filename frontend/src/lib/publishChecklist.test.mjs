import assert from "node:assert/strict";
import test from "node:test";
import { montarChecklist, montarLegenda } from "./publishChecklist.mjs";

const post = { hook: "Capa", body: "Corpo do post.", cta: "Comente." };
const alt = (n) => ({ alt_text: "x".repeat(n) });

test("montarLegenda joins hook, body and CTA with a blank line", () => {
  assert.equal(montarLegenda(post), "Capa\n\nCorpo do post.\n\nComente.");
  assert.equal(montarLegenda({ hook: "Só hook" }), "Só hook");
});

test("all ready when the real data matches", () => {
  const itens = montarChecklist({ post, totalSlides: 7, imagens: [alt(40), alt(10)], pdfBaixado: true });
  assert.deepEqual(itens.map((i) => i.pronto), [true, true, true, true]);
  assert.equal(itens[1].detalhe, "2 of 2 images have alt text.");
});

test("points out what is missing, in text", () => {
  const itens = montarChecklist({
    post: { hook: "Capa", body: "", cta: " " },
    totalSlides: 2,
    imagens: [alt(40), alt(5)],
    pdfBaixado: false,
  });
  assert.deepEqual(itens.map((i) => i.pronto), [false, false, false, false]);
  assert.equal(itens[1].detalhe, "1 of 2 images lack sufficient alt text.");
  assert.equal(itens[2].detalhe, "Still to fill in: body, cta.");
});

test("without images the alt text item is not ready", () => {
  const [, itemAlt] = montarChecklist({ post, totalSlides: 5, imagens: [] });
  assert.equal(itemAlt.pronto, false);
});
