<!-- TITLE: [PI2][P1][Frontend] Exportar e baixar o carrossel (PNG dos slides e PDF do LinkedIn) -->
<!-- LABELS: area:frontend,prio:p1,sprint:pi2 -->

## Contexto (PI 2)

Depois que a issue PI2-08 monta o carrossel e o backend renderiza os arquivos, o editor ainda precisa levar o material para fora da ferramenta: o LinkedIn não aceita upload por API para carrossel em documento, então a publicação é manual e depende de baixar o PDF e a legenda. Esta issue entrega a área de exportação da `CarouselPage`: dois botões de download com estado de carregamento acessível, tratamento visível de erro, um botão "Copiar legenda" e um painel de checklist que valida, antes do download, as regras de publicação do LinkedIn - proporção 4:5, no máximo 10 páginas e alt text preenchido em todos os slides. O checklist é também o último ponto de controle de acessibilidade do fluxo, exigido pela Lei 13.146/2015 e pelo eMAG.

## Integrante responsável

Tiago Antonio Ferreira

## Branch

`feat/pi2-11-exportacao-carrossel-download`

## Estimativa

8 a 12 horas

## Arquivos que você vai criar ou editar

- `frontend/src/lib/api.js` - EDITAR. Helper `apiDownload` usando `responseType: "blob"`.
- `frontend/src/components/carousel/CarouselExport.jsx` - CRIAR. Botões "Baixar PDF" e "Baixar slides (ZIP/PNG)" com `aria-busy` e mensagens de erro.
- `frontend/src/components/carousel/PublishChecklist.jsx` - CRIAR. Painel "Checklist de publicação no LinkedIn" com validações e botão "Copiar legenda".
- `frontend/src/pages/CarouselPage.jsx` - EDITAR. Renderizar a área de exportação abaixo do builder quando o carrossel já tiver sido gerado.

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-11-exportacao-carrossel-download
```

**Passo 2 - Adicionar o helper `apiDownload` em `frontend/src/lib/api.js`**

O arquivo exporta a instância `api` como default e objetos por domínio. Adicione a função abaixo logo antes do `export default api;`, mantendo o mesmo estilo do restante:

```js
/**
 * Baixa um arquivo do backend preservando o cabecalho Authorization.
 * Um <a href> simples nao envia o JWT, por isso buscamos como blob e
 * criamos uma URL temporaria de objeto para o download.
 */
export async function apiDownload(url, nomeArquivo) {
  const { data, headers } = await api.get(url, { responseType: "blob" });

  const tipo = headers["content-type"] || "application/octet-stream";
  const blob = new Blob([data], { type: tipo });
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Libera a memoria depois que o navegador iniciou o download.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
```

Atenção a um detalhe do interceptor de resposta já existente: quando a resposta é um blob, o corpo de erro do FastAPI também chega como blob, então `error.response.data.detail` não existe. Trate isso no componente, não no interceptor.

**Passo 3 - Criar `frontend/src/components/carousel/CarouselExport.jsx`**

```jsx
import React, { useState } from "react";
import { FileDown, Images } from "lucide-react";
import { apiDownload } from "../../lib/api";

export default function CarouselExport({ postId, totalSlides, bloqueado }) {
  const [baixando, setBaixando] = useState(null); // "pdf" | "png" | null
  const [erro, setErro] = useState(null);
  const [status, setStatus] = useState("");

  async function baixar(tipo) {
    setBaixando(tipo);
    setErro(null);
    setStatus(tipo === "pdf" ? "Preparando o PDF..." : "Preparando os slides em PNG...");

    const rota =
      tipo === "pdf"
        ? `/posts/${postId}/render/carousel/pdf`
        : `/posts/${postId}/render/carousel/zip`;
    const nome =
      tipo === "pdf"
        ? `flowity-post-${postId}-carrossel.pdf`
        : `flowity-post-${postId}-slides.zip`;

    try {
      await apiDownload(rota, nome);
      setStatus(`Download de ${nome} iniciado.`);
    } catch (err) {
      setStatus("");
      const semRede = !err.response;
      setErro(
        semRede
          ? "Sem conexão com o servidor. Verifique se o backend está no ar e tente de novo."
          : `Não foi possível gerar o arquivo (erro ${err.response.status}). Gere o carrossel novamente e repita o download.`
      );
    } finally {
      setBaixando(null);
    }
  }

  return (
    <section aria-labelledby="titulo-exportacao" className="card space-y-3">
      <h2 id="titulo-exportacao" className="text-lg font-semibold text-text-primary">
        Exportar carrossel
      </h2>

      <p className="text-xs text-text-muted">
        O PDF é o arquivo que você anexa no LinkedIn como documento. Os PNGs servem
        para revisão, aprovação do cliente ou publicação em outras redes.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => baixar("pdf")}
          disabled={bloqueado || baixando !== null}
          aria-busy={baixando === "pdf" ? "true" : undefined}
        >
          <FileDown size={14} aria-hidden="true" />
          {baixando === "pdf" ? "Gerando PDF..." : "Baixar PDF"}
        </button>

        <button
          type="button"
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => baixar("png")}
          disabled={bloqueado || baixando !== null}
          aria-busy={baixando === "png" ? "true" : undefined}
        >
          <Images size={14} aria-hidden="true" />
          {baixando === "png" ? "Gerando slides..." : `Baixar slides (ZIP/PNG, ${totalSlides})`}
        </button>
      </div>

      {bloqueado && (
        <p className="text-xs text-status-scheduled font-medium">
          Resolva os itens pendentes do checklist abaixo para liberar o download.
        </p>
      )}

      {/* Regiao viva: o leitor de tela anuncia inicio e fim do download */}
      <p aria-live="polite" className="text-xs text-text-secondary min-h-4">{status}</p>

      {erro && (
        <p role="alert" className="text-xs text-status-failed font-medium">
          {erro}
        </p>
      )}
    </section>
  );
}
```

**Passo 4 - Criar `frontend/src/components/carousel/PublishChecklist.jsx`**

O checklist é calculado a partir dos dados reais, nunca marcado à mão. Ele bloqueia o download quando algum item obrigatório falha.

```jsx
import React, { useState } from "react";
import { Check, AlertTriangle, Copy } from "lucide-react";

const MAX_PAGINAS = 10;

export function montarChecklist(slides, assets, post) {
  const semAlt = assets.filter(
    (a) => !a.alt_text || a.alt_text.trim().length < 10
  );

  const foraDaProporcao = assets.filter(
    (a) => a.width && a.height && Math.abs(a.width / a.height - 4 / 5) > 0.01
  );

  return [
    {
      id: "proporcao",
      ok: foraDaProporcao.length === 0,
      obrigatorio: true,
      rotulo: "Todos os slides na proporção 4:5 (1080x1350)",
      detalhe:
        foraDaProporcao.length === 0
          ? `${assets.length} slide(s) conferido(s).`
          : `${foraDaProporcao.length} slide(s) fora de 4:5. Gere o carrossel de novo.`,
    },
    {
      id: "paginas",
      ok: slides.length <= MAX_PAGINAS,
      obrigatorio: true,
      rotulo: `No máximo ${MAX_PAGINAS} páginas`,
      detalhe: `Este carrossel tem ${slides.length} página(s).`,
    },
    {
      id: "alt",
      ok: assets.length > 0 && semAlt.length === 0,
      obrigatorio: true,
      rotulo: "Todos os slides com texto alternativo preenchido",
      detalhe:
        assets.length === 0
          ? "Nenhum slide gerado ainda."
          : semAlt.length === 0
          ? `${assets.length}/${assets.length} slides descritos.`
          : `${semAlt.length} slide(s) sem descrição. Volte ao PostModal e preencha o alt text.`,
    },
    {
      id: "legenda",
      ok: Boolean((post.body || "").trim()) && Boolean((post.cta || "").trim()),
      obrigatorio: false,
      rotulo: "Legenda com corpo e chamada para ação",
      detalhe: "Recomendado: a legenda sustenta o alcance do documento.",
    },
  ];
}

export function montarLegenda(post) {
  return [post.hook, post.body, post.cta].filter(Boolean).join("\n\n");
}

export default function PublishChecklist({ slides, assets, post }) {
  const [copiado, setCopiado] = useState(false);
  const [erroCopia, setErroCopia] = useState(null);
  const itens = montarChecklist(slides, assets, post);
  const legenda = montarLegenda(post);

  async function copiarLegenda() {
    setErroCopia(null);
    try {
      await navigator.clipboard.writeText(legenda);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      setErroCopia(
        "O navegador bloqueou a cópia automática. Selecione o texto abaixo e use Ctrl+C."
      );
    }
  }

  return (
    <section aria-labelledby="titulo-checklist" className="card space-y-4">
      <h2 id="titulo-checklist" className="text-lg font-semibold text-text-primary">
        Checklist de publicação no LinkedIn
      </h2>

      <ul className="space-y-2">
        {itens.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <span
              className={item.ok ? "text-status-published" : "text-status-scheduled"}
              aria-hidden="true"
            >
              {item.ok ? <Check size={16} /> : <AlertTriangle size={16} />}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-text-primary">
                {item.rotulo}
                <span className="sr-only">
                  {item.ok ? " - item aprovado" : " - item pendente"}
                </span>
                {item.obrigatorio && (
                  <span className="text-[10px] text-text-muted ml-2 uppercase tracking-wide">
                    obrigatório
                  </span>
                )}
              </p>
              <p className="text-xs text-text-muted">{item.detalhe}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <label className="label" htmlFor="legenda-post">
          Legenda do post
        </label>
        <textarea
          id="legenda-post"
          className="textarea"
          rows={6}
          readOnly
          value={legenda}
          aria-describedby="legenda-ajuda"
        />
        <div className="flex items-center gap-3">
          <button type="button" className="btn-secondary" onClick={copiarLegenda}>
            <Copy size={14} aria-hidden="true" />
            Copiar legenda
          </button>
          <p id="legenda-ajuda" aria-live="polite" className="text-xs text-text-secondary">
            {copiado ? "Legenda copiada para a área de transferência." : ""}
          </p>
        </div>
        {erroCopia && (
          <p role="alert" className="text-xs text-status-failed font-medium">{erroCopia}</p>
        )}
      </div>
    </section>
  );
}
```

**Passo 5 - Integrar na `CarouselPage.jsx`**

Importe os dois componentes e a função de checklist, e renderize a área de exportação depois do builder. O download só é liberado quando todos os itens obrigatórios passam:

```jsx
import CarouselExport from "../components/carousel/CarouselExport";
import PublishChecklist, { montarChecklist } from "../components/carousel/PublishChecklist";
```

```jsx
      <CarouselBuilder
        postId={post.id}
        slidesIniciais={slides}
        onGerado={(dados) => {
          setResultado(dados);
          setAssets(dados.slides || []);
        }}
      />

      {resultado && (
        <>
          <PublishChecklist slides={slides} assets={assets} post={post} />
          <CarouselExport
            postId={post.id}
            totalSlides={slides.length}
            bloqueado={montarChecklist(slides, assets, post).some(
              (i) => i.obrigatorio && !i.ok
            )}
          />
        </>
      )}
```

Adicione também o estado `assets` na página, se ele ainda não existir:

```jsx
  const [assets, setAssets] = useState([]);
```

**Passo 6 - Testar manualmente**

```bash
cd frontend
npm run dev
```

Roteiro:
1. Gere um carrossel de 5 slides em `/carousel/1`.
2. Deixe um slide sem alt text: o item "Todos os slides com texto alternativo preenchido" deve aparecer pendente e os dois botões de download devem ficar desabilitados.
3. Preencha o alt text que faltava, gere de novo e confirme que os botões liberam.
4. Clique em "Baixar PDF" e observe o texto do botão mudar para "Gerando PDF..." e o atributo `aria-busy="true"` no DevTools.
5. Derrube o backend (`docker compose stop backend`) e clique de novo: deve aparecer a mensagem de erro de conexão em `role="alert"`, sem quebrar a página.
6. Clique em "Copiar legenda" e cole em um editor de texto para confirmar o conteúdo.

**Passo 7 - Commit e Pull Request**

```bash
git add frontend/src/lib/api.js \
        frontend/src/components/carousel/CarouselExport.jsx \
        frontend/src/components/carousel/PublishChecklist.jsx \
        frontend/src/pages/CarouselPage.jsx

git commit -m "feat(carousel): exportacao do carrossel em PDF e PNG com checklist de publicacao

Adiciona o helper apiDownload em lib/api.js usando responseType blob,
URL.createObjectURL e link com atributo download, preservando o cabecalho
Authorization. Cria CarouselExport com os botoes Baixar PDF e Baixar slides,
estado de carregamento com aria-busy, anuncio por regiao aria-live e
tratamento visivel de erro de rede. Cria PublishChecklist que valida
proporcao 4:5, limite de 10 paginas e alt text em todos os slides, bloqueando
o download enquanto houver item obrigatorio pendente, alem do botao
Copiar legenda com fallback manual."

git push -u origin feat/pi2-11-exportacao-carrossel-download
```

Abra o PR para `main` com o título "PI2-11: exportação e download do carrossel" e escreva `Closes #<numero-da-issue>` no corpo.

## Exemplo de uso

```text
ESTADO 1 - carrossel gerado, mas um slide sem descricao
-------------------------------------------------------
Checklist de publicacao no LinkedIn
  [v] Todos os slides na proporcao 4:5 (1080x1350)      OBRIGATORIO
      5 slide(s) conferido(s).
  [v] No maximo 10 paginas                              OBRIGATORIO
      Este carrossel tem 5 pagina(s).
  [!] Todos os slides com texto alternativo preenchido  OBRIGATORIO
      1 slide(s) sem descricao. Volte ao PostModal e preencha o alt text.
  [v] Legenda com corpo e chamada para acao

Exportar carrossel
  [ Baixar PDF ]  (desabilitado)   [ Baixar slides (ZIP/PNG, 5) ]  (desabilitado)
  "Resolva os itens pendentes do checklist abaixo para liberar o download."

ESTADO 2 - tudo aprovado, download em andamento
-----------------------------------------------
  [ Gerando PDF... ]   aria-busy="true"
  aria-live: "Preparando o PDF..."

  GET /posts/17/render/carousel/pdf   (responseType: blob, Authorization: Bearer ...)
  200  content-type: application/pdf   1,8 MB
  -> blob -> URL.createObjectURL -> <a download="flowity-post-17-carrossel.pdf">.click()

  aria-live: "Download de flowity-post-17-carrossel.pdf iniciado."

ESTADO 3 - backend fora do ar
-----------------------------
  role="alert": "Sem conexao com o servidor. Verifique se o backend esta
                 no ar e tente de novo."
  Os botoes voltam ao estado normal, a pagina nao quebra.

COPIAR LEGENDA
--------------
  Clique -> navigator.clipboard.writeText(...)
  aria-live: "Legenda copiada para a area de transferencia."
  Conteudo colado:
    Seu time responde rapido. Mas responde a coisa certa?

    Toda empresa acha que ouve o cliente. Poucas conseguem provar.
    ...

    Comente 'sinal' e eu mando o mapa de leitura.
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Slides com alt text antes da exportação | Checklist calculado sobre `GET /posts/{id}/assets` | 100% - download bloqueado enquanto houver 1 slide sem descrição |
| Sucesso do download | Baixar PDF e ZIP 5 vezes cada e abrir os arquivos | 10/10 downloads com arquivo íntegro e nome correto |
| Conformidade do PDF com o LinkedIn | Abrir o PDF e conferir número de páginas e proporção | <= 10 páginas e todas em 4:5 |
| Violações do axe DevTools na área de exportação | Scan com o checklist e os botões renderizados | 0 violações críticas ou sérias |
| Erro de rede tratado visivelmente | Parar o backend e clicar nos dois botões | 2/2 mensagens `role="alert"` exibidas, 0 erros não tratados no console |

## Definition of Done

- [ ] Helper `apiDownload` adicionado em `frontend/src/lib/api.js` com `responseType: "blob"`, `URL.createObjectURL` e `<a download>`
- [ ] `URL.revokeObjectURL` chamado após o download para liberar memória
- [ ] `CarouselExport.jsx` criado com os botões "Baixar PDF" e "Baixar slides (ZIP/PNG)"
- [ ] Estado de carregamento com `aria-busy="true"` e texto do botão alterado durante o download
- [ ] Erros de rede e de servidor exibidos visivelmente com `role="alert"`, sem travar a página
- [ ] `PublishChecklist.jsx` criado, calculando os itens a partir dos dados reais dos assets
- [ ] Checklist verifica proporção 4:5, limite de 10 páginas e alt text preenchido em todos os slides
- [ ] Download bloqueado enquanto houver item obrigatório pendente
- [ ] Botão "Copiar legenda" funcional, com anúncio por `aria-live` e alternativa manual quando o navegador bloqueia a área de transferência
- [ ] Área de exportação integrada na `CarouselPage.jsx` e exibida apenas após o carrossel ser gerado
- [ ] `npm run build` executa sem erros
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- MDN, `URL.createObjectURL()`: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
- MDN, `URL.revokeObjectURL()`: https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static
- MDN, atributo `download` do elemento `<a>`: https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/a#download
- MDN, `Blob`: https://developer.mozilla.org/pt-BR/docs/Web/API/Blob
- MDN, API da Área de Transferência (`navigator.clipboard`): https://developer.mozilla.org/pt-BR/docs/Web/API/Clipboard_API
- Axios, `responseType` na configuração da requisição: https://axios-http.com/docs/req_config
- MDN, `aria-busy`: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-busy
- WCAG 2.1, critério 4.1.3 Mensagens de Status: https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html
- WCAG 2.1, critério 3.3.1 Identificação de Erro: https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html
- WCAG 2.1, critério 1.1.1 Conteúdo Não Textual: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
- eMAG - Modelo de Acessibilidade em Governo Eletrônico: https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/eMAGv31.pdf/view
- Lei 13.146/2015 (Lei Brasileira de Inclusão), art. 63: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
