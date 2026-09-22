import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import AlertBanner from "./AlertBanner";

// Dados fictícios de teste.
vi.mock("../../lib/api", () => ({
  alertsApi: {
    list: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            post_id: 7,
            hook: "Por que NPS sozinho engana",
            channel: "linkedin",
            platform: "linkedin",
            engagement_rate: 0.011,
            published_at: "2026-09-10T18:00:00",
          },
        ],
      }),
    ),
    getSettings: vi.fn(() => Promise.resolve({ data: { min_engagement_rate: 0.02 } })),
  },
}));

describe("AlertBanner", () => {
  it("lista os alertas num bloco role=status com texto e ícone", async () => {
    render(<AlertBanner />);
    const item = await screen.findByText(/Abaixo do limite — 1,1% \(limite: 2%\)/);
    const bloco = screen.getByRole("status");
    expect(bloco).toContainElement(item);
    // Ícone presente (decorativo) ao lado do texto: o alerta não depende só da cor.
    const li = item.closest("li");
    expect(li.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    expect(within(bloco).getByText(/1 post abaixo do limite/)).toBeInTheDocument();
  });

  it("não tem violações de acessibilidade no axe", async () => {
    const { container } = render(<AlertBanner />);
    await screen.findByText(/Abaixo do limite/);
    const resultado = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toHaveLength(0);
  });
});
