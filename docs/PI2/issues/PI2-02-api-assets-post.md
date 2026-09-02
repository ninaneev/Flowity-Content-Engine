<!-- TITLE: [PI2][P0][Backend] Implementar API de assets do post (upload, listar, reordenar, remover) -->
<!-- LABELS: area:backend,prio:p0,sprint:pi2,type:task -->

## Contexto (PI 2)

Com a tabela `post_assets` criada na issue PI2-01, o Flowity Content Engine ainda não tem nenhuma forma de colocar uma imagem dentro de um post: não existe endpoint de upload, de listagem nem de reordenação de slides. Esta issue entrega o CRUD completo de mídia, que é a porta de entrada de todo o PI 2 - o renderizador de imagem única (PI2-03), o gerador de carrossel (PI2-04) e a validação de acessibilidade (PI2-05) todos escrevem e leem por aqui. O upload já exige `alt_text` no próprio formulário, de modo que nenhum arquivo entra no sistema sem descrição textual.

## Integrante responsável

Jeferson Ferraz Ferreira

## Branch

`feat/pi2-02-api-assets-post`

## Estimativa

8 a 12 horas

## Arquivos que você vai criar ou editar

- `backend/app/schemas/post_asset.py` - schemas Pydantic v2 `PostAssetResponse`, `PostAssetUpdate`, `AssetOrderUpdate`
- `backend/app/repositories/post_assets.py` - queries SQLAlchemy do novo recurso
- `backend/app/routes/assets.py` - novo router com os cinco endpoints
- `backend/app/core/config.py` - acrescenta `MEDIA_DIR` e `MAX_UPLOAD_BYTES`
- `backend/app/main.py` - registra o router e monta o `StaticFiles` de `/media`
- `.gitignore` - ignora `backend/media/`

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-02-api-assets-post
```

**Passo 2 - Configurar o diretório de mídia**

Em `backend/app/core/config.py`, acrescente uma nova seção seguindo o padrão de comentários do arquivo, logo abaixo do bloco de n8n:

```python
    # ── Mídia (PI 2) ──────────────────────────────────────────────
    MEDIA_DIR: str = "./media"
    MEDIA_URL_PREFIX: str = "/media"
    MAX_UPLOAD_BYTES: int = 5 * 1024 * 1024  # 5 MB por arquivo
    ALLOWED_IMAGE_MIME: str = "image/png,image/jpeg,image/webp"
```

Acrescente também `MEDIA_DIR=./media` ao `.env.example` e a linha `backend/media/` ao `.gitignore`.

**Passo 3 - Criar os schemas Pydantic**

Crie `backend/app/schemas/post_asset.py`. Repare no `model_config = {"from_attributes": True}`, que é o padrão do projeto para serializar objetos ORM:

```python
"""Schemas Pydantic para assets (imagens e slides) de um post."""
from datetime import datetime
from pydantic import BaseModel, Field

VALID_KINDS = {"image", "carousel_slide"}
ALLOWED_MIME = {"image/png", "image/jpeg", "image/webp"}


class PostAssetResponse(BaseModel):
    """Representação pública de um asset."""
    id: int
    post_id: int
    kind: str
    position: int
    file_path: str
    url: str | None = None
    mime_type: str
    width: int | None = None
    height: int | None = None
    size_bytes: int | None = None
    alt_text: str
    caption: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PostAssetUpdate(BaseModel):
    """Atualização parcial de metadados do asset."""
    alt_text: str | None = None
    caption: str | None = None


class AssetOrderUpdate(BaseModel):
    """Nova ordem dos slides: a posição é o índice na lista."""
    asset_ids: list[int] = Field(..., min_length=1, description="IDs na ordem desejada")
```

A validação de conteúdo do `alt_text` (tamanho mínimo, palavras genéricas) entra na issue PI2-05. Aqui basta que o campo exista.

**Passo 4 - Criar o repositório**

Crie `backend/app/repositories/post_assets.py`, no mesmo estilo de `backend/app/repositories/posts.py`:

```python
"""Operações CRUD para post_assets. Usado pelas rotas de mídia do PI 2."""
from sqlalchemy.orm import Session
from app.models.post_asset import PostAsset
from app.schemas.post_asset import PostAssetUpdate


def get_by_post(db: Session, post_id: int) -> list[PostAsset]:
    """Lista os assets de um post já ordenados por position."""
    return (
        db.query(PostAsset)
        .filter(PostAsset.post_id == post_id)
        .order_by(PostAsset.position, PostAsset.id)
        .all()
    )


def get_by_id(db: Session, asset_id: int) -> PostAsset | None:
    return db.query(PostAsset).filter(PostAsset.id == asset_id).first()


def next_position(db: Session, post_id: int) -> int:
    """Retorna a próxima posição livre no fim da fila do post."""
    return len(get_by_post(db, post_id))


def create(db: Session, **kwargs) -> PostAsset:
    asset = PostAsset(**kwargs)
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


def update(db: Session, asset_id: int, data: PostAssetUpdate) -> PostAsset | None:
    asset = get_by_id(db, asset_id)
    if not asset:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(asset, key, value)
    db.commit()
    db.refresh(asset)
    return asset


def reorder(db: Session, post_id: int, asset_ids: list[int]) -> list[PostAsset] | None:
    """Regrava position seguindo a ordem da lista recebida."""
    atuais = get_by_post(db, post_id)
    if sorted(a.id for a in atuais) != sorted(asset_ids):
        return None  # a lista precisa conter exatamente os assets do post
    mapa = {a.id: a for a in atuais}
    for indice, asset_id in enumerate(asset_ids):
        mapa[asset_id].position = indice
    db.commit()
    return get_by_post(db, post_id)


def delete(db: Session, asset_id: int) -> PostAsset | None:
    """Remove o registro e devolve o objeto para que a rota apague o arquivo."""
    asset = get_by_id(db, asset_id)
    if not asset:
        return None
    db.delete(asset)
    db.commit()
    return asset
```

**Passo 5 - Criar o router de assets**

Crie `backend/app/routes/assets.py`. O `python-multipart==0.0.12` já está no `requirements.txt`, então `UploadFile` e `Form` funcionam sem instalar nada novo:

```python
"""Rotas de mídia: upload, listagem, edição, reordenação e remoção de assets."""
import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.config import settings
from app.core.security import get_current_admin
from app.schemas.post_asset import (
    PostAssetResponse, PostAssetUpdate, AssetOrderUpdate, ALLOWED_MIME,
)
from app.repositories import posts as post_repo
from app.repositories import post_assets as asset_repo

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────
def _media_root() -> Path:
    """Garante que MEDIA_DIR existe e devolve o caminho absoluto."""
    raiz = Path(settings.MEDIA_DIR).resolve()
    raiz.mkdir(parents=True, exist_ok=True)
    return raiz


def _com_url(asset) -> PostAssetResponse:
    """Preenche o campo url a partir do file_path relativo."""
    resposta = PostAssetResponse.model_validate(asset)
    resposta.url = f"{settings.MEDIA_URL_PREFIX}/{asset.file_path}"
    return resposta


# ── Upload ────────────────────────────────────────────────────────
@router.post("/posts/{post_id}/assets", response_model=PostAssetResponse, status_code=201)
async def upload_asset(
    post_id: int,
    file: UploadFile = File(..., description="PNG, JPEG ou WebP de até 5 MB"),
    alt_text: str = Form(..., description="Texto alternativo obrigatório"),
    caption: str | None = Form(None),
    kind: str = Form("image"),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Envia uma imagem e a anexa ao post."""
    if not post_repo.get_by_id(db, post_id):
        raise HTTPException(status_code=404, detail="Post não encontrado")

    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=415,
            detail=f"Formato não suportado: {file.content_type}. Use PNG, JPEG ou WebP.",
        )

    conteudo = await file.read()
    if len(conteudo) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Arquivo com {len(conteudo)} bytes excede o limite de {settings.MAX_UPLOAD_BYTES} bytes.",
        )
    if not conteudo:
        raise HTTPException(status_code=422, detail="Arquivo vazio")

    extensao = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp"}[file.content_type]
    pasta_relativa = f"posts/{post_id}"
    nome = f"{uuid.uuid4().hex}{extensao}"
    destino = _media_root() / pasta_relativa
    destino.mkdir(parents=True, exist_ok=True)
    (destino / nome).write_bytes(conteudo)

    asset = asset_repo.create(
        db,
        post_id=post_id,
        kind=kind,
        position=asset_repo.next_position(db, post_id),
        file_path=f"{pasta_relativa}/{nome}",
        mime_type=file.content_type,
        size_bytes=len(conteudo),
        alt_text=alt_text,
        caption=caption,
    )
    return _com_url(asset)


# ── Listagem ──────────────────────────────────────────────────────
@router.get("/posts/{post_id}/assets", response_model=list[PostAssetResponse])
def list_assets(post_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Lista os assets do post na ordem de exibição."""
    if not post_repo.get_by_id(db, post_id):
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return [_com_url(a) for a in asset_repo.get_by_post(db, post_id)]


# ── Edição de metadados ───────────────────────────────────────────
@router.patch("/assets/{asset_id}", response_model=PostAssetResponse)
def update_asset(
    asset_id: int,
    data: PostAssetUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Atualiza alt_text e caption de um asset."""
    atualizado = asset_repo.update(db, asset_id, data)
    if not atualizado:
        raise HTTPException(status_code=404, detail="Asset não encontrado")
    return _com_url(atualizado)


# ── Reordenação ───────────────────────────────────────────────────
@router.put("/posts/{post_id}/assets/order", response_model=list[PostAssetResponse])
def reorder_assets(
    post_id: int,
    data: AssetOrderUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Redefine a ordem dos slides do carrossel."""
    if not post_repo.get_by_id(db, post_id):
        raise HTTPException(status_code=404, detail="Post não encontrado")
    resultado = asset_repo.reorder(db, post_id, data.asset_ids)
    if resultado is None:
        raise HTTPException(
            status_code=422,
            detail="asset_ids deve conter exatamente todos os assets deste post, sem repetições.",
        )
    return [_com_url(a) for a in resultado]


# ── Remoção ───────────────────────────────────────────────────────
@router.delete("/assets/{asset_id}", status_code=204)
def delete_asset(asset_id: int, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Remove o asset do banco e apaga o arquivo do disco."""
    removido = asset_repo.delete(db, asset_id)
    if not removido:
        raise HTTPException(status_code=404, detail="Asset não encontrado")
    caminho = _media_root() / removido.file_path
    if caminho.exists():
        os.remove(caminho)
    return None
```

**Passo 6 - Registrar o router e servir os arquivos**

Em `backend/app/main.py`, acrescente os imports:

```python
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from app.routes import auth, sources, posts, generation, automation, assets
```

Na seção de rotas, logo depois do router de posts, acrescente a linha de registro. O router de assets já traz os prefixos completos nos próprios paths, portanto registre sem `prefix`:

```python
app.include_router(assets.router,                           tags=["Media Assets"])
```

E antes do bloco de startup, monte os arquivos estáticos:

```python
# ── Arquivos de mídia (PI 2) ──────────────────────────────────────────────────
Path(settings.MEDIA_DIR).mkdir(parents=True, exist_ok=True)
app.mount(settings.MEDIA_URL_PREFIX, StaticFiles(directory=settings.MEDIA_DIR), name="media")
```

**Passo 7 - Testar manualmente**

```bash
docker compose up --build backend
```

Pegue o token em `POST /auth/login` e rode os cinco endpoints pelo Swagger em `http://localhost:8000/docs` ou pelos comandos do bloco "Exemplo de uso".

**Passo 8 - Commit e Pull Request**

```bash
git add backend/app/schemas/post_asset.py backend/app/repositories/post_assets.py backend/app/routes/assets.py backend/app/core/config.py backend/app/main.py .gitignore .env.example
git commit -m "feat(backend): adiciona API de assets do post com upload e reordenacao

Cria os endpoints de upload multipart, listagem, edicao de metadados,
reordenacao de slides e remocao de assets. Acrescenta MEDIA_DIR na
configuracao, monta StaticFiles em /media e exige alt_text ja no
formulario de upload."
git push -u origin feat/pi2-02-api-assets-post
gh pr create --base main --title "[PI2][P0][Backend] Implementar API de assets do post" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

Upload de uma imagem com texto alternativo:

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha"}' | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

curl -X POST "http://localhost:8000/posts/12/assets" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@capa.png;type=image/png" \
  -F "alt_text=Card escuro com o titulo Sinais organizacionais e a marca Flowity" \
  -F "kind=image"
```

Resposta `201 Created`:

```json
{
  "id": 31,
  "post_id": 12,
  "kind": "image",
  "position": 0,
  "file_path": "posts/12/6f1c2a9d4b7e4f0a9c1d2e3f4a5b6c7d.png",
  "url": "/media/posts/12/6f1c2a9d4b7e4f0a9c1d2e3f4a5b6c7d.png",
  "mime_type": "image/png",
  "width": null,
  "height": null,
  "size_bytes": 184320,
  "alt_text": "Card escuro com o titulo Sinais organizacionais e a marca Flowity",
  "caption": null,
  "created_at": "2026-09-02T14:10:05",
  "updated_at": "2026-09-02T14:10:05"
}
```

Reordenando os slides do carrossel:

```bash
curl -X PUT "http://localhost:8000/posts/12/assets/order" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"asset_ids": [33, 31, 32]}'
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Upload válido aceito | `POST /posts/{id}/assets` com PNG de 200 KB e `alt_text` | HTTP 201 e arquivo presente em `backend/media/posts/{id}/` |
| Formato inválido recusado | Enviar um PDF pelo mesmo endpoint | HTTP 415 com mensagem sobre formato |
| Limite de tamanho aplicado | Enviar PNG de 6 MB | HTTP 413 |
| Upload sem `alt_text` recusado | Omitir o campo no formulário | HTTP 422 do FastAPI |
| Reordenação persistida | `PUT .../assets/order` e depois `GET .../assets` | Ordem retornada igual à enviada, `position` de 0 a n-1 |
| Arquivo servido pelo StaticFiles | `GET` na `url` retornada | HTTP 200 com o `Content-Type` da imagem |

## Definition of Done

- [ ] Cinco endpoints implementados e protegidos por `Depends(get_current_admin)`
- [ ] `MEDIA_DIR`, `MEDIA_URL_PREFIX` e `MAX_UPLOAD_BYTES` em `core/config.py` e documentados no `.env.example`
- [ ] `StaticFiles` montado em `/media` e `backend/media/` no `.gitignore`
- [ ] Router registrado em `backend/app/main.py` e visível em `/docs` sob a tag `Media Assets`
- [ ] Validação de MIME, de tamanho e de post inexistente com os códigos 415, 413 e 404
- [ ] `DELETE /assets/{id}` remove o registro e o arquivo do disco
- [ ] Os seis testes da tabela de métricas executados com evidência colada no PR
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- FastAPI - Request Files e `UploadFile`: https://fastapi.tiangolo.com/tutorial/request-files/
- FastAPI - Request Forms and Files: https://fastapi.tiangolo.com/tutorial/request-forms-and-files/
- FastAPI - Static Files: https://fastapi.tiangolo.com/tutorial/static-files/
- FastAPI - Bigger Applications e `APIRouter`: https://fastapi.tiangolo.com/tutorial/bigger-applications/
- Pydantic v2 - `model_validate` e `from_attributes`: https://docs.pydantic.dev/latest/concepts/models/
- Documentação interna: `docs/PI1/architecture.md`, `docs/PI1/shadow-working-guide.md`
- Issue anterior: PI2-01 (modelo `PostAsset`)
