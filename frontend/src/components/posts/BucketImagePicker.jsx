import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan";

// How long the pointer (or keyboard focus) rests on an option before the bigger preview opens.
export const HOVER_PREVIEW_MS = 1500;

/**
 * Dropdown of the images in the post-images bucket, each with a thumbnail.
 * Resting on an option for a moment shows a bigger preview next to the list.
 */
export default function BucketImagePicker({ id, images, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const timer = useRef(null);
  const wrapRef = useRef(null);
  const chosen = images.find((img) => img.path === value) || null;

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation(); // close the list, not the post modal
      close();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  function close() {
    clearTimeout(timer.current);
    setPreview(null);
    setOpen(false);
  }

  function startPreview(img, el) {
    clearTimeout(timer.current);
    setPreview(null);
    timer.current = setTimeout(() => {
      // Fixed position next to the option, in a portal so the modal's scroll does not clip it.
      const r = el.getBoundingClientRect();
      const width = 288;
      const left = r.right + 12 + width <= window.innerWidth ? r.right + 12 : Math.max(8, r.left - width - 12);
      const top = Math.max(8, Math.min(r.top, window.innerHeight - 380));
      setPreview({ img, left, top, width });
    }, HOVER_PREVIEW_MS);
  }

  function stopPreview() {
    clearTimeout(timer.current);
    setPreview(null);
  }

  function pick(img) {
    onChange(img);
    close();
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className={`input flex items-center gap-2 text-left ${FOCO}`}
      >
        {chosen ? (
          <>
            <img src={chosen.url} alt="" className="h-6 w-6 rounded object-cover bg-bg-base" />
            <span className="truncate flex-1">{chosen.path}</span>
          </>
        ) : (
          <span className="flex-1 text-text-muted">Choose an image…</span>
        )}
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1">
          <ul
            role="listbox"
            aria-label="Images in the bucket"
            className="max-h-72 overflow-y-auto rounded-lg border border-border bg-bg-surface shadow-xl p-1"
          >
            {images.map((img) => (
              <li key={img.path} role="option" aria-selected={img.path === value}>
                <button
                  type="button"
                  onClick={() => pick(img)}
                  onMouseEnter={(e) => startPreview(img, e.currentTarget)}
                  onMouseLeave={stopPreview}
                  onFocus={(e) => startPreview(img, e.currentTarget)}
                  onBlur={stopPreview}
                  className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-bg-elevated ${
                    img.path === value ? "bg-flowity-purple/15 text-text-primary" : "text-text-secondary"
                  } ${FOCO}`}
                >
                  <img src={img.url} alt="" loading="lazy" className="h-10 w-10 rounded object-cover bg-bg-base shrink-0" />
                  <span className="truncate">{img.path}</span>
                </button>
              </li>
            ))}
          </ul>
          {preview &&
            createPortal(
              <figure
                aria-hidden="true"
                style={{ left: preview.left, top: preview.top, width: preview.width }}
                className="fixed z-[70] rounded-lg border border-border bg-bg-base p-2 shadow-2xl pointer-events-none"
              >
                <img src={preview.img.url} alt="" className="w-full max-h-[360px] object-contain rounded" />
                <figcaption className="mt-1 text-[11px] text-text-secondary truncate">{preview.img.path}</figcaption>
              </figure>,
              document.body,
            )}
        </div>
      )}
    </div>
  );
}
