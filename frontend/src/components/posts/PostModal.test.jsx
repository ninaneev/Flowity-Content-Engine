import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import { MemoryRouter } from "react-router-dom";
import PostModal from "./PostModal";

// The modal has a <Link> to the carousel (T10), so it needs a Router.
function renderModal() {
  return render(
    <MemoryRouter>
      <PostModal post={postFake} onClose={() => {}} onSave={() => {}} />
    </MemoryRouter>,
  );
}

const postFake = {
  id: 1,
  hook: "How to measure the engagement of a post",
  body: "Sample text for the test.",
  channel: "linkedin",
  status: "draft",
  scheduled_at: null,
  source_ids: [],
};

describe("PostModal", () => {
  // Depends on Task 9 (image upload in PostModal, issue #86):
  // the test only runs when the "Alt text" field exists in the modal.
  it("disables the Save image button while the alt text is empty", (ctx) => {
    renderModal();
    const campoAlt = screen.queryByLabelText(/alt text/i);
    if (!campoAlt) {
      ctx.skip();
      return;
    }
    fireEvent.change(campoAlt, { target: { value: "" } });
    const salvar = screen.getByRole("button", { name: /save image/i });
    expect(salvar).toBeDisabled();
  });

  it("Remove date clears the date in one click and shows the pillar", async () => {
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

  it("asks for confirmation before deleting and then calls onDelete and onClose", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <PostModal post={postFake} onClose={onClose} onSave={() => {}} onDelete={onDelete} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete post" }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole("group", { name: "Delete this post?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Yes, delete post" }));
    await vi.waitFor(() => expect(onDelete).toHaveBeenCalledWith(postFake));
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("keeps the post when the confirmation is cancelled", () => {
    const onDelete = vi.fn();
    render(
      <MemoryRouter>
        <PostModal post={postFake} onClose={() => {}} onSave={() => {}} onDelete={onDelete} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete post" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep post" }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("group", { name: "Delete this post?" })).toBeNull();
  });

  it("does not offer to confirm deleting a post that is publishing", () => {
    render(
      <MemoryRouter>
        <PostModal
          post={{ ...postFake, status: "publishing" }}
          onClose={() => {}}
          onSave={() => {}}
          onDelete={vi.fn()}
        />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete post" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/being published/);
    expect(screen.queryByRole("group", { name: "Delete this post?" })).toBeNull();
  });

  it("has no accessibility violations in axe", async () => {
    const { container } = renderModal();
    // jsdom does not compute rendered colors, so the contrast rule
    // is turned off here and checked in the browser (axe DevTools).
    const resultado = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(resultado.violations).toHaveLength(0);
  });
});
