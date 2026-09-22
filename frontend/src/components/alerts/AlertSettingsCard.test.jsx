import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AlertSettingsCard from "./AlertSettingsCard";
import { alertsApi } from "../../lib/api";

vi.mock("../../lib/api", () => ({
  alertsApi: {
    getSettings: vi.fn(() => Promise.resolve({ data: { min_engagement_rate: 0.02 } })),
    updateSettings: vi.fn(() => Promise.resolve({ data: { min_engagement_rate: 0.035 } })),
  },
}));

describe("AlertSettingsCard", () => {
  it("mostra 2 por padrão, salva em fração e confirma em texto", async () => {
    render(<AlertSettingsCard />);
    const campo = screen.getByLabelText("Taxa mínima de engajamento (%)");
    expect(campo).toHaveValue(2);

    fireEvent.change(campo, { target: { value: "3.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar limite" }));

    expect(await screen.findByText(/Limite salvo: 3,5%/)).toBeInTheDocument();
    expect(alertsApi.updateSettings).toHaveBeenCalledWith({ min_engagement_rate: 0.035 });
  });
});
