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
  const [erro, setErro] = useState("");
  const [estado, setEstado] = useState({ textos: [], atual: 0 });
  const [carrossel, setCarrossel] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [pdfBaixado, setPdfBaixado] = useState(false);

  // A cada carrossel gerado, relê todas as imagens do post para a checklist de alt text.
  function aoGerar(dados) {
    setCarrossel(dados);
    setPdfBaixado(false);
    setImagens(Array.isArray(dados?.slides) ? dados.slides : []);
    assetsApi
      .list(postId)
      .then(({ data }) => Array.isArray(data) && setImagens(data))
      .catch(() => {}); // se falhar, a checklist usa os slides devolvidos pela geração
  }

  useEffect(() => {
    let ativo = true;
    setPost(null);
    setErro("");
    postsApi
      .get(postId)
      .then(({ data }) => ativo && setPost(data))
      .catch((err) => ativo && setErro(mensagemDeErro(err, "Não foi possível carregar o post.")));
    return () => {
      ativo = false;
    };
  }, [postId]);

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

      {post && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] gap-8 items-start">
          <CarouselBuilder
            key={post.id}
            postId={post.id}
            slidesIniciais={slidesDoPost(post)}
            onChange={setEstado}
            onGerado={aoGerar}
          />
          <aside aria-labelledby="previa-titulo" className="lg:sticky lg:top-6 space-y-3">
            <h2 id="previa-titulo" className="text-base font-semibold text-text-primary">
              Pré-visualização
            </h2>
            <SlidePreview textos={estado.textos} atual={estado.atual} />
          </aside>
        </div>
      )}

      {/* Download e checklist só aparecem depois que o carrossel foi gerado ao menos uma vez */}
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
