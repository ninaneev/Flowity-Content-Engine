import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_SLIDES,
  dividirEmSlides,
  motivoParaNaoGerar,
  mover,
  quantidadeValida,
  slidesDoPost,
} from "./carouselSlides.mjs";

test("dividirEmSlides separa por parágrafo e ignora vazios", () => {
  assert.deepEqual(dividirEmSlides("Um.\n\nDois.\n\n\n\nTrês."), ["Um.", "Dois.", "Três."]);
  assert.deepEqual(dividirEmSlides(""), []);
  assert.deepEqual(dividirEmSlides(null), []);
});

test("dividirEmSlides corta cada bloco no máximo de caracteres", () => {
  const [slide] = dividirEmSlides("a".repeat(300));
  assert.equal(slide.length, 220);
  assert.equal(dividirEmSlides("abcdef", 3)[0], "abc");
});

test("slidesDoPost monta capa, corpo e CTA", () => {
  const slides = slidesDoPost({ hook: "Capa", body: "A.\n\nB.", cta: "Comente." });
  assert.deepEqual(slides, ["Capa", "A.", "B.", "Comente."]);
});

test("slidesDoPost junta blocos para não passar de 10 slides", () => {
  const body = Array.from({ length: 20 }, (_, i) => `Bloco ${i + 1}.`).join("\n\n");
  const slides = slidesDoPost({ hook: "Capa", body, cta: "CTA" });
  assert.ok(slides.length <= MAX_SLIDES);
  assert.equal(slides[0], "Capa");
  assert.equal(slides.at(-1), "CTA");
  assert.match(slides[1], /^Bloco 1\. Bloco 2\. Bloco 3\./);
});

test("mover troca com o vizinho e respeita as pontas", () => {
  assert.deepEqual(mover(["a", "b", "c"], 0, 1), ["b", "a", "c"]);
  assert.deepEqual(mover(["a", "b", "c"], 2, -1), ["a", "c", "b"]);
  const original = ["a", "b"];
  assert.equal(mover(original, 0, -1), original);
  assert.equal(mover(original, 1, 1), original);
});

test("quantidade válida vai de 3 a 10", () => {
  assert.equal(quantidadeValida(2), false);
  assert.equal(quantidadeValida(3), true);
  assert.equal(quantidadeValida(10), true);
  assert.equal(quantidadeValida(11), false);
});

test("motivoParaNaoGerar explica o bloqueio em texto", () => {
  assert.match(motivoParaNaoGerar(["a", "b"]), /pelo menos 3/);
  assert.match(motivoParaNaoGerar(Array(11).fill("x")), /no máximo 10/);
  assert.equal(motivoParaNaoGerar(["a", " ", "c"]), "O slide 2 está sem texto.");
  assert.equal(motivoParaNaoGerar(["a", "b", "c"]), "");
});
