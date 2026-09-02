<!-- TITLE: [PI2][P0][Backend] Serviço de geração de carrossel do LinkedIn (slides PNG + PDF) -->
<!-- LABELS: area:backend,prio:p0,sprint:pi2,type:task -->

## Contexto (PI 2)

O carrossel é o formato de maior retenção do LinkedIn e é a entrega visual central do PI 2. O detalhe técnico que define esta issue: o LinkedIn não aceita um carrossel como conjunto de imagens soltas, ele ingere um documento PDF de várias páginas. Portanto o serviço precisa fazer duas coisas ao mesmo tempo - gerar cada slide como PNG na proporção 4:5 (1080x1350), para pré-visualização e edição no Flowity Content Engine, e unir os mesmos slides em um único PDF pronto para publicação. Cada slide vira um `PostAsset` com posição sequencial e texto alternativo próprio.

## Integrante responsável

Davi Corrêa Bueno

## Branch

`feat/pi2-04-servico-carrossel`

## Estimativa

12 a 16 horas

## Arquivos que você vai criar ou editar

- `backend/app/services/carousel_renderer.py` - divisão do corpo em slides, render 1080x1350 e junção em PDF
- `backend/app/schemas/post_asset.py` - acrescenta `RenderCarouselRequest` e `CarouselResponse`
- `backend/app/routes/assets.py` - acrescenta `POST /posts/{id}/render/carousel`
- `backend/app/services/image_renderer.py` - reaproveita `quebrar_em_linhas` e `ajustar_fonte`
- `backend/requirements.txt` - confirma `pillow==11.0.0` (adicionado em PI2-03)

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-04-servico-carrossel
```

**Passo 2 - Garantir a dependência Pillow**

Se a issue PI2-03 ainda não foi mesclada, acrescente ao final de `backend/requirements.txt`:

```text
pillow==11.0.0
```

```bash
cd backend
pip install -r requirements.txt
```

**Passo 3 - Escrever o serviço de carrossel**

Crie `backend/app/services/carousel_renderer.py`:

```python
"""Gera o carrossel do LinkedIn: slides PNG 1080x1350 e o PDF de publicação."""
import re
from pathlib import Path
from PIL import Image, ImageDraw
from app.services.image_renderer import (
    COR_FUNDO, COR_TEXTO, COR_SECUNDARIA, COR_ROXO, COR_CIANO,
    _carregar_fonte, _altura_linha, quebrar_em_linhas, ajustar_fonte,
)

# ── Formato do LinkedIn ───────────────────────────────────────────
LARGURA = 1080          # proporção 4:5, recomendada para documentos do LinkedIn
ALTURA = 1350
MARGEM = 88

MIN_SLIDES = 3
MAX_SLIDES = 10


# ── Divisão automática do corpo ───────────────────────────────────
def dividir_em_slides(hook: str, body: str | None, cta: str | None,
                      alvo_conteudo: int = 5) -> list[str]:
    """Monta capa + 3 a 8 blocos de conteúdo + slide de CTA."""
    texto = (body or "").strip()
    blocos = [b.strip() for b in re.split(r"\n\s*\n", texto) if b.strip()]

    if len(blocos) < 3:
        frases = [f.strip() for f in re.split(r"(?<=[.!?])\s+", texto) if f.strip()]
        blocos = frases or blocos

    if len(blocos) > 8:
        # Junta blocos vizinhos até caber no máximo de conteúdo
        passo = -(-len(blocos) // 8)  # divisão inteira arredondando para cima
        blocos = [" ".join(blocos[i:i + passo]) for i in range(0, len(blocos), passo)]

    if not blocos:
        blocos = [hook]

    slides = [hook] + blocos[:8]
    if cta:
        slides.append(cta)
    return slides


def validar_quantidade(slides: list[str]) -> None:
    """Levanta ValueError se a quantidade de slides estiver fora do permitido."""
    if len(slides) < MIN_SLIDES or len(slides) > MAX_SLIDES:
        raise ValueError(
            f"O carrossel precisa ter entre {MIN_SLIDES} e {MAX_SLIDES} slides, recebeu {len(slides)}."
        )


# ── Acessibilidade ────────────────────────────────────────────────
def alt_text_slide(texto: str, indice: int, total: int) -> str:
    """Texto alternativo próprio de cada slide, com posição no carrossel."""
    limpo = " ".join(texto.split())[:240]
    return f"Slide {indice} de {total} do carrossel: {limpo}"


# ── Render de um slide ────────────────────────────────────────────
def renderizar_slide(texto: str, indice: int, total: int, destino: Path,
                     eh_capa: bool = False) -> Image.Image:
    """Desenha um slide 1080x1350 e grava o PNG em destino."""
    imagem = Image.new("RGB", (LARGURA, ALTURA), COR_FUNDO)
    draw = ImageDraw.Draw(imagem)

    # Barra de acento roxa e ciano
    draw.rectangle([MARGEM, MARGEM, MARGEM + 110, MARGEM + 10], fill=COR_ROXO)
    draw.rectangle([MARGEM + 122, MARGEM, MARGEM + 180, MARGEM + 10], fill=COR_CIANO)

    largura_util = LARGURA - (2 * MARGEM)
    altura_util = ALTURA - (2 * MARGEM) - 260
    nome_fonte = "Inter-Bold.ttf" if eh_capa else "Inter-Regular.ttf"
    tamanho_inicial = 82 if eh_capa else 58
    fonte, linhas = ajustar_fonte(
        draw, texto, nome_fonte, largura_util, altura_util,
        tamanho_inicial=tamanho_inicial, tamanho_minimo=32,
    )

    espaco = int(_altura_linha(draw, fonte) * 1.5)
    y = MARGEM + 140
    for linha in linhas:
        draw.text((MARGEM, y), linha, font=fonte, fill=COR_TEXTO)
        y += espaco

    # Numeração "2/7" e assinatura
    fonte_rodape = _carregar_fonte("Inter-Regular.ttf", 34)
    draw.text((MARGEM, ALTURA - MARGEM - 44), "Flowity", font=fonte_rodape, fill=COR_SECUNDARIA)
    numeracao = f"{indice}/{total}"
    caixa = draw.textbbox((0, 0), numeracao, font=fonte_rodape)
    draw.text(
        (LARGURA - MARGEM - (caixa[2] - caixa[0]), ALTURA - MARGEM - 44),
        numeracao, font=fonte_rodape, fill=COR_CIANO,
    )

    destino.parent.mkdir(parents=True, exist_ok=True)
    imagem.save(destino, format="PNG", optimize=True)
    return imagem


# ── Render do carrossel completo ──────────────────────────────────
def renderizar_carrossel(slides: list[str], pasta: Path, prefixo: str) -> dict:
    """Renderiza todos os slides e une as imagens em um único PDF."""
    validar_quantidade(slides)
    total = len(slides)
    imagens: list[Image.Image] = []
    arquivos: list[dict] = []

    for indice, texto in enumerate(slides, start=1):
        nome = f"{prefixo}-slide-{indice:02d}.png"
        caminho = pasta / nome
        imagem = renderizar_slide(texto, indice, total, caminho, eh_capa=(indice == 1))
        imagens.append(imagem.convert("RGB"))
        arquivos.append({
            "nome": nome,
            "caminho": caminho,
            "texto": texto,
            "position": indice - 1,
            "alt_text": alt_text_slide(texto, indice, total),
            "size_bytes": caminho.stat().st_size,
        })

    # O LinkedIn ingere carrossel como documento PDF, não como imagens soltas
    nome_pdf = f"{prefixo}-carrossel.pdf"
    caminho_pdf = pasta / nome_pdf
    imagens[0].save(
        caminho_pdf, format="PDF", resolution=150.0,
        save_all=True, append_images=imagens[1:],
    )

    return {
        "slides": arquivos,
        "pdf_nome": nome_pdf,
        "pdf_caminho": caminho_pdf,
        "pdf_size_bytes": caminho_pdf.stat().st_size,
        "width": LARGURA,
        "height": ALTURA,
    }
```

**Passo 4 - Acrescentar os schemas**

Em `backend/app/schemas/post_asset.py`:

```python
class RenderCarouselRequest(BaseModel):
    """Slides manuais; se ausente, o corpo do post é dividido automaticamente."""
    slides: list[str] | None = None


class CarouselResponse(BaseModel):
    """Resultado da geração: os slides como assets e o PDF de publicação."""
    post_id: int
    total_slides: int
    slides: list[PostAssetResponse]
    pdf_url: str
    pdf_size_bytes: int
```

**Passo 5 - Criar o endpoint**

Em `backend/app/routes/assets.py`, acrescente:

```python
import uuid
from app.schemas.post_asset import RenderCarouselRequest, CarouselResponse
from app.services import carousel_renderer


# ── Geração de carrossel ──────────────────────────────────────────
@router.post("/posts/{post_id}/render/carousel", response_model=CarouselResponse, status_code=201)
def render_carousel(
    post_id: int,
    data: RenderCarouselRequest | None = None,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Gera os slides 1080x1350 do carrossel e o PDF que o LinkedIn ingere."""
    post = post_repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")

    data = data or RenderCarouselRequest()
    slides = data.slides or carousel_renderer.dividir_em_slides(post.hook, post.body, post.cta)
    slides = [s.strip() for s in slides if s and s.strip()]

    try:
        carousel_renderer.validar_quantidade(slides)
    except ValueError as erro:
        raise HTTPException(status_code=422, detail=str(erro))

    prefixo = uuid.uuid4().hex[:12]
    pasta_relativa = f"posts/{post_id}"
    pasta = _media_root() / pasta_relativa
    resultado = carousel_renderer.renderizar_carrossel(slides, pasta, prefixo)

    inicio = asset_repo.next_position(db, post_id)
    criados = []
    for item in resultado["slides"]:
        criados.append(asset_repo.create(
            db,
            post_id=post_id,
            kind="carousel_slide",
            position=inicio + item["position"],
            file_path=f"{pasta_relativa}/{item['nome']}",
            mime_type="image/png",
            width=resultado["width"],
            height=resultado["height"],
            size_bytes=item["size_bytes"],
            alt_text=item["alt_text"],
        ))

    return CarouselResponse(
        post_id=post_id,
        total_slides=len(criados),
        slides=[_com_url(a) for a in criados],
        pdf_url=f"{settings.MEDIA_URL_PREFIX}/{pasta_relativa}/{resultado['pdf_nome']}",
        pdf_size_bytes=resultado["pdf_size_bytes"],
    )
```

**Passo 6 - Testar os limites**

```bash
cd backend
python -c "
from pathlib import Path
from app.services.carousel_renderer import renderizar_carrossel, validar_quantidade
slides = ['Sinais que sua empresa ignora', 'Ticket repetido nao e ruido', 'Churn avisa 90 dias antes', 'O dado ja esta no CRM', 'Comente SINAL']
r = renderizar_carrossel(slides, Path('media/teste'), 'demo')
print(r['pdf_caminho'], r['pdf_size_bytes'], len(r['slides']))
try:
    validar_quantidade(['a', 'b'])
except ValueError as e:
    print('limite minimo ok:', e)
try:
    validar_quantidade(['x'] * 11)
except ValueError as e:
    print('limite maximo ok:', e)
"
```

Confira o PDF gerado em `backend/media/teste/demo-carrossel.pdf`: ele deve abrir com o mesmo número de páginas que slides.

**Passo 7 - Commit e Pull Request**

```bash
git add backend/app/services/carousel_renderer.py backend/app/schemas/post_asset.py backend/app/routes/assets.py backend/requirements.txt
git commit -m "feat(backend): gera carrossel do LinkedIn em slides PNG e PDF unico

Divide o corpo do post em capa, 3 a 8 slides de conteudo e slide de CTA,
renderiza cada um em 1080x1350 com numeracao, persiste como PostAsset do
tipo carousel_slide com alt_text proprio e une tudo em um PDF de varias
paginas, formato que o LinkedIn aceita para carrossel. Retorna 422 fora
do intervalo de 3 a 10 slides."
git push -u origin feat/pi2-04-servico-carrossel
gh pr create --base main --title "[PI2][P0][Backend] Servico de geracao de carrossel do LinkedIn" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

Divisão automática a partir do corpo do post:

```bash
curl -X POST "http://localhost:8000/posts/12/render/carousel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Slides manuais:

```bash
curl -X POST "http://localhost:8000/posts/12/render/carousel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slides": ["Sinais que sua empresa ignora", "Ticket repetido nao e ruido", "Churn avisa 90 dias antes", "O dado ja esta no CRM", "Comente SINAL"]}'
```

Resposta `201 Created` (abreviada):

```json
{
  "post_id": 12,
  "total_slides": 5,
  "slides": [
    {
      "id": 51,
      "post_id": 12,
      "kind": "carousel_slide",
      "position": 0,
      "file_path": "posts/12/a1b2c3d4e5f6-slide-01.png",
      "url": "/media/posts/12/a1b2c3d4e5f6-slide-01.png",
      "mime_type": "image/png",
      "width": 1080,
      "height": 1350,
      "size_bytes": 74210,
      "alt_text": "Slide 1 de 5 do carrossel: Sinais que sua empresa ignora",
      "caption": null,
      "created_at": "2026-09-02T16:20:11",
      "updated_at": "2026-09-02T16:20:11"
    }
  ],
  "pdf_url": "/media/posts/12/a1b2c3d4e5f6-carrossel.pdf",
  "pdf_size_bytes": 412887
}
```

Erro `422` com slides de menos:

```json
{
  "detail": "O carrossel precisa ter entre 3 e 10 slides, recebeu 2."
}
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Proporção dos slides | `PIL.Image.open(slide).size` em todos os PNGs | 100% em `(1080, 1350)` |
| Páginas do PDF | `len(pypdf.PdfReader(pdf).pages)` ou abrir o arquivo | Igual ao número de slides |
| Numeração visível | Inspeção visual dos slides gerados | Todos com "n/total" no rodapé |
| Limites respeitados | Enviar listas com 2 e com 11 slides | HTTP 422 nos dois casos |
| Posições sequenciais | `GET /posts/{id}/assets` após gerar | `position` contínua sem repetição |
| `alt_text` por slide | Contar assets com `alt_text` vazio | 0 slides sem descrição |

## Definition of Done

- [ ] `carousel_renderer.py` com `dividir_em_slides`, `validar_quantidade`, `renderizar_slide`, `renderizar_carrossel` e `alt_text_slide`
- [ ] Slides renderizados em 1080x1350 com numeração e assinatura da marca
- [ ] PDF gerado com `Image.save(..., save_all=True, append_images=[...])` e uma página por slide
- [ ] Cada slide persistido como `PostAsset` de `kind="carousel_slide"` com `position` sequencial
- [ ] Limites de 3 a 10 slides aplicados com resposta 422
- [ ] Divisão automática funcionando quando o corpo do pedido é `{}`
- [ ] PDF de exemplo anexado ao PR
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- Pillow - Salvar PDF de várias páginas com `save_all` e `append_images`: https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html#pdf
- Pillow - `Image.save`: https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.Image.save
- Pillow - `ImageDraw.textbbox`: https://pillow.readthedocs.io/en/stable/reference/ImageDraw.html
- LinkedIn - Especificações de documentos e carrossel: https://www.linkedin.com/help/linkedin/answer/a564144
- WCAG 2.1 - Critério 1.1.1 Conteúdo não textual: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
- Documentação interna: `docs/PI1/architecture.md`, `CLAUDE.md` (seção Brand Colors)
- Issues anteriores: PI2-01, PI2-02 e PI2-03
