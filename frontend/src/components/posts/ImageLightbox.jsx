import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan";

/**
 * Shows one image at its real size (scrolls when it is bigger than the screen).
 * Escape closes only the viewer, not the post modal behind it.
 */
export default function ImageLightbox({ src, alt, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const before = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation(); // runs in capture, before PostModal's Escape handler
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      before?.focus?.();
    };
  }, [onClose]);

  if (!src) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Real size: ${alt}`}
      className="fixed inset-0 z-[60] bg-black/85 overflow-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className={`fixed top-4 right-4 z-[61] rounded-full bg-bg-surface/90 border border-border p-2 text-text-primary ${FOCO}`}
        aria-label="Close real size view"
      >
        <X size={18} aria-hidden="true" />
      </button>
      <div className="min-h-full min-w-full w-max flex items-center justify-center p-8" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <img src={src} alt={alt} className="max-w-none rounded shadow-2xl" />
      </div>
    </div>
  );
}
