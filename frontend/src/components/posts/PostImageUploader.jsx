import React, { useEffect, useId, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { assetsApi } from "../../lib/api";
import {
  ALT_MAX,
  ALT_MIN,
  altTextValido,
  descreverContador,
  mensagemDeErro,
  tamanhoAlt,
  validarArquivo,
} from "../../lib/imageUpload.mjs";

const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flowity-cyan";

/**
 * Seletor de imagem do post com texto alternativo obrigatório.
 * Sem drag-and-drop: o <input type="file"> já é operável por teclado e leitor de tela.
 */
export default function PostImageUploader({ postId, onUploaded }) {
  const uid = useId();
  const ids = {
    arquivo: `${uid}-arquivo`,
    arquivoAjuda: `${uid}-arquivo-ajuda`,
    arquivoErro: `${uid}-arquivo-erro`,
    alt: `${uid}-alt`,
    altAjuda: `${uid}-alt-ajuda`,
    altContador: `${uid}-alt-contador`,
  };

  const inputRef = useRef(null);
  const [arquivo, setArquivo] = useState(null);
  const [previa, setPrevia] = useState("");
  const [erroArquivo, setErroArquivo] = useState("");
  const [altText, setAltText] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [aviso, setAviso] = useState("");

  // Libera a URL temporária da pré-visualização quando ela muda ou o componente sai da tela.
  useEffect(() => () => previa && URL.revokeObjectURL(previa), [previa]);

  function limparSelecao() {
    setArquivo(null);
    setPrevia("");
    setAltText("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleArquivo(e) {
    const escolhido = e.target.files?.[0] || null;
    setAviso("");
    setErroEnvio("");
    if (!escolhido) {
      limparSelecao();
      setErroArquivo("");
      return;
    }
    const erro = validarArquivo(escolhido);
    if (erro) {
      setArquivo(null);
      setPrevia("");
      setErroArquivo(erro);
      return;
    }
    setErroArquivo("");
    setArquivo(escolhido);
    setPrevia(URL.createObjectURL(escolhido));
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!arquivo || !altTextValido(altText) || enviando) return;
    setEnviando(true);
    setErroEnvio("");
    setAviso("");
    try {
      const { data } = await assetsApi.upload(postId, arquivo, altText.trim());
      limparSelecao();
      setAviso("Imagem enviada com o texto alternativo.");
      onUploaded?.(data);
    } catch (err) {
      setErroEnvio(mensagemDeErro(err, "Não foi possível enviar a imagem. Tente de novo."));
    } finally {
      setEnviando(false);
    }
  }

  const altOk = altTextValido(altText);
  const podeSalvar = Boolean(arquivo) && altOk && !enviando;
  const faltaAlt = Boolean(arquivo) && !altOk;

  return (
    <form className="space-y-3" onSubmit={handleSalvar} noValidate>
      <div>
        <label htmlFor={ids.arquivo} className="label">
          Escolher imagem
        </label>
        <input
          ref={inputRef}
          id={ids.arquivo}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleArquivo}
          aria-describedby={`${ids.arquivoAjuda}${erroArquivo ? ` ${ids.arquivoErro}` : ""}`}
          aria-invalid={erroArquivo ? "true" : undefined}
          className={`block w-full text-sm text-text-secondary rounded-lg
            file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-border
            file:bg-bg-elevated file:text-text-primary file:text-sm file:font-medium file:cursor-pointer
            ${FOCO}`}
        />
        <p id={ids.arquivoAjuda} className="text-xs text-text-secondary mt-1">
          PNG ou JPEG, até 5 MB.
        </p>
        {erroArquivo && (
          <p id={ids.arquivoErro} role="alert" className="text-sm text-red-300 mt-1 font-medium">
            Erro: {erroArquivo}
          </p>
        )}
      </div>

      {previa && (
        <figure className="rounded-lg border border-border bg-bg-base p-2 inline-block">
          <img
            src={previa}
            alt={tamanhoAlt(altText) ? altText.trim() : `Pré-visualização do arquivo ${arquivo?.name}`}
            className="max-h-48 max-w-full rounded"
          />
          <figcaption className="text-xs text-text-secondary mt-1">
            Pré-visualização: {arquivo?.name}
          </figcaption>
        </figure>
      )}

      <div>
        <label htmlFor={ids.alt} className="label">
          Texto alternativo (obrigatório)
        </label>
        <textarea
          id={ids.alt}
          className="textarea"
          rows={3}
          value={altText}
          maxLength={ALT_MAX}
          required
          aria-required="true"
          aria-invalid={faltaAlt ? "true" : undefined}
          aria-describedby={`${ids.altAjuda} ${ids.altContador}`}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Descreva o que a imagem mostra para quem não consegue vê-la."
        />
        <p id={ids.altAjuda} className="text-xs text-text-secondary mt-1">
          Descreva o conteúdo e a função da imagem, de {ALT_MIN} a {ALT_MAX} caracteres.
        </p>
        <p
          id={ids.altContador}
          className={`text-xs mt-0.5 ${altOk ? "text-text-secondary" : "text-amber-300"}`}
        >
          {descreverContador(altText)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!podeSalvar}
          aria-busy={enviando ? "true" : undefined}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
            bg-flowity-purple text-bg-base hover:bg-flowity-purple-hover
            disabled:bg-bg-elevated disabled:text-text-secondary disabled:border disabled:border-border
            disabled:cursor-not-allowed ${FOCO}`}
        >
          <Upload size={14} aria-hidden="true" />
          {enviando ? "Enviando..." : "Salvar imagem"}
        </button>
        {!arquivo && !erroArquivo && (
          <span className="text-xs text-text-secondary">Escolha uma imagem para habilitar o envio.</span>
        )}
        {faltaAlt && (
          <span className="text-xs text-amber-300">
            Preencha o texto alternativo com pelo menos {ALT_MIN} caracteres para salvar.
          </span>
        )}
      </div>

      {erroEnvio && (
        <p role="alert" className="text-sm text-red-300 font-medium">
          Erro: {erroEnvio}
        </p>
      )}
      <p role="status" aria-live="polite" className="text-sm text-emerald-300">
        {aviso}
      </p>
    </form>
  );
}
