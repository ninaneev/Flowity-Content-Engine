import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import AlertBanner from "./AlertBanner";

// Fake test data.
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
  it("lists alerts in a role=status block with text and icon", async () => {
    render(<AlertBanner />);
    const item = await screen.findByText(/Below threshold — 1\.1% \(threshold: 2%\)/);
    const bloco = screen.getByRole("status");
    expect(bloco).toContainElement(item);
    // Icon present (decorative) next to the text: the alert does not rely on color alone.
    const li = item.closest("li");
    expect(li.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    expect(within(bloco).getByText(/1 post below the engagement threshold/)).toBeInTheDocument();
  });

  it("has no accessibility violations in axe", async () => {
    const { container } = render(<AlertBanner />);
    await screen.findByText(/Below threshold/);
    const resultado = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(resultado.violations).toHaveLength(0);
  });
});
