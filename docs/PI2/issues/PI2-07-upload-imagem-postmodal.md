<!-- TITLE: [PI2][P0][Frontend] Upload e pré-visualização de imagem no PostModal com alt text obrigatório -->
<!-- LABELS: area:frontend,prio:p0,sprint:pi2 -->

## Contexto (PI 2)

No PI 1 o Flowity Content Engine gerava apenas texto: hook, body, CTA e versão curta para o X. O PI 2 acrescenta imagens aos posts, e a primeira peça dessa entrega é permitir que o editor anexe uma imagem diretamente no `PostModal`, veja a pré-visualização antes de salvar e descreva a imagem em um campo de texto alternativo. O alt text não é opcional: a Lei 13.146/2015 (LBI) e o critério 1.1.1 da WCAG 2.1 exigem alternativa textual para conteúdo não textual, e o modelo eMAG recomenda a mesma prática. Esta issue implementa o formulário de upload no frontend consumindo os endpoints de assets criados nas issues de backend PI2-01 a PI2-06.

## Integrante responsável

Pedro Luiz Simonetti Filho

## Branch

`feat/pi2-07-upload-imagem-postmodal`

## Estimativa

10 a 14 horas

## Arquivos que você vai criar ou editar

- `frontend/src/components/posts/PostImageUploader.jsx` - CRIAR. Drop zone + `<input type="file">` acessível, validação client-side, preview local e campo de texto alternativo obrigatório.
- `frontend/src/components/posts/PostAssetList.jsx` - CRIAR. Lista as imagens já enviadas do post, permite editar o alt text e remover um asset.
- `frontend/src/components/posts/PostModal.jsx` - EDITAR. Nova seção "Imagens do post" entre o campo "X version" e o bloco de Status/Channel; carrega os assets quando o modal abre.
- `frontend/src/lib/api.js` - EDITAR. Novo objeto `assetsApi` com `upload`, `list`, `update`, `remove` e `reorder`.

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-07-upload-imagem-postmodal
```

**Passo 2 - Adicionar os helpers de API em `frontend/src/lib/api.js`**

O arquivo já exporta objetos por domínio (`sourcesApi`, `postsApi`, `generationApi`) usando a instância `api` do axios. Siga exatamente esse padrão. Adicione o bloco abaixo logo depois de `postsApi` e antes de `// GENERATION`:

```js
// ASSETS (PI 2 - imagens e slides de carrossel)
export const assetsApi = {
  list: (postId) => api.get(`/posts/${postId}/assets`),

  // multipart: o axios monta o boundary sozinho quando o body é FormData,
  // por isso passamos Content-Type undefined para sobrescrever o default JSON.
  upload: (postId, file, altText) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt_text", altText);
    return api.post(`/posts/${postId}/assets`, formData, {
      headers: { "Content-Type": undefined },
    });
  },

  update: (assetId, data) => api.patch(`/assets/${assetId}`, data),
  remove: (assetId) => api.delete(`/assets/${assetId}`),
  reorder: (postId, ids) => api.put(`/posts/${postId}/assets/order`, { ids }),
};
```

**Passo 3 - Criar `frontend/src/components/posts/PostImageUploader.jsx`**

Regras obrigatórias deste componente:

- aceita arrastar-e-soltar E clique no seletor de arquivo;
- o `<input type="file">` é visualmente escondido mas continua focável (`sr-only`, nunca `display: none`), e tem um `<label htmlFor>` real com texto - nada de botão só com ícone;
- valida no cliente: `image/png`, `image/jpeg`, `image/webp` e tamanho máximo de 5 MB;
- gera preview local com `URL.createObjectURL` e revoga a URL no `useEffect` de limpeza;
- o campo "Texto alternativo (obrigatório)" tem contador de caracteres, mínimo 10 e máximo 300;
- o botão "Salvar imagem" fica `disabled` enquanto o alt text estiver vazio ou fora do intervalo;
- toda mensagem de erro é ligada ao input por `aria-describedby` e marcada com `role="alert"`.

```jsx
import React, { useState, useRef, useEffect, useId } from "react";
import { Upload, X, ImagePlus } from "lucide-react";
import { assetsApi } from "../../lib/api";

const TIPOS_ACEITOS = ["image/png", "image/jpeg", "image/webp"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB
const ALT_MIN = 10;
const ALT_MAX = 300;

function validarArquivo(file) {
  if (!file) return "Selecione um arquivo de imagem.";
  if (!TIPOS_ACEITOS.includes(file.type)) {
    return "Formato não aceito. Use PNG, JPEG ou WebP.";
  }
  if (file.size > TAMANHO_MAXIMO) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `A imagem tem ${mb} MB. O limite é 5 MB.`;
  }
  return null;
}

export default function PostImageUploader({ postId, onUploaded }) {
  const inputId = useId();
  const altId = useId();
  const erroArquivoId = `${inputId}-erro`;
  const erroAltId = `${altId}-erro`;
  const dicaAltId = `${altId}-dica`;

  const inputRef = useRef(null);
  const [arquivo, setArquivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [altText, setAltText] = useState("");
  const [erroArquivo, setErroArquivo] = useState(null);
  const [erroEnvio, setErroEnvio] = useState(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Libera a URL do objeto para não vazar memória.
  useEffect(() => {
    if (!arquivo) return undefined;
    const url = URL.createObjectURL(arquivo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  function receberArquivo(file) {
    const erro = validarArquivo(file);
    if (erro) {
      setErroArquivo(erro);
      setArquivo(null);
      return;
    }
    setErroArquivo(null);
    setArquivo(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setArrastando(false);
    receberArquivo(e.dataTransfer.files?.[0]);
  }

  function limpar() {
    setArquivo(null);
    setPreviewUrl(null);
    setAltText("");
    setErroArquivo(null);
    setErroEnvio(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const altValido = altText.trim().length >= ALT_MIN && altText.trim().length <= ALT_MAX;
  const podeSalvar = Boolean(arquivo) && altValido && !enviando;

  async function handleSalvar() {
    if (!podeSalvar) return;
    setEnviando(true);
    setErroEnvio(null);
    try {
      const { data } = await assetsApi.upload(postId, arquivo, altText.trim());
      onUploaded(data);
      limpar();
    } catch (err) {
      setErroEnvio(
        err.response?.data?.detail || "Não foi possível enviar a imagem. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={handleDrop}
        className={`rounded-lg border border-dashed p-6 text-center transition-colors ${
          arrastando ? "border-flowity-purple bg-flowity-purple-dim" : "border-border bg-bg-elevated"
        }`}
      >
        <ImagePlus size={22} className="mx-auto text-flowity-cyan" aria-hidden="true" />

        <p className="text-sm text-text-secondary mt-2">
          Arraste uma imagem aqui ou use o seletor abaixo.
        </p>

        <label
          htmlFor={inputId}
          className="btn-secondary mt-3 inline-flex cursor-pointer"
        >
          <Upload size={14} aria-hidden="true" />
          Escolher arquivo de imagem
        </label>

        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-describedby={erroArquivo ? erroArquivoId : undefined}
          aria-invalid={erroArquivo ? "true" : undefined}
          onChange={(e) => receberArquivo(e.target.files?.[0])}
        />

        <p className="text-[11px] text-text-muted mt-2">
          PNG, JPEG ou WebP. Tamanho máximo de 5 MB.
        </p>

        {erroArquivo && (
          <p id={erroArquivoId} role="alert" className="text-xs text-status-failed mt-2 font-medium">
            {erroArquivo}
          </p>
        )}
      </div>

      {arquivo && (
        <div className="card space-y-3">
          <div className="flex items-start gap-3">
            <img
              src={previewUrl}
              alt={altText.trim() || "Pré-visualização da imagem selecionada"}
              className="w-28 h-28 object-cover rounded-lg border border-border"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate">{arquivo.name}</p>
              <p className="text-[11px] text-text-muted">
                {(arquivo.size / 1024).toFixed(0)} KB
              </p>
              <button type="button" className="btn-ghost mt-1" onClick={limpar}>
                <X size={14} aria-hidden="true" />
                Remover seleção
              </button>
            </div>
          </div>

          <div>
            <label className="label" htmlFor={altId}>
              Texto alternativo (obrigatório)
            </label>
            <textarea
              id={altId}
              className="textarea"
              rows={3}
              value={altText}
              maxLength={ALT_MAX}
              onChange={(e) => setAltText(e.target.value)}
              aria-required="true"
              aria-invalid={altText.length > 0 && !altValido ? "true" : undefined}
              aria-describedby={`${dicaAltId} ${!altValido && altText.length > 0 ? erroAltId : ""}`.trim()}
              placeholder="Descreva o que a imagem mostra para quem não pode vê-la."
            />
            <p id={dicaAltId} className="text-[11px] text-text-muted mt-1">
              {altText.trim().length}/{ALT_MAX} caracteres (mínimo {ALT_MIN}).
            </p>
            {altText.length > 0 && !altValido && (
              <p id={erroAltId} role="alert" className="text-[11px] text-status-failed mt-1 font-medium">
                O texto alternativo precisa ter entre {ALT_MIN} e {ALT_MAX} caracteres.
              </p>
            )}
          </div>

          {erroEnvio && (
            <p role="alert" className="text-xs text-status-failed font-medium">{erroEnvio}</p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={limpar}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSalvar}
              disabled={!podeSalvar}
              aria-busy={enviando ? "true" : undefined}
            >
              {enviando ? "Enviando..." : "Salvar imagem"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Passo 4 - Garantir a classe utilitária `sr-only`**

O projeto usa Tailwind 3, que já fornece `sr-only` nativamente. Confirme rodando `npm run dev` e inspecionando o input no DevTools: ele deve ficar invisível mas continuar recebendo foco pelo Tab. Se por qualquer motivo a classe não existir, adicione em `frontend/src/styles/theme.css` dentro do `@layer components`:

```css
  /* Conteúdo só para leitores de tela (PI 2 - acessibilidade) */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
```

**Passo 5 - Criar `frontend/src/components/posts/PostAssetList.jsx`**

Lista os assets já salvos, permite corrigir o alt text sem reenviar o arquivo (`PATCH /assets/{id}`) e remover (`DELETE /assets/{id}`).

```jsx
import React, { useState } from "react";
import { Trash2, Check } from "lucide-react";
import { assetsApi } from "../../lib/api";

export default function PostAssetList({ assets = [], onChange }) {
  const [salvandoId, setSalvandoId] = useState(null);
  const [rascunhos, setRascunhos] = useState({});

  function altAtual(asset) {
    return rascunhos[asset.id] ?? asset.alt_text ?? "";
  }

  async function salvarAlt(asset) {
    const novoAlt = altAtual(asset).trim();
    if (novoAlt.length < 10) return;
    setSalvandoId(asset.id);
    try {
      const { data } = await assetsApi.update(asset.id, { alt_text: novoAlt });
      onChange(assets.map((a) => (a.id === asset.id ? data : a)));
    } finally {
      setSalvandoId(null);
    }
  }

  async function remover(asset) {
    if (!window.confirm("Remover esta imagem do post?")) return;
    await assetsApi.remove(asset.id);
    onChange(assets.filter((a) => a.id !== asset.id));
  }

  if (assets.length === 0) {
    return (
      <p className="text-xs text-text-muted italic">
        Nenhuma imagem anexada a este post ainda.
      </p>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Imagens anexadas ao post">
      {assets.map((asset) => (
        <li key={asset.id} className="card flex items-start gap-3">
          <img
            src={asset.url}
            alt={asset.alt_text || ""}
            width={asset.width}
            height={asset.height}
            className="w-20 h-20 object-cover rounded-lg border border-border"
          />
          <div className="flex-1 min-w-0">
            <label className="label" htmlFor={`alt-${asset.id}`}>
              Texto alternativo (obrigatório)
            </label>
            <textarea
              id={`alt-${asset.id}`}
              className="textarea"
              rows={2}
              maxLength={300}
              value={altAtual(asset)}
              aria-required="true"
              onChange={(e) =>
                setRascunhos((prev) => ({ ...prev, [asset.id]: e.target.value }))
              }
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-text-muted">
                {altAtual(asset).trim().length}/300 caracteres
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => salvarAlt(asset)}
                  disabled={salvandoId === asset.id || altAtual(asset).trim().length < 10}
                >
                  <Check size={14} aria-hidden="true" />
                  Salvar descrição
                </button>
                <button
                  type="button"
                  className="btn-ghost hover:text-status-failed"
                  onClick={() => remover(asset)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Remover imagem {asset.position + 1}
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

**Passo 6 - Integrar no `PostModal.jsx`**

Acrescente os imports no topo do arquivo:

```jsx
import PostImageUploader from "./PostImageUploader";
import PostAssetList from "./PostAssetList";
import { assetsApi } from "../../lib/api";
```

Adicione o estado e o carregamento dos assets logo depois do `const [saving, setSaving] = useState(false);`:

```jsx
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    if (!post?.id || mode === "create") {
      setAssets([]);
      return;
    }
    let ativo = true;
    assetsApi
      .list(post.id)
      .then(({ data }) => { if (ativo) setAssets(data); })
      .catch(() => { if (ativo) setAssets([]); });
    return () => { ativo = false; };
  }, [post?.id, mode]);
```

E insira a seção nova logo abaixo do bloco do campo "X version (max 280 chars)", antes do `grid` de Status/Channel:

```jsx
          <section aria-labelledby="secao-imagens" className="space-y-3">
            <h3 id="secao-imagens" className="text-sm font-semibold text-text-primary">
              Imagens do post
            </h3>
            <p className="text-xs text-text-muted">
              Toda imagem publicada precisa de texto alternativo. Sem descrição, o post
              não pode ser movido para <strong className="text-text-secondary">Scheduled</strong>.
            </p>

            {post?.id ? (
              <>
                <PostAssetList assets={assets} onChange={setAssets} />
                <PostImageUploader
                  postId={post.id}
                  onUploaded={(novo) => setAssets((prev) => [...prev, novo])}
                />
              </>
            ) : (
              <p className="text-xs text-text-muted italic">
                Salve o post primeiro para anexar imagens.
              </p>
            )}
          </section>
```

**Passo 7 - Bloquear agendamento sem alt text**

Dentro de `handleSave`, antes do `setSaving(true)`, adicione a regra editorial:

```jsx
    const semAlt = assets.filter((a) => !a.alt_text || a.alt_text.trim().length < 10);
    if (form.status === "scheduled" && semAlt.length > 0) {
      window.alert(
        `Existem ${semAlt.length} imagem(ns) sem texto alternativo. Descreva todas antes de agendar.`
      );
      return;
    }
```

**Passo 8 - Testar manualmente**

```bash
cd frontend
npm install
npm run dev
```

Roteiro de teste:
1. Abra um post existente no calendário ou no pipeline.
2. Tente enviar um PDF - deve aparecer a mensagem de formato não aceito, sem chamada de rede.
3. Tente enviar uma imagem acima de 5 MB - deve aparecer a mensagem de tamanho.
4. Envie um PNG válido, deixe o alt vazio e confirme que "Salvar imagem" está desabilitado.
5. Navegue só com Tab: o seletor de arquivo deve receber foco e abrir com Enter ou Espaço.

**Passo 9 - Commit e Pull Request**

```bash
git add frontend/src/components/posts/PostImageUploader.jsx \
        frontend/src/components/posts/PostAssetList.jsx \
        frontend/src/components/posts/PostModal.jsx \
        frontend/src/lib/api.js \
        frontend/src/styles/theme.css

git commit -m "feat(posts): upload de imagem no PostModal com texto alternativo obrigatorio

Adiciona PostImageUploader com drag-and-drop, seletor de arquivo acessivel,
validacao de tipo e tamanho, preview local via URL.createObjectURL e campo
de texto alternativo obrigatorio com contador de 10 a 300 caracteres.
Adiciona PostAssetList para editar o alt text e remover imagens ja salvas.
Inclui os helpers assetsApi em lib/api.js usando FormData."

git push -u origin feat/pi2-07-upload-imagem-postmodal
```

Abra o Pull Request para `main` com o título "PI2-07: upload e pré-visualização de imagem no PostModal" e escreva `Closes #<numero-da-issue>` no corpo.

## Exemplo de uso

```text
ANTES (PI 1)
------------
PostModal
  Hook / main title
  Post body
  CTA
  X version
  Status | Channel
  Schedule | Creation mode
  Notes
  [Cancel] [Save changes]

DEPOIS (PI 2)
-------------
PostModal
  Hook / main title
  Post body
  CTA
  X version
  Imagens do post                          <-- NOVO
    - lista de imagens ja anexadas, cada uma com campo de alt text
    - area de upload (arraste ou "Escolher arquivo de imagem")
  Status | Channel
  Schedule | Creation mode
  Notes
  [Cancel] [Save changes]

INTERACAO
---------
1. Editor arrasta "grafico-churn.png" (820 KB) para a area tracejada.
2. Aparece a miniatura + o campo "Texto alternativo (obrigatorio)".
   Botao "Salvar imagem" esta DESABILITADO (0/300 caracteres).
3. Editor digita: "Grafico de barras mostrando a queda de churn de 8% para
   3% entre janeiro e junho de 2026."  -> 96/300, botao HABILITA.
4. Clique em "Salvar imagem":
   POST /posts/42/assets  (multipart: file + alt_text)
   201 -> {"id": 7, "post_id": 42, "kind": "image", "position": 0,
           "url": "/media/posts/42/grafico-churn.png", "mime_type": "image/png",
           "width": 1200, "height": 675,
           "alt_text": "Grafico de barras mostrando a queda de churn...",
           "caption": null}
5. A imagem passa para a lista de anexos e a area de upload volta ao estado inicial.
6. Se o editor mudar o Status para "Scheduled" com alguma imagem sem alt text,
   o salvamento e bloqueado com aviso.
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Imagens com texto alternativo | Contar assets retornados por `GET /posts/{id}/assets` com `alt_text` não vazio, sobre o total | 100% |
| Violações críticas de acessibilidade no modal | axe DevTools rodado com o PostModal aberto e uma imagem anexada | 0 violações críticas ou sérias |
| Rejeição de arquivo inválido sem requisição | DevTools, aba Network: enviar PDF e arquivo de 8 MB | 0 requisições disparadas, 2 mensagens de erro exibidas |
| Operação por teclado | Percorrer todo o fluxo de upload usando apenas Tab, Shift+Tab, Enter e Espaço | Fluxo completo sem mouse, foco sempre visível |
| Contraste das mensagens de erro | axe DevTools ou Lighthouse na seção "Imagens do post" | >= 4.5:1 |

## Definition of Done

- [ ] `PostImageUploader.jsx` criado com drag-and-drop e seletor de arquivo com `<label>` textual real
- [ ] Validação client-side rejeita tipos fora de PNG/JPEG/WebP e arquivos acima de 5 MB antes de qualquer chamada de rede
- [ ] Preview local gerado com `URL.createObjectURL` e revogado no cleanup do `useEffect`
- [ ] Campo "Texto alternativo (obrigatório)" com `aria-required="true"`, contador visível e limite de 10 a 300 caracteres
- [ ] Botão "Salvar imagem" permanece `disabled` enquanto o alt text for inválido
- [ ] Mensagens de erro ligadas ao input por `aria-describedby` e anunciadas com `role="alert"`
- [ ] `PostAssetList.jsx` criado, permitindo editar alt text (`PATCH /assets/{id}`) e remover (`DELETE /assets/{id}`)
- [ ] `assetsApi` adicionado em `frontend/src/lib/api.js` seguindo o padrão dos demais objetos exportados
- [ ] Seção "Imagens do post" integrada no `PostModal.jsx` e agendamento bloqueado se houver imagem sem alt text
- [ ] axe DevTools sem violações críticas com o modal aberto; captura de tela anexada ao PR
- [ ] `npm run build` executa sem erros
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- WCAG 2.1, critério 1.1.1 Conteúdo Não Textual: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
- WCAG 2.1, critério 3.3.1 Identificação de Erro: https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html
- WCAG 2.1, critério 3.3.2 Rótulos ou Instruções: https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html
- MDN, `<input type="file">`: https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/input/file
- MDN, `URL.createObjectURL()`: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
- MDN, `FormData`: https://developer.mozilla.org/pt-BR/docs/Web/API/FormData
- MDN, API de arrastar e soltar: https://developer.mozilla.org/pt-BR/docs/Web/API/HTML_Drag_and_Drop_API
- W3C WAI, tutorial de textos alternativos: https://www.w3.org/WAI/tutorials/images/
- eMAG - Modelo de Acessibilidade em Governo Eletrônico: https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/eMAGv31.pdf/view
- Lei 13.146/2015 (Lei Brasileira de Inclusão), art. 63: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
