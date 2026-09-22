import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import AnalyticsPage from "./AnalyticsPage";

// Resposta de exemplo do GET /metrics/summary (dados fictícios de teste).
const resumoFake = {
  total_publicados: 3,
  engagement_rate: 0.025,
  total_impressoes: 2500,
  total_interacoes: 65,
  por_plataforma: [
    { platform: "linkedin", posts: 2, impressions: 2000, engagement_rate: 0.03, interacoes: 60 },
    { platform: "x", posts: 1, impressions: 500, engagement_rate: 0.01, interacoes: 5 },
  ],
  por_dia_semana: [
    { dia: 0, media: 0.01, publicacoes: 1 },
    { dia: 1, media: 0.03, publicacoes: 2 },
  ],
};

vi.mock("../lib/api", () => ({
  metricsApi: { summary: vi.fn(() => Promise.resolve({ data: resumoFake })) },
  alertsApi: {
    list: vi.fn(() => Promise.resolve({ data: [] })),
    getSettings: vi.fn(() => Promise.resolve({ data: { min_engagement_rate: 0.02 } })),
  },
}));

describe("AnalyticsPage", () => {
  it("mostra os 4 cartões preenchidos", async () => {
    render(<AnalyticsPage />);
    expect(await screen.findByText("2.500")).toBeInTheDocument();
    expect(screen.getByText("Impressões")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();
    expect(screen.getByText("2,5%")).toBeInTheDocument();
  });

  it("gráfico em SVG com title, desc e tabela equivalente", async () => {
    render(<AnalyticsPage />);
    const grafico = await screen.findByRole("img", { name: /engajamento médio por dia da semana/i });
    expect(grafico.querySelector("title")).not.toBeNull();
    expect(grafico.querySelector("desc")).not.toBeNull();

    const tabela = screen.getByRole("table", { name: /engajamento médio por dia da semana/i });
    const segunda = within(tabela).getByRole("row", { name: /segunda-feira/i });
    expect(segunda).toHaveTextContent("3,0%");
    expect(segunda).toHaveTextContent("2 publicações");
    expect(within(tabela).getByRole("row", { name: /terça-feira/i })).toHaveTextContent("sem dados");
  });

  it("compara LinkedIn e X pela taxa normalizada e mostra o número de publicações", async () => {
    render(<AnalyticsPage />);
    expect(await screen.findByText(/3,0% em 2 publicações/)).toBeInTheDocument();
    expect(screen.getByText(/1,0% em 1 publicação$/)).toBeInTheDocument();
  });

  it("não tem violações de acessibilidade no axe", async () => {
    const { container } = render(<AnalyticsPage />);
    await screen.findByText("2.500");
    // Contraste é conferido no navegador; o jsdom não calcula cores renderizadas.
    const resultado = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toHaveLength(0);
  });
});
