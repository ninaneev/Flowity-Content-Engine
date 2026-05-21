import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

const STATUSES = ["idea", "draft", "revised", "scheduled", "published", "failed"];

export default function PostModal({ post, onClose, onSave }) {
  const [form, setForm] = useState(post || {});
  const [saving, setSaving] = useState(false);

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
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  }

  if (!post) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <StatusBadge status={form.status} />
            <span className="text-text-muted text-sm">
              {form.channel === "linkedin" ? "LinkedIn" : "X"}
            </span>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Hook */}
          <div>
            <label className="label">Hook / Título principal</label>
            <textarea
              className="textarea text-base font-medium"
              name="hook"
              value={form.hook || ""}
              onChange={handleChange}
              rows={2}
              placeholder="A primeira linha que vai prender a atenção..."
            />
          </div>

          {/* Body */}
          <div>
            <label className="label">Corpo do post</label>
            <textarea
              className="textarea"
              name="body"
              value={form.body || ""}
              onChange={handleChange}
              rows={8}
              placeholder="Desenvolvimento do conteúdo..."
            />
          </div>

          {/* CTA */}
          <div>
            <label className="label">CTA (Call to Action)</label>
            <input
              className="input"
              name="cta"
              value={form.cta || ""}
              onChange={handleChange}
              placeholder="Ex: Comenta aqui o que você acha..."
            />
          </div>

          {/* Short X */}
          <div>
            <label className="label">Versão para X (máx 280 chars)</label>
            <input
              className="input"
              name="short_x"
              value={form.short_x || ""}
              onChange={handleChange}
              maxLength={280}
              placeholder="Versão compacta para o X..."
            />
          </div>

          {/* Status + Channel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                className="select"
                name="status"
                value={form.status || "draft"}
                onChange={handleChange}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Canal</label>
              <select
                className="select"
                name="channel"
                value={form.channel || "linkedin"}
                onChange={handleChange}
              >
                <option value="linkedin">LinkedIn</option>
                <option value="x">X (Twitter)</option>
              </select>
            </div>
          </div>

          {/* Scheduled At */}
          <div>
            <label className="label">Agendamento</label>
            <input
              className="input"
              type="datetime-local"
              name="scheduled_at"
              value={form.scheduled_at ? form.scheduled_at.slice(0, 16) : ""}
              onChange={handleChange}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Observações</label>
            <textarea
              className="textarea"
              name="notes"
              value={form.notes || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Anotações internas..."
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
