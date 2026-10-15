import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CarouselBuilder from "../components/carousel/CarouselBuilder";
import { FOCO } from "../components/carousel/SlideCard";
import { mediaUrl, postsApi } from "../lib/api";
import { mensagemDeErro } from "../lib/imageUpload.mjs";
import { slidesDoPost } from "../lib/carouselSlides.mjs";

/** Pré-visualização simples do slide atual, na proporção 4:5 do documento do LinkedIn. */
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
            {texto.trim() || <span className="text-text-secondary italic">Slide sem texto</span>}
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
        Pré-visualização do slide {indice + 1} de {total}. Clique ou use Tab num slide da lista para vê-lo aqui.
      </figcaption>
    </figure>
  );
}

/** Slides que o backend gerou (PNG 1080x1350), cada um com o texto alternativo que veio da API. */
function CarrosselGerado({ carrossel }) {
  const slides = Array.isArray(carrossel?.slides) ? carrossel.slides : [];
  const kb = carrossel?.pdf_size_bytes ? Math.round(carrossel.pdf_size_bytes / 1024) : null;
  return (
    <section aria-labelledby="gerado-titulo" className="card space-y-3">
      <h2 id="gerado-titulo" className="text-base font-semibold text-text-primary">
        Carrossel gerado
      </h2>
      <p className="text-sm text-text-secondary">
        {carrossel?.total_slides ?? slides.length} slides em PNG 1080x1350 e um PDF
        {kb ? ` de ${kb} KB` : ""}, pronto para subir como documento no LinkedIn.
      </p>
      {carrossel?.pdf_url && (
        <a href={mediaUrl(carrossel.pdf_url)} target="_blank" rel="noreferrer" className="inline-flex rounded-md border border-border px-3 py-2 text-sm font-medium hover:border-flowity-purple">
          Abrir PDF do carrossel
        </a>
      )}
      {slides.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-5 gap-2" aria-label="Slides gerados">
          {slides.map((slide, i) => (
            <li key={slide.id ?? i}>
              <img
                src={mediaUrl(slide.url)}
                alt={slide.alt_text || `Slide ${i + 1} do carrossel`}
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
          if (ativo) setErro(mensagemDeErro(postError || err, "Não foi possível carregar a publicação."));
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
        .catch((err) => setErro(mensagemDeErro(err, "Não foi possível salvar os textos dos slides.")));
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
          Voltar ao Pipeline
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Carrossel do LinkedIn</h1>
        {post && (
          <p className="text-sm text-text-secondary">
            Post #{post.id}: {post.hook}
          </p>
        )}
      </header>

      {erro && (
        <p role="alert" className="text-sm text-red-300 font-medium">
          Erro: {erro}
        </p>
      )}
      {!post && !erro && <p className="text-sm text-text-secondary">Carregando o post...</p>}
      {post && !slidesCarregados && !erro && <p role="status" className="text-sm text-text-secondary">Carregando slides salvos...</p>}

      {post && slidesCarregados && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] gap-8 items-start">
          <CarouselBuilder
            key={post.id}
            postId={post.id}
            slidesIniciais={slidesIniciais || slidesDoPost(post)}
            onChange={setEstado}
            onGerado={setCarrossel}
          />
          <aside aria-labelledby="previa-titulo" className="lg:sticky lg:top-6 space-y-3">
            <h2 id="previa-titulo" className="text-base font-semibold text-text-primary">
              Pré-visualização
            </h2>
            <SlidePreview textos={estado.textos} atual={estado.atual} />
          </aside>
        </div>
      )}

      {carrossel && <CarrosselGerado carrossel={carrossel} />}
    </div>
  );
}
