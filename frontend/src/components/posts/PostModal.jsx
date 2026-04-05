/**
 * ╔═════════════════════════════════════════════════════════���════════════╗
 * ║  TAREFA DO INTEGRANTE 4 — Modal do Post                            ║
 * ║  Issue: #4 no GitHub Projects                                       ║
 * ║  Branch: feat/issue-4-post-modal                                    ║
 * ╚═════════════════════════════════════════════════════════════════���════╝
 *
 * O QUE VOCÊ VAI FAZER:
 *   Criar o modal que abre quando o usuário clica em um post no calendário.
 *   O modal deve mostrar todos os campos do post E permitir editar.
 *
 * COMO FUNCIONA:
 *   1. Usuário clica num post no calendário
 *   2. O DashboardPage abre este modal passando o post como prop
 *   3. O modal exibe os dados
 *   4. Usuário pode editar e salvar (chama onSave) ou fechar (chama onClose)
 *
 * PROPS:
 *   post    = objeto com id, hook, body, cta, channel, status, scheduled_at, etc.
 *   onClose = função chamada ao fechar o modal
 *   onSave  = função assíncrona chamada com os dados editados
 *
 * CAMPOS QUE DEVEM APARECER NO MODAL:
 *   - hook (campo de texto — o mais importante, visualmente em destaque)
 *   - body (textarea grande)
 *   - cta (campo de texto)
 *   - short_x (campo de texto, label "Versão para X")
 *   - channel (select: linkedin / x)
 *   - status (select com todos os status)
 *   - scheduled_at (input datetime-local)
 *   - notes (textarea)
 *
 * COMO TESTAR:
 *   1. Crie um post pelo Generator
 *   2. Vá para o calendário (/dashboard)
 *   3. Clique no card do post — o modal deve abrir
 */

import React, { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";

export default function PostModal({ post, onClose, onSave }) {
  const [form, setForm] = useState(post || {});
  const [saving, setSaving] = useState(false);

  // Fecha o modal ao pressionar ESC
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
    // Overlay escuro
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <StatusBadge status={form.status} />
            <span className="text-text-muted text-sm">{form.channel === "linkedin" ? "LinkedIn" : "X"}</span>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* TODO Integrante 4: adicione os campos abaixo */}
          {/* O hook é o campo mais importante — deixe ele em destaque */}

          {/* CAMPO 1 — hook (já feito como exemplo) */}
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

          {/* TODO: CAMPO 2 — body (textarea grande, 8 linhas) */}

          {/* TODO: CAMPO 3 — cta (input texto) */}

          {/* TODO: CAMPO 4 — short_x (input texto, label "Versão para X (máx 280 chars)") */}

          {/* TODO: CAMPO 5 — status (select) */}

          {/* TODO: CAMPO 6 — channel (select: linkedin / x) */}

          {/* TODO: CAMPO 7 — scheduled_at (input datetime-local) */}

          {/* TODO: CAMPO 8 — notes (textarea, 3 linhas) */}

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
