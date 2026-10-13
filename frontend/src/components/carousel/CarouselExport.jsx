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
 * Baixa o PDF do carrossel gerado e copia a legenda do post.
 * O PDF vem do `pdf_url` devolvido por POST /posts/{id}/render/carousel (Tarefa 8).
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
      await apiDownload(carrossel.pdf_url, "carrossel.pdf");
      setAviso("PDF baixado: carrossel.pdf.");
      onBaixado?.();
    } catch (err) {
      setErro(
        err?.message === "sem pdf_url"
          ? "O servidor não devolveu o endereço do PDF. Gere o carrossel de novo."
          : mensagemDeErro(err, "Não foi possível baixar o PDF. Tente de novo.")
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
      setAviso("Legenda copiada.");
    } catch {
      setErro("Não foi possível copiar a legenda. Selecione o texto do post e copie manualmente.");
    }
  }

  return (
    <section aria-labelledby="exportar-titulo" className="card space-y-3">
      <h2 id="exportar-titulo" className="text-base font-semibold text-text-primary">
        Baixar e publicar
      </h2>
      <p className="text-sm text-text-secondary">
        O LinkedIn publica carrossel como documento PDF. Baixe o arquivo e cole a legenda no post.
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
          {baixando ? "Gerando PDF..." : "Baixar PDF"}
        </button>
        <button type="button" onClick={copiarLegenda} className={BOTAO_SECUNDARIO}>
          <Copy size={14} aria-hidden="true" />
          Copiar legenda
        </button>
      </div>
      {erro && (
        <p role="alert" className="text-sm text-red-300 font-medium">
          Erro: {erro}
        </p>
      )}
      <p role="status" aria-live="polite" className="text-sm text-emerald-300">
        {aviso}
      </p>
    </section>
  );
}
