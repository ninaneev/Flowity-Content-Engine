<!-- TITLE: [PI2][P1][Backend] Consolidar o contrato da API de publicação com mídia e documentar no OpenAPI -->
<!-- LABELS: area:backend,prio:p1,sprint:pi2,type:docs -->

## Contexto (PI 2)

As issues PI2-02, PI2-03 e PI2-04 acrescentaram sete endpoints de mídia ao Flowity Content Engine, cada um escrito por uma pessoa diferente e com formato de erro próprio: umas devolvem `{"detail": "texto"}`, outras `{"detail": {"error": {...}}}`. Consolidação da API e documentação são objetivos explícitos do PI 2, e o `/docs` é o artefato que a banca abre para avaliar o trabalho. Esta issue padroniza o envelope de erro, garante `response_model` e metadados em todas as rotas novas e acrescenta exemplos aos schemas, de modo que o Swagger vire documentação de verdade e não uma lista de caminhos sem contexto.

## Integrante responsável

Diego Gustavo Franco

## Branch

`feat/pi2-06-contrato-api-midia`

## Estimativa

8 a 12 horas

## Arquivos que você vai criar ou editar

- `backend/app/core/errors.py` - envelope de erro, exceção de domínio e handlers
- `backend/app/main.py` - registra os `exception_handler` e enriquece os metadados do app
- `backend/app/routes/assets.py` - acrescenta `summary`, `description`, `tags` e `responses` em todas as rotas
- `backend/app/schemas/post_asset.py` - acrescenta `model_config` com `json_schema_extra`
- `PI2/api-midia.md` - checklist do contrato e tabela de códigos de erro

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-06-contrato-api-midia
```

**Passo 2 - Criar o envelope de erro**

Crie `backend/app/core/errors.py`:

```python
"""Envelope único de erro da API de mídia do PI 2."""
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel


# ── Contrato de resposta ──────────────────────────────────────────
class ErrorDetail(BaseModel):
    code: str
    message: str
    field: str | None = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "code": "alt_text_invalido",
                "message": "O texto alternativo precisa de pelo menos 10 caracteres.",
                "field": "alt_text",
            }
        }
    }


class ErrorResponse(BaseModel):
    error: ErrorDetail


# ── Exceção de domínio ────────────────────────────────────────────
class ApiError(Exception):
    """Levante isto nas rotas em vez de montar o JSON na mão."""

    def __init__(self, status_code: int, code: str, message: str, field: str | None = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.field = field


# ── Handlers ──────────────────────────────────────────────────────
async def api_error_handler(request: Request, exc: ApiError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message, "field": exc.field}},
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Converte HTTPException antiga para o envelope novo, sem quebrar rotas do PI 1."""
    detalhe = exc.detail
    if isinstance(detalhe, dict) and "error" in detalhe:
        return JSONResponse(status_code=exc.status_code, content=detalhe)
    codigo = {
        400: "requisicao_invalida", 401: "nao_autenticado", 403: "sem_permissao",
        404: "nao_encontrado", 413: "arquivo_grande_demais",
        415: "formato_nao_suportado", 422: "entidade_invalida",
    }.get(exc.status_code, "erro_interno")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": codigo, "message": str(detalhe), "field": None}},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Achata o erro do Pydantic no mesmo envelope, apontando o campo problemático."""
    primeiro = exc.errors()[0] if exc.errors() else {}
    campo = ".".join(str(p) for p in primeiro.get("loc", [])[1:]) or None
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "entidade_invalida",
                "message": primeiro.get("msg", "Dados inválidos."),
                "field": campo,
            }
        },
    )
```

**Passo 3 - Registrar os handlers no `main.py`**

Em `backend/app/main.py`, depois da criação do `app`:

```python
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.errors import (
    ApiError, api_error_handler, http_exception_handler, validation_exception_handler,
)

# ── Tratamento de erros (PI 2) ────────────────────────────────────────────────
app.add_exception_handler(ApiError, api_error_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
```

Enriqueça também os metadados do app e declare as tags para que o `/docs` fique agrupado:

```python
TAGS_METADATA = [
    {"name": "Media Assets", "description": "Upload, listagem, reordenação e remoção de imagens do post."},
    {"name": "Media Rendering", "description": "Geração automática de card de imagem única e de carrossel do LinkedIn."},
]

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Flowity Content Engine API for content generation, scheduling, and publishing. "
        "PI 2: imagens do post, carrossel do LinkedIn e acessibilidade obrigatória (WCAG 2.1 AA)."
    ),
    version="2.0.0",
    openapi_tags=TAGS_METADATA,
    docs_url="/docs",
    redoc_url="/redoc",
)
```

**Passo 4 - Padronizar as rotas de mídia**

Em `backend/app/routes/assets.py`, todo decorador passa a declarar `response_model`, `summary`, `description`, `tags` e `responses`. Modelo a seguir em todas:

```python
from app.core.errors import ErrorResponse, ApiError

RESPOSTAS_PADRAO = {
    401: {"model": ErrorResponse, "description": "Token ausente ou inválido"},
    404: {"model": ErrorResponse, "description": "Post ou asset não encontrado"},
    422: {"model": ErrorResponse, "description": "Dados inválidos ou texto alternativo recusado"},
}


@router.post(
    "/posts/{post_id}/assets",
    response_model=PostAssetResponse,
    status_code=201,
    tags=["Media Assets"],
    summary="Enviar imagem para um post",
    description=(
        "Recebe um arquivo PNG, JPEG ou WebP de até 5 MB junto com o texto alternativo "
        "obrigatório. O arquivo é gravado em MEDIA_DIR e servido em /media."
    ),
    responses={
        **RESPOSTAS_PADRAO,
        413: {"model": ErrorResponse, "description": "Arquivo acima de 5 MB"},
        415: {"model": ErrorResponse, "description": "Formato de imagem não suportado"},
    },
)
async def upload_asset(...):
    ...
```

Troque os `raise HTTPException(...)` das rotas de mídia por `raise ApiError(...)`:

```python
    if not post_repo.get_by_id(db, post_id):
        raise ApiError(404, "post_nao_encontrado", f"Post {post_id} não existe.", field="post_id")
```

**Passo 5 - Acrescentar exemplos aos schemas**

Em `backend/app/schemas/post_asset.py`, complete cada `model_config`. O projeto já usa `from_attributes`, então some as duas chaves:

```python
class PostAssetResponse(BaseModel):
    ...
    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
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
                "caption": None,
                "created_at": "2026-09-02T16:20:11",
                "updated_at": "2026-09-02T16:20:11",
            }
        },
    }


class AssetOrderUpdate(BaseModel):
    asset_ids: list[int]

    model_config = {"json_schema_extra": {"example": {"asset_ids": [33, 31, 32]}}}


class RenderCarouselRequest(BaseModel):
    slides: list[str] | None = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "slides": [
                    "Sinais que sua empresa ignora",
                    "Ticket repetido nao e ruido",
                    "Churn avisa 90 dias antes",
                    "Comente SINAL",
                ]
            }
        }
    }
```

**Passo 6 - Escrever a checklist do contrato**

Crie `PI2/api-midia.md` contendo a tabela de endpoints abaixo, a tabela de códigos de erro e um exemplo de requisição e resposta por endpoint. Toda rota criada no PI 2 precisa aparecer em `/docs` com `summary`, `description`, `tags` e `responses`:

| Endpoint | Issue | Tag | Códigos documentados |
|---|---|---|---|
| `POST /posts/{post_id}/assets` | PI2-02 | Media Assets | 201, 401, 404, 413, 415, 422 |
| `GET /posts/{post_id}/assets` | PI2-02 | Media Assets | 200, 401, 404 |
| `PATCH /assets/{asset_id}` | PI2-02 | Media Assets | 200, 401, 404, 422 |
| `PUT /posts/{post_id}/assets/order` | PI2-02 | Media Assets | 200, 401, 404, 422 |
| `DELETE /assets/{asset_id}` | PI2-02 | Media Assets | 204, 401, 404 |
| `POST /posts/{post_id}/render/image` | PI2-03 | Media Rendering | 201, 401, 404, 422 |
| `POST /posts/{post_id}/render/carousel` | PI2-04 | Media Rendering | 201, 401, 404, 422 |
| `PATCH /posts/{post_id}` | PI2-05 | Posts | 200, 401, 404, 422 |

Códigos do envelope de erro: `post_nao_encontrado`, `asset_nao_encontrado`, `formato_nao_suportado`, `arquivo_grande_demais`, `alt_text_invalido`, `acessibilidade_pendente`, `ordem_invalida`, `entidade_invalida`, `nao_autenticado`.

**Passo 7 - Verificar o OpenAPI**

```bash
docker compose up --build backend
```

```bash
cd backend
python -c "
from app.main import app
spec = app.openapi()
alvos = [p for p in spec['paths'] if '/assets' in p or '/render/' in p]
faltando = []
for p in sorted(alvos):
    for verbo, op in spec['paths'][p].items():
        if not op.get('summary') or not op.get('description') or not op.get('tags'):
            faltando.append(f'{verbo.upper()} {p}')
    print(p, sorted(spec['paths'][p].keys()))
print('sem metadados:', faltando)
"
```

Abra `http://localhost:8000/docs` e confira visualmente as tags e os exemplos.

**Passo 8 - Commit e Pull Request**

```bash
git add backend/app/core/errors.py backend/app/main.py backend/app/routes/assets.py backend/app/schemas/post_asset.py PI2/api-midia.md
git commit -m "feat(backend): padroniza contrato de erro e documenta a API de midia no OpenAPI

Cria o envelope unico {error: {code, message, field}} com handlers para
ApiError, HTTPException e RequestValidationError. Acrescenta
response_model, summary, description, tags e responses em todas as rotas
de midia do PI 2 e exemplos nos schemas via json_schema_extra. Inclui a
checklist do contrato em PI2/api-midia.md."
git push -u origin feat/pi2-06-contrato-api-midia
gh pr create --base main --title "[PI2][P1][Backend] Consolidar o contrato da API de publicacao com midia" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

Antes, cada rota respondia de um jeito. Depois, todo erro tem a mesma forma:

```bash
curl -i -X POST "http://localhost:8000/posts/999/assets" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@capa.png;type=image/png" \
  -F "alt_text=Card escuro com o titulo Sinais organizacionais"
```

```json
{
  "error": {
    "code": "post_nao_encontrado",
    "message": "Post 999 não existe.",
    "field": "post_id"
  }
}
```

Trecho do OpenAPI gerado, mostrando os metadados exigidos:

```json
{
  "post": {
    "tags": ["Media Rendering"],
    "summary": "Gerar carrossel do LinkedIn",
    "description": "Divide o corpo do post em capa, slides de conteúdo e CTA, renderiza cada slide em 1080x1350 e devolve também o PDF que o LinkedIn ingere.",
    "operationId": "render_carousel_posts__post_id__render_carousel_post",
    "responses": {
      "201": {"description": "Successful Response"},
      "404": {"description": "Post ou asset não encontrado"},
      "422": {"description": "Dados inválidos ou texto alternativo recusado"}
    }
  }
}
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Cobertura de metadados | Script do Passo 7 listando rotas sem `summary`, `description` ou `tags` | Lista vazia nas 8 rotas do PI 2 |
| Padronização de erro | Provocar 404, 413, 415 e 422 e comparar o corpo | 4 de 4 no formato `{"error": {"code", "message", "field"}}` |
| Exemplos no Swagger | Abrir `/docs` e conferir o painel Example Value | 4 schemas de mídia com exemplo preenchido |
| Endpoints presentes na checklist | Conferir `PI2/api-midia.md` contra `app.openapi()["paths"]` | 8 de 8 endpoints documentados |
| Compatibilidade com o PI 1 | `GET /posts/`, `GET /sources/` e `POST /generation/preview` | 3 de 3 continuam respondendo 200 |

## Definition of Done

- [ ] `backend/app/core/errors.py` com `ErrorResponse`, `ApiError` e os três handlers
- [ ] Handlers registrados em `backend/app/main.py`, com `version="2.0.0"` e `openapi_tags`
- [ ] Todas as rotas de mídia com `response_model`, `summary`, `description`, `tags` e `responses`
- [ ] `HTTPException` das rotas de mídia substituída por `ApiError`
- [ ] `json_schema_extra` com exemplo em `PostAssetResponse`, `PostAssetUpdate`, `AssetOrderUpdate` e `RenderCarouselRequest`
- [ ] `PI2/api-midia.md` criado com a tabela de endpoints e a tabela de códigos de erro
- [ ] Script de verificação do OpenAPI executado com saída colada no PR
- [ ] Rotas do PI 1 sem regressão
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- FastAPI - Metadados e URLs da documentação: https://fastapi.tiangolo.com/tutorial/metadata/
- FastAPI - Respostas adicionais no OpenAPI (`responses`): https://fastapi.tiangolo.com/advanced/additional-responses/
- FastAPI - Tratamento de erros e `exception_handler`: https://fastapi.tiangolo.com/tutorial/handling-errors/
- FastAPI - Path operation configuration (`summary`, `description`, `tags`): https://fastapi.tiangolo.com/tutorial/path-operation-configuration/
- Pydantic v2 - `json_schema_extra` e customização do JSON Schema: https://docs.pydantic.dev/latest/concepts/json_schema/
- Especificação OpenAPI 3.1: https://spec.openapis.org/oas/latest.html
- Documentação interna: `PI1/architecture.md`, `PI1/shadow-working-guide.md`
- Issues anteriores: PI2-02, PI2-03, PI2-04 e PI2-05
