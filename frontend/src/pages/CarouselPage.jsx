import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CarouselBuilder from "../components/carousel/CarouselBuilder";
import CarouselExport from "../components/carousel/CarouselExport";
import PublishChecklist from "../components/carousel/PublishChecklist";
import { FOCO } from "../components/carousel/SlideCard";
import { assetsApi, mediaUrl, postsApi } from "../lib/api";
import { mensagemDeErro } from "../lib/imageUpload.mjs";
import { slidesDoPost } from "../lib/carouselSlides.mjs";

/** Simple preview of the current slide, in the 4:5 ratio of a LinkedIn document. */
function SlidePreview({ textos, atual }) {
  const total = textos.length;
  const indice = Math.min(atual, Math.max(total - 1, 0));
  const texto = textos[indice] || "";
  const capa = indice === 0;

  return (
    <figure className="space-y-2">
      <div
        className="relative w-full aspect-[4/5] rounded-xl border border-border overflow-hidden flex flex-col"
        style={{ backgroundColor: "#07080F" }}
      >
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #9C83F7, #1CD8DE)" }} />
        <div className="flex-1 flex items-center px-[8%]">
          <p
            className={`whitespace-pre-line break-words ${
              capa ? "text-2xl xl:text-3xl font-bold text-text-primary leading-tight" : "text-lg xl:text-xl text-text-primary leading-snug"
            }`}
          >
            {texto.trim() || <span className="text-text-secondary italic">Slide has no text</span>}
          </p>
        </div>
        <div className="flex items-center justify-between px-[8%] pb-5 text-sm">
          <span className="font-semibold text-flowity-cyan">Flowity</span>
          <span className="text-text-secondary tabular-nums">
            {indice + 1}/{total}
          </span>
        </div>
      </div>
      <figcaption className="text-xs text-text-secondary">
        Preview of slide {indice + 1} of {total}. Click or Tab to a slide in the list to see it here.
      </figcaption>
    </figure>
  );
}

/** Slides the backend generated (PNG 1080x1350), each with the alt text that came from the API. */
function CarrosselGerado({ carrossel }) {
  const slides = Array.isArray(carrossel?.slides) ? carrossel.slides : [];
  const kb = carrossel?.pdf_size_bytes ? Math.round(carrossel.pdf_size_bytes / 1024) : null;
  return (
    <section aria-labelledby="gerado-titulo" className="card space-y-3">
      <h2 id="gerado-titulo" className="text-base font-semibold text-text-primary">
        Carousel generated
      </h2>
      <p className="text-sm text-text-secondary">
        {carrossel?.total_slides ?? slides.length} slides as 1080x1350 PNG and a PDF
        {kb ? ` of ${kb} KB` : ""}, ready to upload as a document on LinkedIn.
      </p>
      {carrossel?.pdf_url && (
        <a href={mediaUrl(carrossel.pdf_url)} target="_blank" rel="noreferrer" className="inline-flex rounded-md border border-border px-3 py-2 text-sm font-medium hover:border-flowity-purple">
          Open carousel PDF
        </a>
      )}
      {slides.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-5 gap-2" aria-label="Generated slides">
          {slides.map((slide, i) => (
            <li key={slide.id ?? i}>
              <img
                src={mediaUrl(slide.url)}
                alt={slide.alt_text || `Slide ${i + 1} of the carousel`}
                className="w-full aspect-[4/5] object-cover rounded border border-border bg-bg-base"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function CarouselPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [slidesIniciais, setSlidesIniciais] = useState(null);
  const [slidesCarregados, setSlidesCarregados] = useState(false);
  const [estado, setEstado] = useState({ textos: [], atual: 0 });
  const [erro, setErro] = useState("");
  const [carrossel, setCarrossel] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [pdfBaixado, setPdfBaixado] = useState(false);

  // Each time a carousel is generated, reload all the post's images for the alt text checklist.
  function aoGerar(dados) {
    setCarrossel(dados);
    setPdfBaixado(false);
    setImagens(Array.isArray(dados?.slides) ? dados.slides : []);
    assetsApi
      .list(postId)
      .then(({ data }) => Array.isArray(data) && setImagens(data))
      .catch(() => {}); // if it fails, the checklist uses the slides returned by the generation
  }

  useEffect(() => {
    let ativo = true;
    setPost(null);
    setErro("");
    setSlidesCarregados(false);
    Promise.all([postsApi.get(postId), postsApi.slides.list(postId)])
      .then(([postResponse, slidesResponse]) => {
        if (!ativo) return;
        setPost(postResponse.data);
        const rows = slidesResponse.data?.slides || [];
        setSlidesIniciais(rows.length ? rows.map((row) => row.slide_text) : slidesDoPost(postResponse.data));
        setSlidesCarregados(true);
      })
      .catch(async (err) => {
        if (!ativo) return;
        try {
          const { data } = await postsApi.get(postId);
          if (!ativo) return;
          setPost(data);
          setSlidesIniciais(slidesDoPost(data));
          setSlidesCarregados(true);
        } catch (postError) {
          if (ativo) setErro(mensagemDeErro(postError || err, "Could not load the post."));
        }
      });
    return () => {
      ativo = false;
    };
  }, [postId]);

  useEffect(() => {
    if (!post?.id || !slidesCarregados || estado.textos.length < 3 || estado.textos.length > 10 || estado.textos.some((texto) => !texto.trim())) return undefined;
    const timeout = window.setTimeout(() => {
      postsApi.slides.save(post.id, estado.textos)
        .catch((err) => setErro(mensagemDeErro(err, "Could not save the slide texts.")));
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [post?.id, slidesCarregados, estado.textos]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <header className="space-y-2">
        <Link
          to="/pipeline"
          className={`inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary rounded ${FOCO}`}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Pipeline
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">LinkedIn carousel</h1>
        {post && (
          <p className="text-sm text-text-secondary">
            Post #{post.id}: {post.hook}
          </p>
        )}
      </header>

      {erro && (
        <p role="alert" className="text-sm text-red-300 font-medium">
          Error: {erro}
        </p>
      )}
      {!post && !erro && <p className="text-sm text-text-secondary">Loading the post...</p>}
      {post && !slidesCarregados && !erro && <p role="status" className="text-sm text-text-secondary">Loading saved slides...</p>}

      {post && slidesCarregados && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] gap-8 items-start">
          <CarouselBuilder
            key={post.id}
            postId={post.id}
            slidesIniciais={slidesIniciais || slidesDoPost(post)}
            onChange={setEstado}
            onGerado={aoGerar}
          />
          <aside aria-labelledby="previa-titulo" className="lg:sticky lg:top-6 space-y-3">
            <h2 id="previa-titulo" className="text-base font-semibold text-text-primary">
              Preview
            </h2>
            <SlidePreview textos={estado.textos} atual={estado.atual} />
          </aside>
        </div>
      )}

      {/* Download and checklist only appear after the carousel has been generated at least once */}
      {carrossel && post && (
        <div className="space-y-6">
          <CarrosselGerado carrossel={carrossel} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <CarouselExport post={post} carrossel={carrossel} onBaixado={() => setPdfBaixado(true)} />
            <PublishChecklist
              post={post}
              totalSlides={carrossel.total_slides ?? carrossel.slides?.length ?? 0}
              imagens={imagens}
              pdfBaixado={pdfBaixado}
            />
          </div>
        </div>
      )}
    </div>
  );
}
