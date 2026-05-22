import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

const STATUSES = ["idea", "draft", "revised", "scheduled", "publishing", "published", "failed"];
const STATUS_HELP = {
  idea: "Ideia inicial ainda sem redação final.",
  draft: "Rascunho criado pelo Generator ou manualmente.",
  revised: "Aprovado por revisão humana; pronto para ser agendado.",
  scheduled: "Liberado para o n8n publicar na data definida.",
  publishing: "Publicação em andamento pela automação.",
  published: "Publicado com sucesso.",
  failed: "Falha registrada pela automação.",
};

function normalizeForApi(form) {
  return {
    ...form,
    hook: form.hook?.trim() || "Novo post",
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
                {mode === "create" ? "Novo post" : `Post #${post.id}`}
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
            <h3 className="text-sm font-semibold text-text-primary mb-1">Aprovação editorial</h3>
            <p className="text-xs text-text-muted">
              Use <strong className="text-text-secondary">Revisado</strong> para registrar aprovação manual. Só coloque como <strong className="text-text-secondary">Agendado</strong> quando o conteúdo e a data estiverem prontos para publicação automática.
            </p>
          </div>

          <div>
            <label className="label">Hook / Título principal</label>
            <textarea
              className="textarea text-base font-medium"
              name="hook"
              value={form.hook || ""}
              onChange={handleChange}
              rows={2}
              placeholder="A primeira linha que vai prender a atenção..."
              required
            />
          </div>

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

          <div>
            <label className="label">CTA (Call to Action)</label>
            <input
              className="input"
              name="cta"
              value={form.cta || ""}
              onChange={handleChange}
              placeholder="Ex: Comente aqui o que você acha..."
            />
          </div>

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
            <p className="text-[11px] text-text-muted mt-1">{(form.short_x || "").length}/280 caracteres</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-[11px] text-text-muted mt-1">{STATUS_HELP[form.status] || STATUS_HELP.draft}</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="label">Modo de criação</label>
              <input
                className="input"
                name="generation_mode"
                value={form.generation_mode || "manual"}
                onChange={handleChange}
                placeholder="manual, template ou ollama"
              />
            </div>
          </div>

          <div>
            <label className="label">Observações</label>
            <textarea
              className="textarea"
              name="notes"
              value={form.notes || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Anotações internas, motivo de falha ou contexto de aprovação..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : mode === "create" ? "Criar post" : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
