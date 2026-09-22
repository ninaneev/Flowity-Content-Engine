import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import SelectField from "../shared/SelectField";
import PostImageUploader from "./PostImageUploader";
import { assetsApi, mediaUrl } from "../../lib/api";
import { mensagemDeErro } from "../../lib/imageUpload.mjs";

const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan";

/** Seção "Imagens do post": lista as imagens enviadas e abre o envio de uma nova. */
function PostImagesSection({ postId }) {
  const tituloRef = useRef(null);
  const [imagens, setImagens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [removendo, setRemovendo] = useState(null);

  const carregar = useCallback(async () => {
    if (!postId) return;
    setCarregando(true);
    setErro("");
    try {
      const { data } = await assetsApi.list(postId);
      setImagens(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível carregar as imagens do post."));
    } finally {
      setCarregando(false);
    }
  }, [postId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function remover(imagem, indice) {
    setRemovendo(imagem.id);
    setErro("");
    setAviso("");
    try {
      await assetsApi.remove(imagem.id);
      setImagens((lista) => lista.filter((i) => i.id !== imagem.id));
      setAviso(`Imagem ${indice + 1} removida.`);
      tituloRef.current?.focus(); // o botão clicado some; o foco volta ao título da seção
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível remover a imagem."));
    } finally {
      setRemovendo(null);
    }
  }

  return (
    <section aria-labelledby="imagens-do-post-titulo" className="card bg-bg-elevated/40 space-y-4">
      <div>
        <h3
          id="imagens-do-post-titulo"
          ref={tituloRef}
          tabIndex={-1}
          className="text-sm font-semibold text-text-primary focus:outline-none"
        >
          Imagens do post
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Toda imagem precisa de texto alternativo: sem ele, ela não existe para quem usa leitor de tela.
        </p>
      </div>

      {!postId ? (
        <p className="text-sm text-text-secondary">
          Crie o post primeiro. Depois de salvo, abra-o de novo para enviar imagens.
        </p>
      ) : (
        <>
          {carregando && <p className="text-sm text-text-secondary">Carregando imagens...</p>}
          {!carregando && imagens.length === 0 && !erro && (
            <p className="text-sm text-text-secondary">Nenhuma imagem enviada ainda.</p>
          )}
          {imagens.length > 0 && (
            <ul className="space-y-2" aria-label="Imagens já enviadas">
              {imagens.map((imagem, indice) => (
                <li
                  key={imagem.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-bg-surface p-2"
                >
                  <img
                    src={mediaUrl(imagem.url)}
                    alt={imagem.alt_text}
                    className="h-16 w-16 flex-shrink-0 rounded object-cover bg-bg-base"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-secondary">
                      Imagem {indice + 1} · texto alternativo:
                    </p>
                    <p className="text-sm text-text-primary break-words">{imagem.alt_text}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remover(imagem, indice)}
                    disabled={removendo === imagem.id}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium border border-border
                      bg-bg-elevated text-red-300 hover:border-red-300 disabled:cursor-wait ${FOCO}`}
                  >
                    {removendo === imagem.id ? "Removendo..." : "Remover"}
                    <span className="sr-only"> imagem {indice + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {erro && (
            <p role="alert" className="text-sm text-red-300 font-medium">
              Erro: {erro}
            </p>
          )}
          <p role="status" aria-live="polite" className="text-sm text-emerald-300">
            {aviso}
          </p>

          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-text-primary mb-3">Enviar nova imagem</h4>
            <PostImageUploader
              postId={postId}
              onUploaded={(nova) => {
                setAviso("");
                setImagens((lista) => [...lista, nova]);
              }}
            />
          </div>
        </>
      )}
    </section>
  );
}

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

const CHANNEL_LABELS = {
  linkedin: "LinkedIn",
  x: "X / Twitter",
  newsletter: "Newsletter",
};

function normalizeForApi(form, original = {}) {
  const movedOutOfScheduled = original.status === "scheduled" && form.status !== "scheduled";
  return {
    ...form,
    hook: form.hook?.trim() || "New post",
    scheduled_at: movedOutOfScheduled ? null : (form.scheduled_at || null),
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
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === "status" && value !== "scheduled") {
        return { ...prev, status: value, scheduled_at: "" };
      }
      return { ...prev, [name]: value };
    });
  }

  async function handleSave() {
    if (form.status === "scheduled" && !form.scheduled_at) {
      window.alert("Choose a schedule date/time before moving this post to Scheduled.");
      return;
    }
    setSaving(true);
    try {
      await onSave(normalizeForApi(form, post));
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
                {CHANNEL_LABELS[form.channel] || form.channel || "LinkedIn"}
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
              Calendar sync rule: only <strong className="text-text-secondary">Scheduled</strong> posts with a date appear on the calendar. Moving a post out of Scheduled clears its calendar date.
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

          <PostImagesSection postId={post.id} />

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
              {form.status === "scheduled" && !form.scheduled_at && (
                <p className="text-[11px] text-amber-400 mt-1 font-medium">
                  ⚠ A publish date is required for scheduled posts — n8n will not pick this up without one.
                </p>
              )}
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
                  { value: "newsletter", label: "Newsletter" },
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
