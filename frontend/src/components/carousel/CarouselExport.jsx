import React, { useState } from "react";
import { Copy, Download } from "lucide-react";
import { apiDownload } from "../../lib/api";
import { mensagemDeErro } from "../../lib/imageUpload.mjs";
import { montarLegenda } from "../../lib/publishChecklist.mjs";
import { FOCO } from "./SlideCard";

const BOTAO_PRIMARIO = `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
  bg-flowity-purple text-bg-base hover:bg-flowity-purple-hover
  disabled:bg-bg-elevated disabled:text-text-secondary disabled:border disabled:border-border
  disabled:cursor-wait ${FOCO}`;
const BOTAO_SECUNDARIO = `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border
  bg-bg-elevated text-text-primary hover:border-flowity-purple ${FOCO}`;

/**
 * Downloads the generated carousel PDF and copies the post caption.
 * The PDF comes from the `pdf_url` returned by POST /posts/{id}/render/carousel (Task 8).
 */
export default function CarouselExport({ post, carrossel, onBaixado }) {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  async function baixarPdf() {
    setBaixando(true);
    setErro("");
    setAviso("");
    try {
      if (!carrossel?.pdf_url) throw new Error("sem pdf_url");
      await apiDownload(carrossel.pdf_url, "carousel.pdf");
      setAviso("PDF downloaded: carousel.pdf.");
      onBaixado?.();
    } catch (err) {
      setErro(
        err?.message === "sem pdf_url"
          ? "The server did not return the PDF address. Generate the carousel again."
          : mensagemDeErro(err, "Could not download the PDF. Try again.")
      );
    } finally {
      setBaixando(false);
    }
  }

  async function copiarLegenda() {
    setErro("");
    setAviso("");
    try {
      await navigator.clipboard.writeText(montarLegenda(post));
      setAviso("Caption copied.");
    } catch {
      setErro("Could not copy the caption. Select the post text and copy it manually.");
    }
  }

  return (
    <section aria-labelledby="exportar-titulo" className="card space-y-3">
      <h2 id="exportar-titulo" className="text-base font-semibold text-text-primary">
        Download and publish
      </h2>
      <p className="text-sm text-text-secondary">
        LinkedIn publishes carousels as PDF documents. Download the file and paste the caption into the post.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={baixarPdf}
          disabled={baixando}
          aria-busy={baixando ? "true" : "false"}
          className={BOTAO_PRIMARIO}
        >
          <Download size={14} aria-hidden="true" />
          {baixando ? "Generating PDF..." : "Download PDF"}
        </button>
        <button type="button" onClick={copiarLegenda} className={BOTAO_SECUNDARIO}>
          <Copy size={14} aria-hidden="true" />
          Copy caption
        </button>
      </div>
      {erro && (
        <p role="alert" className="text-sm text-red-300 font-medium">
          Error: {erro}
        </p>
      )}
      <p role="status" aria-live="polite" className="text-sm text-emerald-300">
        {aviso}
      </p>
    </section>
  );
}
