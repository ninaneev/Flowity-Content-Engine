import React, { useEffect, useId, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { assetsApi } from "../../lib/api";
import BucketImagePicker from "./BucketImagePicker";
import ImageLightbox from "./ImageLightbox";
import { IssueDot } from "./PostMeta";
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
 * Post image picker with required alt text.
 * No drag-and-drop: the <input type="file"> is already operable by keyboard and screen reader.
 */
export default function PostImageUploader({ postId, onUploaded, registerPending }) {
  const uid = useId();
  const ids = {
    arquivo: `${uid}-arquivo`,
    arquivoAjuda: `${uid}-arquivo-ajuda`,
    arquivoErro: `${uid}-arquivo-erro`,
    bucket: `${uid}-bucket`,
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
  // "novo" = upload a file from the computer; "bucket" = pick an image already in Supabase Storage
  const [origem, setOrigem] = useState("novo");
  const [bucket, setBucket] = useState(null);
  const [erroBucket, setErroBucket] = useState("");
  const [escolhida, setEscolhida] = useState(null);
  const [ampliada, setAmpliada] = useState(null); // { src, alt } shown at real size

  // Releases the temporary preview URL when it changes or the component unmounts.
  useEffect(() => () => previa && URL.revokeObjectURL(previa), [previa]);

  useEffect(() => {
    if (origem !== "bucket" || bucket !== null) return;
    assetsApi
      .storageList()
      .then(({ data }) => setBucket(data))
      .catch((err) => {
        setBucket([]);
        setErroBucket(mensagemDeErro(err, "Could not open the bucket."));
      });
  }, [origem, bucket]);

  function limparSelecao() {
    setArquivo(null);
    setPrevia("");
    setAltText("");
    setEscolhida(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function trocarOrigem(nova) {
    if (nova === origem) return;
    limparSelecao();
    setErroArquivo("");
    setErroEnvio("");
    setAviso("");
    setOrigem(nova);
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

  function handleSalvar(e) {
    e.preventDefault();
    if (!selecionou || !altTextValido(altText) || enviando) return;
    salvar().catch(() => {}); // the error is already shown under the form
  }

  // Also called by the post's main Save button, so a chosen image is never dropped.
  async function salvar() {
    setEnviando(true);
    setErroEnvio("");
    setAviso("");
    try {
      const { data } =
        origem === "bucket"
          ? await assetsApi.fromStorage(postId, escolhida.path, altText.trim())
          : await assetsApi.upload(postId, arquivo, altText.trim());
      limparSelecao();
      setBucket(null); // reload the list: a new upload also lands in the bucket
      setAviso(
        data.public_url
          ? "Image saved and published to the bucket."
          : "Image saved on this computer only (bucket not configured)."
      );
      onUploaded?.(data);
    } catch (err) {
      setErroEnvio(mensagemDeErro(err, "Could not upload the image. Try again."));
      throw err;
    } finally {
      setEnviando(false);
    }
  }

  const altOk = altTextValido(altText);
  const selecionou = origem === "bucket" ? Boolean(escolhida) : Boolean(arquivo);

  // Tells the post modal there is a chosen image that is not saved yet.
  const salvarRef = useRef(salvar);
  salvarRef.current = salvar;
  useEffect(() => {
    registerPending?.(selecionou ? { altOk, save: () => salvarRef.current() } : null);
  }, [registerPending, selecionou, altOk]);
  useEffect(() => () => registerPending?.(null), [registerPending]);
  const podeSalvar = selecionou && altOk && !enviando;
  const faltaAlt = selecionou && !altOk;

  const abaClasse = (ativa) =>
    `px-3 py-1.5 rounded-md text-sm font-medium ${FOCO} ${
      ativa ? "bg-flowity-purple text-bg-base" : "text-text-secondary hover:text-text-primary"
    }`;

  return (
    <form className="space-y-3" onSubmit={handleSalvar} noValidate>
      <div role="group" aria-label="Image source" className="inline-flex gap-1 rounded-lg border border-border p-1">
        <button type="button" aria-pressed={origem === "novo"} className={abaClasse(origem === "novo")}
          onClick={() => trocarOrigem("novo")}>
          Upload new
        </button>
        <button type="button" aria-pressed={origem === "bucket"} className={abaClasse(origem === "bucket")}
          onClick={() => trocarOrigem("bucket")}>
          Choose from bucket
        </button>
      </div>

      {origem === "bucket" && (
        <div>
          <label htmlFor={ids.bucket} className="label">
            Image from the post-images bucket
          </label>
          {bucket === null && <p className="text-sm text-text-secondary">Loading...</p>}
          {erroBucket && (
            <p role="alert" className="text-sm text-red-300 font-medium">Error: {erroBucket}</p>
          )}
          {bucket?.length === 0 && !erroBucket && (
            <p className="text-sm text-text-secondary">The bucket has no images yet.</p>
          )}
          {bucket?.length > 0 && (
            <>
              <BucketImagePicker
                id={ids.bucket}
                images={bucket}
                value={escolhida?.path || ""}
                onChange={setEscolhida}
              />
              {escolhida && (
                <figure className="mt-2 rounded-lg border border-border bg-bg-base p-2 inline-block">
                  <button type="button" className={`block rounded cursor-zoom-in ${FOCO}`}
                    onClick={() => setAmpliada({ src: escolhida.url, alt: `Bucket image: ${escolhida.path}` })}
                    aria-label={`See ${escolhida.path} at real size`}>
                    <img src={escolhida.url} alt={`Bucket image: ${escolhida.path}`}
                      className="max-h-48 max-w-full rounded" />
                  </button>
                  <figcaption className="text-xs text-text-secondary mt-1">{escolhida.path} · click to see real size</figcaption>
                </figure>
              )}
            </>
          )}
        </div>
      )}

      {origem === "novo" && (
      <div>
        <label htmlFor={ids.arquivo} className="label">
          Choose image
        </label>
        <input
          ref={inputRef}
          id={ids.arquivo}
          type="file"
          accept="image/png,image/jpeg,image/gif"
          onChange={handleArquivo}
          aria-describedby={`${ids.arquivoAjuda}${erroArquivo ? ` ${ids.arquivoErro}` : ""}`}
          aria-invalid={erroArquivo ? "true" : undefined}
          className={`block w-full text-sm text-text-secondary rounded-lg
            file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-border
            file:bg-bg-elevated file:text-text-primary file:text-sm file:font-medium file:cursor-pointer
            ${FOCO}`}
        />
        <p id={ids.arquivoAjuda} className="text-xs text-text-secondary mt-1">
          PNG, JPEG or GIF, up to 5 MB.
        </p>
        {erroArquivo && (
          <p id={ids.arquivoErro} role="alert" className="text-sm text-red-300 mt-1 font-medium">
            Error: {erroArquivo}
          </p>
        )}
      </div>
      )}

      {previa && (
        <figure className="rounded-lg border border-border bg-bg-base p-2 inline-block">
          <button type="button" className={`block rounded cursor-zoom-in ${FOCO}`}
            onClick={() => setAmpliada({ src: previa, alt: `Preview of file ${arquivo?.name}` })}
            aria-label={`See ${arquivo?.name} at real size`}>
            <img
              src={previa}
              alt={tamanhoAlt(altText) ? altText.trim() : `Preview of file ${arquivo?.name}`}
              className="max-h-48 max-w-full rounded"
            />
          </button>
          <figcaption className="text-xs text-text-secondary mt-1">
            Preview: {arquivo?.name} · click to see real size
          </figcaption>
        </figure>
      )}

      <div>
        <label htmlFor={ids.alt} className="label inline-flex items-center gap-2">
          Alt text (required)
          {faltaAlt && <IssueDot issues={[{ message: "Write the alt text, or this image will not be saved." }]} />}
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
          placeholder="Describe what the image shows for people who cannot see it."
        />
        <p id={ids.altAjuda} className="text-xs text-text-secondary mt-1">
          Describe the content and purpose of the image, {ALT_MIN} to {ALT_MAX} characters.
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
          {enviando ? "Uploading..." : "Save image"}
        </button>
        {!selecionou && !erroArquivo && (
          <span className="text-xs text-text-secondary">Choose an image to enable uploading.</span>
        )}
        {faltaAlt && (
          <span className="text-xs text-amber-300">
            Fill in the alt text with at least {ALT_MIN} characters to save.
          </span>
        )}
      </div>

      {erroEnvio && (
        <p role="alert" className="text-sm text-red-300 font-medium">
          Error: {erroEnvio}
        </p>
      )}
      <p role="status" aria-live="polite" className="text-sm text-emerald-300">
        {aviso}
      </p>
      {ampliada && <ImageLightbox src={ampliada.src} alt={ampliada.alt} onClose={() => setAmpliada(null)} />}
    </form>
  );
}
