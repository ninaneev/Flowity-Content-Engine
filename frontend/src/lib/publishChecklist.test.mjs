import assert from "node:assert/strict";
import test from "node:test";
import { montarChecklist, montarLegenda } from "./publishChecklist.mjs";

const post = { hook: "Capa", body: "Corpo do post.", cta: "Comente." };
const alt = (n) => ({ alt_text: "x".repeat(n) });

test("montarLegenda junta hook, corpo e CTA com linha em branco", () => {
  assert.equal(montarLegenda(post), "Capa\n\nCorpo do post.\n\nComente.");
  assert.equal(montarLegenda({ hook: "Só hook" }), "Só hook");
});

test("tudo pronto quando os dados reais batem", () => {
  const itens = montarChecklist({ post, totalSlides: 7, imagens: [alt(40), alt(10)], pdfBaixado: true });
  assert.deepEqual(itens.map((i) => i.pronto), [true, true, true, true]);
  assert.equal(itens[1].detalhe, "2 de 2 imagens com texto alternativo.");
});

test("aponta o que falta, com texto", () => {
  const itens = montarChecklist({
    post: { hook: "Capa", body: "", cta: " " },
    totalSlides: 2,
    imagens: [alt(40), alt(5)],
    pdfBaixado: false,
  });
  assert.deepEqual(itens.map((i) => i.pronto), [false, false, false, false]);
  assert.equal(itens[1].detalhe, "1 de 2 imagens sem texto alternativo suficiente.");
  assert.equal(itens[2].detalhe, "Falta preencher: body, cta.");
});

test("sem imagens o item de alt text não fica pronto", () => {
  const [, itemAlt] = montarChecklist({ post, totalSlides: 5, imagens: [] });
  assert.equal(itemAlt.pronto, false);
});
