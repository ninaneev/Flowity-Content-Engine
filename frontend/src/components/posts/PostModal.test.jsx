import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import { MemoryRouter } from "react-router-dom";
import PostModal from "./PostModal";

// O modal tem um <Link> para o carrossel (T10), então precisa de um Router.
function renderModal() {
  return render(
    <MemoryRouter>
      <PostModal post={postFake} onClose={() => {}} onSave={() => {}} />
    </MemoryRouter>,
  );
}

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
    renderModal();
    const campoAlt = screen.queryByLabelText(/texto alternativo/i);
    if (!campoAlt) {
      ctx.skip();
      return;
    }
    fireEvent.change(campoAlt, { target: { value: "" } });
    const salvar = screen.getByRole("button", { name: /salvar imagem/i });
    expect(salvar).toBeDisabled();
  });

  it("Remove date limpa a data num clique e mostra o pilar", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <PostModal
          post={{ ...postFake, pillar: "proof", scheduled_at: "2026-11-02T14:00:00Z" }}
          onClose={() => {}}
          onSave={onSave}
        />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("Pillar")).toHaveValue("proof");
    fireEvent.click(screen.getByRole("button", { name: "Remove date" }));
    expect(onSave).toHaveBeenCalledWith({ scheduled_at: null });
    await screen.findByText(/Date removed/);
    expect(screen.getByLabelText("Schedule")).toHaveValue("");
  });

  it("não tem violações de acessibilidade no axe", async () => {
    const { container } = renderModal();
    // O jsdom não calcula cores renderizadas, então a regra de contraste
    // fica desligada aqui e é conferida no navegador (axe DevTools).
    const resultado = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(resultado.violations).toHaveLength(0);
  });
});
