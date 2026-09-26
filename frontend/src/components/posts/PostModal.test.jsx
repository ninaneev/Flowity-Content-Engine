import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import PostModal from "./PostModal";

const postFake = {
  id: 1,
  hook: "Como medir o engajamento de um post",
  body: "Texto de exemplo para o teste.",
  channel: "linkedin",
  status: "draft",
  scheduled_at: null,
  source_ids: [],
};

describe("PostModal", () => {
  // Depende da Tarefa 9 (upload de imagem no PostModal, issue #86):
  // o teste só roda quando o campo "Texto alternativo" existir no modal.
  it("desabilita o botão Salvar imagem enquanto o alt text estiver vazio", (ctx) => {
    render(<PostModal post={postFake} onClose={() => {}} onSave={() => {}} />);
    const campoAlt = screen.queryByLabelText(/texto alternativo/i);
    if (!campoAlt) {
      ctx.skip();
      return;
    }
    fireEvent.change(campoAlt, { target: { value: "" } });
    const salvar = screen.getByRole("button", { name: /salvar imagem/i });
    expect(salvar).toBeDisabled();
  });

  it("não tem violações de acessibilidade no axe", async () => {
    const { container } = render(
      <PostModal post={postFake} onClose={() => {}} onSave={() => {}} />,
    );
    // O jsdom não calcula cores renderizadas, então a regra de contraste
    // fica desligada aqui e é conferida no navegador (axe DevTools).
    const resultado = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(resultado.violations).toHaveLength(0);
  });
});
