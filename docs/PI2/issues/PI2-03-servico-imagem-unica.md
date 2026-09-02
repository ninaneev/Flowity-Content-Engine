<!-- TITLE: [PI2][P1][Backend] Serviço de renderização de imagem única do post (Pillow) -->
<!-- LABELS: area:backend,prio:p1,sprint:pi2,type:task -->

## Contexto (PI 2)

Hoje o post gerado pelo Flowity Content Engine é publicado só como texto, e no LinkedIn um post sem imagem perde alcance de forma consistente. O PI 2 prevê o post de imagem única: um card quadrado com a marca Flowity, o gancho do post e o CTA, gerado automaticamente a partir de dados que o sistema já tem. Esta issue entrega o serviço de renderização com Pillow e o endpoint que salva o resultado como `PostAsset`, sempre com um texto alternativo padrão preenchido a partir do gancho, para que nenhuma imagem nasça inacessível.

## Integrante responsável

Diego Gustavo Franco

## Branch

`feat/pi2-03-servico-imagem-unica`

## Estimativa

10 a 14 horas

## Arquivos que você vai criar ou editar

- `backend/requirements.txt` - acrescenta `pillow==11.0.0`
- `backend/app/services/image_renderer.py` - serviço de renderização do card 1200x1200
- `backend/app/assets/fonts/` - fonte embarcada usada na renderização
- `backend/app/schemas/post_asset.py` - acrescenta `RenderImageRequest`
- `backend/app/routes/assets.py` - acrescenta `POST /posts/{id}/render/image`

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-03-servico-imagem-unica
```

**Passo 2 - Adicionar a dependência Pillow**

O Pillow ainda não faz parte do projeto. Acrescente a linha ao final de `backend/requirements.txt`:

```text
pillow==11.0.0
```

E reinstale:

```bash
cd backend
pip install -r requirements.txt
python -c "import PIL; print(PIL.__version__)"
```

**Passo 3 - Embarcar a fonte**

Crie a pasta `backend/app/assets/fonts/` e coloque nela um arquivo TrueType de licença livre, por exemplo `Inter-Bold.ttf` e `Inter-Regular.ttf`. O serviço precisa funcionar mesmo se a fonte não existir, caindo em `ImageFont.load_default()`, porque o container do backend pode subir sem os arquivos.

```bash
mkdir -p backend/app/assets/fonts
```

**Passo 4 - Escrever o serviço de renderização**

Crie `backend/app/services/image_renderer.py`. As cores são as da marca Flowity, já usadas no frontend:

```python
"""Renderiza o card de imagem única de um post usando Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from app.core.config import settings

# ── Identidade visual Flowity ─────────────────────────────────────
COR_FUNDO = "#080810"
COR_TEXTO = "#FFFFFF"
COR_SECUNDARIA = "#A8AABA"
COR_ROXO = "#9C83F7"
COR_CIANO = "#1CD8DE"

LARGURA = 1200
ALTURA = 1200
MARGEM = 96

DIR_FONTES = Path(__file__).resolve().parent.parent / "assets" / "fonts"


# ── Fontes ────────────────────────────────────────────────────────
def _carregar_fonte(nome: str, tamanho: int):
    """Carrega a fonte embarcada; cai no default do Pillow se ela não existir."""
    caminho = DIR_FONTES / nome
    if caminho.exists():
        return ImageFont.truetype(str(caminho), tamanho)
    return ImageFont.load_default()


def _largura_texto(draw: ImageDraw.ImageDraw, texto: str, fonte) -> int:
    caixa = draw.textbbox((0, 0), texto, font=fonte)
    return caixa[2] - caixa[0]


def _altura_linha(draw: ImageDraw.ImageDraw, fonte) -> int:
    caixa = draw.textbbox((0, 0), "Ag", font=fonte)
    return caixa[3] - caixa[1]


# ── Quebra de linha ───────────────────────────────────────────────
def quebrar_em_linhas(draw, texto: str, fonte, largura_max: int) -> list[str]:
    """Quebra o texto em linhas que cabem na largura disponível."""
    linhas: list[str] = []
    atual = ""
    for palavra in texto.split():
        tentativa = f"{atual} {palavra}".strip()
        if _largura_texto(draw, tentativa, fonte) <= largura_max:
            atual = tentativa
        else:
            if atual:
                linhas.append(atual)
            atual = palavra
    if atual:
        linhas.append(atual)
    return linhas


def ajustar_fonte(draw, texto: str, nome_fonte: str, largura_max: int,
                  altura_max: int, tamanho_inicial: int = 84, tamanho_minimo: int = 36):
    """Reduz o corpo da fonte até que o texto caiba na área reservada."""
    tamanho = tamanho_inicial
    while tamanho >= tamanho_minimo:
        fonte = _carregar_fonte(nome_fonte, tamanho)
        linhas = quebrar_em_linhas(draw, texto, fonte, largura_max)
        altura_total = len(linhas) * int(_altura_linha(draw, fonte) * 1.45)
        if altura_total <= altura_max:
            return fonte, linhas
        tamanho -= 4
    fonte = _carregar_fonte(nome_fonte, tamanho_minimo)
    return fonte, quebrar_em_linhas(draw, texto, fonte, largura_max)


# ── Acessibilidade ────────────────────────────────────────────────
def alt_text_padrao(hook: str) -> str:
    """Gera o texto alternativo inicial. Nunca deixe uma imagem sem descrição."""
    limpo = " ".join(hook.split())
    return f"Cartão com o texto: {limpo}"


# ── Renderização ──────────────────────────────────────────────────
def renderizar_card(hook: str, cta: str | None, destino: Path) -> dict:
    """Desenha o card 1200x1200 e grava o PNG em destino."""
    imagem = Image.new("RGB", (LARGURA, ALTURA), COR_FUNDO)
    draw = ImageDraw.Draw(imagem)

    # Barra de acento roxa e ciano no topo
    draw.rectangle([MARGEM, MARGEM, MARGEM + 120, MARGEM + 12], fill=COR_ROXO)
    draw.rectangle([MARGEM + 132, MARGEM, MARGEM + 200, MARGEM + 12], fill=COR_CIANO)

    # Gancho com quebra de linha e corpo automático
    largura_util = LARGURA - (2 * MARGEM)
    altura_util = ALTURA - (2 * MARGEM) - 300
    fonte_hook, linhas = ajustar_fonte(draw, hook, "Inter-Bold.ttf", largura_util, altura_util)
    espaco = int(_altura_linha(draw, fonte_hook) * 1.45)
    y = MARGEM + 120
    for linha in linhas:
        draw.text((MARGEM, y), linha, font=fonte_hook, fill=COR_TEXTO)
        y += espaco

    # CTA no rodapé
    if cta:
        fonte_cta = _carregar_fonte("Inter-Regular.ttf", 40)
        linhas_cta = quebrar_em_linhas(draw, cta, fonte_cta, largura_util)
        y_cta = ALTURA - MARGEM - 130 - (len(linhas_cta) - 1) * 52
        for linha in linhas_cta:
            draw.text((MARGEM, y_cta), linha, font=fonte_cta, fill=COR_CIANO)
            y_cta += 52

    # Assinatura da marca
    fonte_marca = _carregar_fonte("Inter-Bold.ttf", 36)
    draw.text((MARGEM, ALTURA - MARGEM - 48), "Flowity", font=fonte_marca, fill=COR_SECUNDARIA)

    destino.parent.mkdir(parents=True, exist_ok=True)
    imagem.save(destino, format="PNG", optimize=True)

    return {
        "width": LARGURA,
        "height": ALTURA,
        "size_bytes": destino.stat().st_size,
        "mime_type": "image/png",
    }
```

**Passo 5 - Acrescentar o schema do pedido**

Em `backend/app/schemas/post_asset.py`, adicione:

```python
class RenderImageRequest(BaseModel):
    """Permite sobrescrever o texto do card sem alterar o post."""
    hook: str | None = None
    cta: str | None = None
    alt_text: str | None = None
```

**Passo 6 - Criar o endpoint de renderização**

Em `backend/app/routes/assets.py`, acrescente a rota. Ela reaproveita `_media_root()` e `_com_url()` já criados na issue PI2-02:

```python
import uuid
from app.schemas.post_asset import RenderImageRequest
from app.services import image_renderer


# ── Renderização de imagem única ──────────────────────────────────
@router.post("/posts/{post_id}/render/image", response_model=PostAssetResponse, status_code=201)
def render_image(
    post_id: int,
    data: RenderImageRequest | None = None,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Gera o card 1200x1200 do post e salva como asset do tipo image."""
    post = post_repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")

    data = data or RenderImageRequest()
    hook = (data.hook or post.hook or "").strip()
    if not hook:
        raise HTTPException(status_code=422, detail="O post precisa de um hook para gerar a imagem.")
    cta = data.cta if data.cta is not None else post.cta

    caminho_relativo = f"posts/{post_id}/card-{uuid.uuid4().hex}.png"
    destino = _media_root() / caminho_relativo
    meta = image_renderer.renderizar_card(hook=hook, cta=cta, destino=destino)

    asset = asset_repo.create(
        db,
        post_id=post_id,
        kind="image",
        position=asset_repo.next_position(db, post_id),
        file_path=caminho_relativo,
        alt_text=data.alt_text or image_renderer.alt_text_padrao(hook),
        **meta,
    )
    return _com_url(asset)
```

O `alt_text` gerado é um ponto de partida editável pelo `PATCH /assets/{id}`, mas garante que o campo nunca fique vazio, que é o requisito de acessibilidade do PI 2.

**Passo 7 - Testar a renderização**

```bash
cd backend
python -c "
from pathlib import Path
from app.services.image_renderer import renderizar_card, alt_text_padrao
hook = 'Sua equipe de suporte ja sabe o que vai quebrar no proximo trimestre, mas ninguem le os tickets'
meta = renderizar_card(hook, 'Comente SINAL e eu te mando o teardown.', Path('media/teste/card.png'))
print(meta)
print(alt_text_padrao(hook))
"
```

Abra `backend/media/teste/card.png` e confirme que nenhuma palavra sai da margem.

**Passo 8 - Commit e Pull Request**

```bash
git add backend/requirements.txt backend/app/services/image_renderer.py backend/app/assets/fonts backend/app/schemas/post_asset.py backend/app/routes/assets.py
git commit -m "feat(backend): renderiza card de imagem unica do post com Pillow

Adiciona pillow==11.0.0 e o servico image_renderer, que desenha um card
1200x1200 com fundo da marca, barra de acento roxa e ciano, gancho com
quebra de linha e reducao automatica de corpo, CTA e assinatura Flowity.
O endpoint POST /posts/{id}/render/image salva o resultado como asset
com alt_text derivado do gancho."
git push -u origin feat/pi2-03-servico-imagem-unica
gh pr create --base main --title "[PI2][P1][Backend] Servico de renderizacao de imagem unica do post" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

```bash
curl -X POST "http://localhost:8000/posts/12/render/image" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cta": "Comente SINAL e eu te mando o teardown."}'
```

Resposta `201 Created`:

```json
{
  "id": 44,
  "post_id": 12,
  "kind": "image",
  "position": 1,
  "file_path": "posts/12/card-9ab3c1f27d5e4a08b6c2d1e0f3a4b5c6.png",
  "url": "/media/posts/12/card-9ab3c1f27d5e4a08b6c2d1e0f3a4b5c6.png",
  "mime_type": "image/png",
  "width": 1200,
  "height": 1200,
  "size_bytes": 96412,
  "alt_text": "Cartão com o texto: Sua equipe de suporte já sabe o que vai quebrar no próximo trimestre",
  "caption": null,
  "created_at": "2026-09-02T15:02:41",
  "updated_at": "2026-09-02T15:02:41"
}
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Dimensões do arquivo | `PIL.Image.open(path).size` | Exatamente `(1200, 1200)` |
| Texto sempre dentro da área útil | Renderizar ganchos de 40, 120 e 280 caracteres | 3 de 3 sem transbordo, corpo entre 36 e 84 px |
| `alt_text` nunca vazio | `GET /posts/{id}/assets` após renderizar | 100% dos assets com `alt_text` de 10 caracteres ou mais |
| Tempo de renderização | Medir `POST /posts/{id}/render/image` | Menor que 2 segundos por card |
| Funciona sem a fonte embarcada | Renomear a pasta `assets/fonts` e renderizar | HTTP 201, sem exceção, usando `load_default()` |

## Definition of Done

- [ ] `pillow==11.0.0` acrescentado ao `backend/requirements.txt` e imagem Docker reconstruída
- [ ] `image_renderer.py` implementa `quebrar_em_linhas`, `ajustar_fonte` e `alt_text_padrao`
- [ ] Card usa fundo `#080810`, texto branco, barra de acento `#9C83F7` e `#1CD8DE`, CTA e assinatura "Flowity"
- [ ] Fallback para `ImageFont.load_default()` testado com a pasta de fontes ausente
- [ ] `POST /posts/{id}/render/image` cria um `PostAsset` de `kind="image"` com `width`, `height` e `size_bytes` preenchidos
- [ ] Os três ganchos de teste renderizados e as imagens anexadas ao PR
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- Pillow - `ImageDraw`: https://pillow.readthedocs.io/en/stable/reference/ImageDraw.html
- Pillow - `ImageFont` e `truetype`: https://pillow.readthedocs.io/en/stable/reference/ImageFont.html
- Pillow - `textbbox` para medir texto: https://pillow.readthedocs.io/en/stable/reference/ImageDraw.html#PIL.ImageDraw.ImageDraw.textbbox
- WCAG 2.1 - Critério 1.1.1 Conteúdo não textual: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
- WCAG 2.1 - Critério 1.4.3 Contraste mínimo: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- Documentação interna: `docs/PI1/architecture.md`, `CLAUDE.md` (seção Brand Colors)
- Issues anteriores: PI2-01 (modelo `PostAsset`) e PI2-02 (API de assets)
