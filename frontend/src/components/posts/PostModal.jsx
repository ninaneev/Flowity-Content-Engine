import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import SelectField from "../shared/SelectField";

const STATUSES = ["idea", "draft", "revised", "scheduled", "publishing", "published", "failed"];
const STATUS_LABELS = {
  idea: "Idea",
  draft: "Draft",
  revised: "Revised",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
};
const STATUS_HELP = {
  idea: "Initial idea without final copy.",
  draft: "Draft created by Generator or manually.",
  revised: "Approved by human review; ready to schedule.",
  scheduled: "Cleared for n8n to publish on the selected date.",
  publishing: "Automation is publishing this post.",
  published: "Published successfully.",
  failed: "Automation reported a failure.",
};

function normalizeForApi(form) {
  return {
    ...form,
    hook: form.hook?.trim() || "New post",
    scheduled_at: form.scheduled_at || null,
    source_ids: form.source_ids || [],
  };
}

export default function PostModal({ post, onClose, onSave, mode = "edit" }) {
  const [form, setForm] = useState(post || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(post || {});
  }, [post]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(normalizeForApi(form));
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!post) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <StatusBadge status={form.status} />
            <div>
              <p className="text-sm text-text-secondary">
                {mode === "create" ? "New post" : `Post #${post.id}`}
              </p>
              <p className="text-xs text-text-muted">
                {form.channel === "linkedin" ? "LinkedIn" : "X / Twitter"}
              </p>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="card bg-bg-elevated/40">
            <h3 className="text-sm font-semibold text-text-primary mb-1">Editorial approval</h3>
            <p className="text-xs text-text-muted">
              Use <strong className="text-text-secondary">Revised</strong> for manual approval. Only use <strong className="text-text-secondary">Scheduled</strong> when the content and date are ready for automated publishing.
            </p>
          </div>

          <div>
            <label className="label">Hook / main title</label>
            <textarea
              className="textarea text-base font-medium"
              name="hook"
              value={form.hook || ""}
              onChange={handleChange}
              rows={2}
              placeholder="The first line that grabs attention..."
              required
            />
          </div>

          <div>
            <label className="label">Post body</label>
            <textarea
              className="textarea"
              name="body"
              value={form.body || ""}
              onChange={handleChange}
              rows={8}
              placeholder="Develop the content..."
            />
          </div>

          <div>
            <label className="label">CTA (call to action)</label>
            <input
              className="input"
              name="cta"
              value={form.cta || ""}
              onChange={handleChange}
              placeholder="Example: Comment with your take..."
            />
          </div>

          <div>
            <label className="label">X version (max 280 chars)</label>
            <input
              className="input"
              name="short_x"
              value={form.short_x || ""}
              onChange={handleChange}
              maxLength={280}
              placeholder="Compact version for X..."
            />
            <p className="text-[11px] text-text-muted mt-1">{(form.short_x || "").length}/280 characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <SelectField
                name="status"
                value={form.status || "draft"}
                onChange={handleChange}
                options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              />
              <p className="text-[11px] text-text-muted mt-1">{STATUS_HELP[form.status] || STATUS_HELP.draft}</p>
            </div>
            <div>
              <label className="label">Channel</label>
              <SelectField
                name="channel"
                value={form.channel || "linkedin"}
                onChange={handleChange}
                options={[
                  { value: "linkedin", label: "LinkedIn" },
                  { value: "x",        label: "X (Twitter)" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Schedule</label>
              <input
                className="input"
                type="datetime-local"
                name="scheduled_at"
                value={form.scheduled_at ? form.scheduled_at.slice(0, 16) : ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Creation mode</label>
              <input
                className="input"
                name="generation_mode"
                value={form.generation_mode || "manual"}
                onChange={handleChange}
                placeholder="manual, template, or ollama"
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="textarea"
              name="notes"
              value={form.notes || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Internal notes, failure reason, or approval context..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : mode === "create" ? "Create post" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
