import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "../shared/StatusBadge";
import SelectField from "../shared/SelectField";
import PostImageUploader from "./PostImageUploader";
import ImageLightbox from "./ImageLightbox";
import { IssueDot } from "./PostMeta";
import { issuesFor, postIssues } from "../../lib/postIssues.js";
import { assetsApi, mediaUrl } from "../../lib/api";
import { mensagemDeErro } from "../../lib/imageUpload.mjs";
import { PILLARS, pillarsForChannel } from "../../lib/pillars.js";
import { CHANNELS, CHANNEL_ORDER, postText } from "../../lib/channels.js";
import { fromLocalInput, isMissed, toLocalInput } from "../../lib/postDates.js";

const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan";

/**
 * Saves every image of the post as post-<id>-<n>.<ext>. The images live in the Supabase bucket (another origin),
 * where <a download> is ignored, so each one is fetched as a blob first. Returns how many failed.
 */
async function downloadImages(images, postId) {
  let failed = 0;
  for (const [i, img] of images.entries()) {
    try {
      const res = await fetch(mediaUrl(img.url));
      if (!res.ok) throw new Error(res.statusText);
      const blob = await res.blob();
      const ext = (img.url.split("?")[0].match(/\.(\w+)$/) || [, "png"])[1];
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = images.length > 1 ? `post-${postId}-${i + 1}.${ext}` : `post-${postId}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch {
      failed += 1;
    }
  }
  return failed;
}

/** "Post images" section: lists the uploaded images and opens the upload for a new one. */
function PostImagesSection({ postId, registerPending, issues = [], onImagesChange }) {
  const tituloRef = useRef(null);
  const [imagens, setImagens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [removendo, setRemovendo] = useState(null);
  const [ampliada, setAmpliada] = useState(null);

  useEffect(() => {
    onImagesChange?.(imagens);
  }, [imagens, onImagesChange]);

  const carregar = useCallback(async () => {
    if (!postId) return;
    setCarregando(true);
    setErro("");
    try {
      const { data } = await assetsApi.list(postId);
      setImagens(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(mensagemDeErro(err, "Could not load the post images."));
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
      setAviso(`Image ${indice + 1} removed.`);
      tituloRef.current?.focus(); // the clicked button disappears; focus returns to the section title
    } catch (err) {
      setErro(mensagemDeErro(err, "Could not remove the image."));
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
          className="text-sm font-semibold text-text-primary focus:outline-none inline-flex items-center gap-2"
        >
          Post images
          <IssueDot issues={issues} />
        </h3>
        {issues.map((issue) => (
          <p key={issue.id} className="text-xs text-red-300 font-medium mt-1">{issue.message}</p>
        ))}
        <p className="text-xs text-text-secondary mt-1">
          Every image needs alt text: without it, the image does not exist for people who use a screen reader.
        </p>
      </div>

      {!postId ? (
        <p className="text-sm text-text-secondary">
          Create the post first. Once it is saved, open it again to upload images.
        </p>
      ) : (
        <>
          {carregando && <p className="text-sm text-text-secondary">Loading images...</p>}
          {!carregando && imagens.length === 0 && !erro && (
            <p className="text-sm text-text-secondary">No images uploaded yet.</p>
          )}
          {imagens.length > 0 && (
            <ul className="space-y-2" aria-label="Uploaded images">
              {imagens.map((imagem, indice) => (
                <li
                  key={imagem.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-bg-surface p-2"
                >
                  <button
                    type="button"
                    className={`flex-shrink-0 rounded cursor-zoom-in ${FOCO}`}
                    onClick={() => setAmpliada({ src: mediaUrl(imagem.url), alt: imagem.alt_text || `Image ${indice + 1}` })}
                    aria-label={`See image ${indice + 1} at real size`}
                  >
                    <img
                      src={mediaUrl(imagem.url)}
                      alt={imagem.alt_text}
                      className="h-16 w-16 rounded object-cover bg-bg-base"
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-secondary inline-flex items-center gap-2">
                      Image {indice + 1} · alt text:
                      {!imagem.alt_text?.trim() && (
                        <IssueDot issues={[{ message: "This image has no alt text. Remove it and upload it again with alt text." }]} />
                      )}
                    </p>
                    <p className="text-sm text-text-primary break-words">{imagem.alt_text || "(missing)"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remover(imagem, indice)}
                    disabled={removendo === imagem.id}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium border border-border
                      bg-bg-elevated text-red-300 hover:border-red-300 disabled:cursor-wait ${FOCO}`}
                  >
                    {removendo === imagem.id ? "Removing..." : "Remove"}
                    <span className="sr-only"> image {indice + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {erro && (
            <p role="alert" className="text-sm text-red-300 font-medium">
              Error: {erro}
            </p>
          )}
          <p role="status" aria-live="polite" className="text-sm text-emerald-300">
            {aviso}
          </p>

          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-text-primary mb-3">Upload new image</h4>
            <PostImageUploader
              postId={postId}
              registerPending={registerPending}
              onUploaded={(nova) => {
                setAviso("");
                setImagens((lista) => [...lista, nova]);
              }}
            />
          </div>
        </>
      )}
      {ampliada && <ImageLightbox src={ampliada.src} alt={ampliada.alt} onClose={() => setAmpliada(null)} />}
    </section>
  );
}

const STATUSES = ["idea", "draft", "revised", "to_approve", "scheduled", "publishing", "published", "failed"];
const STATUS_LABELS = {
  idea: "Idea",
  draft: "Draft",
  revised: "Revised",
  to_approve: "To approve",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
};
const STATUS_HELP = {
  idea: "Initial idea without final copy.",
  draft: "Draft created by Generator or manually.",
  revised: "Reviewed, without a date yet.",
  to_approve: "Written by Claude with a proposed date. Check it and click Approve.",
  scheduled: "Approved. Make publishes it on the date (LinkedIn), or you post it and click Mark published (manual channels).",
  publishing: "Automation is publishing this post.",
  published: "Published successfully.",
  failed: "Automation reported a failure.",
};

const WORKFLOW_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "manual", label: "manual" },
  { value: "pi1", label: "pi1" },
  { value: "pi2", label: "pi2" },
];

const CHANNEL_OPTIONS = CHANNEL_ORDER.map((k) => ({ value: k, label: CHANNELS[k].label }));

function pillarOptions(channel) {
  const keys = pillarsForChannel((CHANNELS[channel] || CHANNELS.linkedin).pillars);
  return [{ value: "", label: "No pillar" }, ...keys.map((k) => ({ value: k, label: PILLARS[k].label }))];
}

/** The form works with the input's local date; the API receives ISO in UTC. */
function toForm(post) {
  return { ...(post || {}), scheduled_at: toLocalInput(post?.scheduled_at) };
}

/** Only the fields the user changed, so a stale form never overwrites what Make wrote (e.g. status). */
function changedFields(payload, original) {
  return Object.fromEntries(
    Object.entries(payload).filter(([k, v]) => JSON.stringify(v ?? null) !== JSON.stringify(original[k] ?? null)),
  );
}

function normalizeForApi(form) {
  return {
    ...form,
    hook: form.hook?.trim() || "New post",
    scheduled_at: fromLocalInput(form.scheduled_at),
    pillar: form.pillar || null,
    source_ids: form.source_ids || [],
    // Time measurement (PI 2, T16): empty becomes null
    external_minutes:
      form.external_minutes === "" || form.external_minutes == null
        ? null
        : Number(form.external_minutes),
    tools_used: form.tools_used?.trim() || null,
    workflow: form.workflow || null,
  };
}

export default function PostModal({ post, onClose, onSave, onDelete, mode = "edit" }) {
  const [formState, setForm] = useState(() => toForm(post));
  const form = formState;
  const [copied, setCopied] = useState("");
  const [saving, setSaving] = useState(false);
  const [dateNotice, setDateNotice] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const confirmingRef = useRef(false);
  const deleteButtonRef = useRef(null);
  const keepButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const pendingImageRef = useRef(null);
  const [pendingImage, setPendingImage] = useState(null);
  const registerPendingImage = useCallback((pending) => {
    pendingImageRef.current = pending;
    setPendingImage(pending ? { altOk: pending.altOk } : null);
  }, []);
  const [images, setImages] = useState(null); // live list from the images section
  const [saveError, setSaveError] = useState(null); // { message, field }

  confirmingRef.current = confirmingDelete;

  useEffect(() => {
    setForm(toForm(post));
    setDateNotice("");
  }, [post]);

  useEffect(() => {
  const elementoAnterior = document.activeElement;

  const handleKey = (e) => {
    if (e.key === "Escape") {
      // While the delete confirmation is open, Escape only cancels the confirmation.
      if (confirmingRef.current) {
        setConfirmingDelete(false);
        deleteButtonRef.current?.focus();
        return;
      }
      onClose();
    }
  };

  window.addEventListener("keydown", handleKey);

  return () => {
    window.removeEventListener("keydown", handleKey);

    if (
      elementoAnterior &&
      typeof elementoAnterior.focus === "function"
    ) {
      elementoAnterior.focus();
    }
  };
}, [onClose]);

  useEffect(() => {
    if (confirmingDelete) keepButtonRef.current?.focus();
  }, [confirmingDelete]);

  const canDelete = mode !== "create" && Boolean(post?.id) && typeof onDelete === "function";

  function askDelete() {
    setDeleteError("");
    if (post.status === "publishing") {
      setDeleteError("A post that is being published cannot be deleted. Wait until publishing finishes.");
      return;
    }
    setConfirmingDelete(true);
  }

  function cancelDelete() {
    setConfirmingDelete(false);
    setDeleteError("");
    deleteButtonRef.current?.focus();
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await onDelete(post);
      onClose();
    } catch (err) {
      setDeleteError(mensagemDeErro(err, "Could not delete the post. Try again."));
    } finally {
      setDeleting(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // One click: on a saved post the date is removed immediately (PATCH scheduled_at null), keeping the rest of the form.
  async function handleRemoveDate() {
    setForm((prev) => ({ ...prev, scheduled_at: "" }));
    if (mode !== "create" && post.id && post.scheduled_at) {
      await onSave({ scheduled_at: null });
      setDateNotice("Date removed. The post left the calendar.");
    }
  }

  // A blocked save jumps to the "Needs fixing" box at the top.
  const showProblems = () => dialogRef.current?.scrollTo?.({ top: 0, behavior: "smooth" });

  async function handleSave(override = {}) {
    const form = { ...formState, ...override };
    setSaveError(null);
    if (form.status === "scheduled" && !form.scheduled_at) {
      setSaveError({ field: "date", message: "Pick a date before moving this post to Scheduled." });
      showProblems();
      return;
    }
    const pending = pendingImageRef.current;
    if (pending && !pending.altOk) {
      showProblems(); // the missing alt text is already listed there
      return;
    }
    setSaving(true);
    try {
      if (pending) {
        try {
          await pending.save();
        } catch {
          setSaveError({ field: "images", message: "The image could not be saved. See the error in Post images." });
          return;
        }
      }
      const payload = normalizeForApi(form);
      await onSave(mode === "create" ? payload : changedFields(payload, normalizeForApi(toForm(post))));
      onClose();
    } catch (err) {
      const altMissing = err?.response?.data?.detail?.error?.code === "acessibilidade_pendente";
      setSaveError({
        field: altMissing ? "images" : "status",
        message: altMissing
          ? "An image on this post has no alt text, so it cannot be scheduled. Fix it in Post images."
          : mensagemDeErro(err, "Could not save the post. Try again."),
      });
      showProblems();
    } finally {
      setSaving(false);
    }
  }

  if (!post) return null;

  const imageSummary = images
    ? {
        image_count: images.length,
        images_without_alt: images.filter((i) => !String(i.alt_text || "").trim()).length,
        images_not_in_bucket: images.filter((i) => !i.public_url).length,
      }
    : {};
  const issues = mode === "create" ? [] : postIssues({
    ...post,
    ...imageSummary,
    status: form.status,
    channel: form.channel,
    hook: form.hook,
    body: form.body,
    scheduled_at: fromLocalInput(form.scheduled_at),
  });
  if (pendingImage && !pendingImage.altOk) {
    issues.push({ id: "pending-alt", field: "images", message: "You chose an image but its alt text is missing, so it will not be saved." });
  }
  if (saveError) issues.unshift({ id: "save", field: saveError.field, message: saveError.message });
  const dot = (field) => <IssueDot issues={issuesFor(issues, field)} />;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "New post" : `Post #${post.id}`}
        className="bg-bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <StatusBadge status={form.status} />
            <div>
              <p className="text-sm text-text-secondary">
                {mode === "create" ? "New post" : `Post #${post.id}`}
              </p>
              <p className="text-xs text-text-muted">
                {CHANNELS[form.channel]?.label || form.channel || "LinkedIn"}
              </p>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {issues.length > 0 && (
            <div role="alert" className="rounded-lg border border-red-500/50 bg-red-500/10 p-3">
              <p className="text-sm font-semibold text-red-200 mb-1">Needs fixing</p>
              <ul className="space-y-1">
                {issues.map((issue) => (
                  <li key={issue.id} className="flex items-start gap-2 text-xs text-red-200">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                    {issue.message}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-red-200/70 mt-2">Red dots below mark where. Everything without a dot is fine.</p>
            </div>
          )}
          {mode !== "create" && (post.status === "to_approve" || !CHANNELS[form.channel]?.auto) && (
            <div className="card bg-bg-elevated/40 flex flex-wrap items-center gap-2">
              {post.status === "to_approve" && (
                <button type="button" className={`btn-primary ${FOCO}`} disabled={saving}
                  onClick={() => handleSave({ status: "scheduled" })}>
                  Approve and schedule
                </button>
              )}
              {!CHANNELS[form.channel]?.auto && (
                <>
                  <button type="button" className={`btn-secondary ${FOCO}`}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(postText(form));
                        setCopied("Text copied.");
                      } catch {
                        setCopied("Could not copy. Select the text in the fields below.");
                      }
                    }}>
                    Copy text
                  </button>
                  {images?.length > 0 && (
                    <button type="button" className={`btn-secondary ${FOCO}`}
                      onClick={async () => {
                        const failed = await downloadImages(images, post.id);
                        setCopied(failed
                          ? `${failed} of ${images.length} could not be downloaded. Open them from Post images below.`
                          : images.length > 1 ? `${images.length} images downloaded.` : "Image downloaded.");
                      }}>
                      {images.length > 1 ? `Download all images (${images.length})` : "Download image"}
                    </button>
                  )}
                  {post.status !== "published" && (
                    <button type="button" className={`btn-secondary ${FOCO}`} disabled={saving}
                      onClick={() => handleSave({ status: "published" })}>
                      Mark published
                    </button>
                  )}
                </>
              )}
              <p role="status" aria-live="polite" className="text-xs text-emerald-300 w-full">{copied}</p>
              <p className="text-[11px] text-text-muted w-full">
                {CHANNELS[form.channel]?.auto
                  ? "Approving schedules it: Make publishes it on the date."
                  : `${CHANNELS[form.channel]?.label} is posted by you: copy, post, then Mark published.`}
              </p>
            </div>
          )}

          <div className="card bg-bg-elevated/40">
            <h3 className="text-sm font-semibold text-text-primary mb-1">Editorial approval</h3>
            <p className="text-xs text-text-muted">
              Calendar sync rule: every post with a date appears on the calendar, whatever its status. Remove the date to take it off the calendar. Only <strong className="text-text-secondary">Scheduled</strong> posts are published automatically.
            </p>
          </div>

          <div>
            <label className="label inline-flex items-center gap-2" htmlFor="post-hook">Hook / main title {dot("text")}</label>
            <textarea
              className="textarea text-base font-medium"
              id="post-hook"
                name="hook"
              value={form.hook || ""}
              onChange={handleChange}
              rows={2}
              placeholder="The first line that grabs attention..."
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="post-body">Post body</label>
            <textarea
              className="textarea"
              id="post-body"
                name="body"
              value={form.body || ""}
              onChange={handleChange}
              rows={8}
              placeholder="Develop the content..."
            />
          </div>

          <div>
            <label className="label" htmlFor="post-cta">CTA (call to action)</label>
            <input
              className="input"
              id="post-cta"
                name="cta"
              value={form.cta || ""}
              onChange={handleChange}
              placeholder="Example: Comment with your take..."
            />
          </div>

          <div>
            <label className="label" htmlFor="post-short-x">X version (max 280 chars)</label>
            <input
              className="input"
              id="post-short-x"
                name="short_x"
              value={form.short_x || ""}
              onChange={handleChange}
              maxLength={280}
              placeholder="Compact version for X..."
            />
            <p className="text-[11px] text-text-muted mt-1">{(form.short_x || "").length}/280 characters</p>
          </div>

          <PostImagesSection
            postId={post.id}
            registerPending={registerPendingImage}
            issues={issuesFor(issues, "images")}
            onImagesChange={setImages}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label inline-flex items-center gap-2" htmlFor="post-status">Status {dot("status")}</label>
              <SelectField
                id="post-status"
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
              <label className="label" htmlFor="post-channel">Channel</label>
              <SelectField
                id="post-channel"
                name="channel"
                value={form.channel || "linkedin"}
                onChange={handleChange}
                options={CHANNEL_OPTIONS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label inline-flex items-center gap-2" htmlFor="post-scheduled-at">Schedule {dot("date")}</label>
              <div className="flex items-center gap-2">
                <input
                  className="input"
                  type="datetime-local"
                  id="post-scheduled-at"
                  name="scheduled_at"
                  value={form.scheduled_at || ""}
                  onChange={handleChange}
                />
                {form.scheduled_at && (
                  <button
                    type="button"
                    className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-bg-elevated text-red-300 hover:border-red-300 ${FOCO}`}
                    onClick={handleRemoveDate}
                  >
                    Remove date
                  </button>
                )}
              </div>
              {form.scheduled_at && isMissed({ ...form, scheduled_at: fromLocalInput(form.scheduled_at) }) && (
                <p className="text-[11px] text-red-300 mt-1 font-medium">Missed date: this date passed and the post did not go out.</p>
              )}
              <p role="status" aria-live="polite" className="text-[11px] text-emerald-300 mt-1">{dateNotice}</p>
            </div>
            <div>
              <label className="label" htmlFor="post-pillar">Pillar</label>
              <SelectField
                id="post-pillar"
                name="pillar"
                value={form.pillar || ""}
                onChange={handleChange}
                options={pillarOptions(form.channel)}
              />
              {PILLARS[form.pillar] && (
                <p className="text-[11px] mt-1" style={{ color: PILLARS[form.pillar].color }}>
                  {PILLARS[form.pillar].description} Goal: {PILLARS[form.pillar].goal}.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="post-generation-mode">Creation mode</label>
              <input
                className="input"
                id="post-generation-mode"
                name="generation_mode"
                value={form.generation_mode || "manual"}
                onChange={handleChange}
                placeholder="manual, template, or ollama"
              />
            </div>
          </div>

          <fieldset className="card bg-bg-elevated/40 space-y-4">
            <legend className="px-1 text-sm font-semibold text-text-primary">
              Time measurement (PI 2)
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="post-external-minutes">
                  Time spent outside the tool (min)
                </label>
                <input
                  id="post-external-minutes"
                  className="input"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  name="external_minutes"
                  value={form.external_minutes ?? ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="post-workflow">Workflow</label>
                <select
                  id="post-workflow"
                  className="select"
                  name="workflow"
                  value={form.workflow || ""}
                  onChange={handleChange}
                >
                  {WORKFLOW_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="post-tools-used">Tools used</label>
              <input
                id="post-tools-used"
                className="input"
                name="tools_used"
                maxLength={200}
                value={form.tools_used || ""}
                onChange={handleChange}
                placeholder="E.g. Canva, Google Docs"
              />
            </div>
          </fieldset>

          <div>
            <label className="label" htmlFor="post-notes">Notes</label>
            <textarea
              className="textarea"
              id="post-notes"
                name="notes"
              value={form.notes || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Internal notes, failure reason, or approval context..."
            />
          </div>
        </div>

        {confirmingDelete && (
          <div
            role="group"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-text"
            className="mx-6 mb-4 rounded-lg border border-red-300/60 bg-bg-elevated p-4 space-y-3"
          >
            <h3 id="delete-confirm-title" className="text-sm font-semibold text-text-primary">
              Delete this post?
            </h3>
            <p id="delete-confirm-text" className="text-xs text-text-secondary">
              This permanently deletes the post, its images and its metrics. It also disappears from the calendar and the pipeline. This cannot be undone.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                ref={keepButtonRef}
                className={`btn-secondary ${FOCO}`}
                onClick={cancelDelete}
                disabled={deleting}
              >
                Keep post
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-semibold border border-red-300 bg-bg-surface text-red-300 hover:bg-red-300/10 disabled:cursor-wait ${FOCO}`}
                onClick={handleConfirmDelete}
                disabled={deleting}
                aria-busy={deleting ? "true" : undefined}
              >
                {deleting ? "Deleting..." : "Yes, delete post"}
              </button>
            </div>
          </div>
        )}

        {deleteError && (
          <p role="alert" className="mx-6 mb-3 text-sm text-red-300 font-medium">
            Error: {deleteError}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2 px-6 py-4 border-t border-border">
          {post.id && (
            <Link
              to={`/carousel/${post.id}`}
              className={`mr-auto inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border border-border
                bg-bg-elevated text-text-primary hover:border-flowity-purple ${FOCO}`}
            >
              Build carousel
            </Link>
          )}
          {canDelete && !confirmingDelete && (
            <button
              type="button"
              ref={deleteButtonRef}
              className={`px-4 py-2 rounded-lg text-sm font-medium border border-border bg-bg-elevated text-red-300 hover:border-red-300 ${FOCO}`}
              onClick={askDelete}
              aria-disabled={post.status === "publishing" ? "true" : undefined}
            >
              Delete post
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => handleSave()} disabled={saving}>
            {saving ? "Saving..." : mode === "create" ? "Create post" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
