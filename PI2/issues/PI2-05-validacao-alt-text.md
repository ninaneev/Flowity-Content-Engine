<!-- TITLE: [PI2][P0][Backend] Tornar o texto alternativo obrigatório e validado na API -->
<!-- LABELS: area:backend,prio:p0,sprint:pi2,type:task -->

## Contexto (PI 2)

A acessibilidade é um objetivo declarado do PI 2, não um detalhe: no PI 1 o Flowity Content Engine publicava só texto e a questão não existia; com imagens e carrosséis ela passa a ser obrigação legal e técnica. A Lei Brasileira de Inclusão (Lei 13.146/2015, artigo 63) exige que sítios e conteúdos digitais sejam acessíveis, o eMAG estabelece a recomendação 3.6 de fornecer alternativa em texto para as imagens e a WCAG 2.1 AA formaliza isso no critério 1.1.1. Esta issue fecha o ciclo: o `alt_text` deixa de ser um campo que existe e passa a ser um campo validado, e nenhum post com imagem sem descrição consegue chegar a `scheduled` ou `published`.

## Integrante responsável

Jeferson Ferraz Ferreira

## Branch

`feat/pi2-05-validacao-alt-text`

## Estimativa

6 a 9 horas

## Arquivos que você vai criar ou editar

- `backend/app/schemas/post_asset.py` - validadores Pydantic de `alt_text`
- `backend/app/services/accessibility.py` - regra reutilizável de validação e auditoria do post
- `backend/app/routes/assets.py` - aplica a validação no upload e no `PATCH /assets/{id}`
- `backend/app/routes/posts.py` - bloqueia a mudança de status e acrescenta a rota `PATCH /posts/{id}`
- `backend/app/repositories/post_assets.py` - consulta de assets sem descrição válida

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-05-validacao-alt-text
```

**Passo 2 - Criar o serviço de acessibilidade**

Crie `backend/app/services/accessibility.py` com a regra única, para que schema e rotas usem a mesma lógica:

```python
"""Regras de acessibilidade do PI 2: validação do texto alternativo.

Base normativa:
- Lei 13.146/2015 (LBI), art. 63 - acessibilidade obrigatória em conteúdo digital
- eMAG 3.1, recomendação 3.6 - fornecer alternativa em texto para as imagens
- WCAG 2.1 AA, critério 1.1.1 - conteúdo não textual
"""

ALT_MIN = 10
ALT_MAX = 300

# Descrições que não descrevem nada
TERMOS_GENERICOS = {
    "imagem", "imagens", "foto", "fotos", "figura", "print", "screenshot",
    "image", "images", "picture", "pictures", "photo", "photos", "img",
    "banner", "slide", "post", "sem descricao", "sem descrição",
}


class AltTextInvalido(ValueError):
    """Levantado quando o texto alternativo não atende às regras."""


def validar_alt_text(valor: str | None) -> str:
    """Valida e normaliza o texto alternativo. Levanta AltTextInvalido."""
    if valor is None:
        raise AltTextInvalido("O texto alternativo é obrigatório para toda imagem.")

    limpo = " ".join(valor.split())

    if not limpo:
        raise AltTextInvalido("O texto alternativo não pode conter apenas espaços.")
    if len(limpo) < ALT_MIN:
        raise AltTextInvalido(
            f"O texto alternativo precisa de pelo menos {ALT_MIN} caracteres, recebeu {len(limpo)}."
        )
    if len(limpo) > ALT_MAX:
        raise AltTextInvalido(
            f"O texto alternativo pode ter no máximo {ALT_MAX} caracteres, recebeu {len(limpo)}."
        )
    if limpo.strip(" .!-").lower() in TERMOS_GENERICOS:
        raise AltTextInvalido(
            "O texto alternativo não pode ser um termo genérico como "
            "'imagem', 'foto', 'image' ou 'picture'. Descreva o conteúdo da imagem."
        )
    return limpo


def alt_text_valido(valor: str | None) -> bool:
    """Versão booleana, usada na auditoria antes de publicar."""
    try:
        validar_alt_text(valor)
        return True
    except AltTextInvalido:
        return False
```

**Passo 3 - Aplicar os validadores nos schemas**

Em `backend/app/schemas/post_asset.py`, siga o padrão de `field_validator` já usado em `backend/app/schemas/post.py`:

```python
from pydantic import BaseModel, Field, field_validator
from app.services.accessibility import validar_alt_text, ALT_MIN, ALT_MAX


class PostAssetUpdate(BaseModel):
    """Atualização parcial de metadados do asset."""
    alt_text: str | None = None
    caption: str | None = None

    @field_validator("alt_text")
    @classmethod
    def validate_alt_text(cls, v: str | None) -> str | None:
        if v is None:
            return v  # campo não enviado no PATCH, mantém o valor atual
        return validar_alt_text(v)


class AltTextIn(BaseModel):
    """Usado para validar o alt_text vindo de um formulário multipart."""
    alt_text: str = Field(..., min_length=ALT_MIN, max_length=ALT_MAX)

    @field_validator("alt_text")
    @classmethod
    def validate_alt_text(cls, v: str) -> str:
        return validar_alt_text(v)
```

**Passo 4 - Validar no upload**

Em `backend/app/routes/assets.py`, dentro de `upload_asset`, logo depois de conferir se o post existe, converta o erro de domínio no envelope 422:

```python
from app.services.accessibility import AltTextInvalido, validar_alt_text, alt_text_valido

    try:
        alt_text = validar_alt_text(alt_text)
    except AltTextInvalido as erro:
        raise HTTPException(
            status_code=422,
            detail={
                "error": {
                    "code": "alt_text_invalido",
                    "message": str(erro),
                    "field": "alt_text",
                }
            },
        )
```

**Passo 5 - Consultar assets sem descrição**

Em `backend/app/repositories/post_assets.py`, acrescente:

```python
def sem_alt_text_valido(db: Session, post_id: int) -> list[PostAsset]:
    """Retorna os assets do post cujo alt_text não passa na regra de acessibilidade."""
    from app.services.accessibility import alt_text_valido
    return [a for a in get_by_post(db, post_id) if not alt_text_valido(a.alt_text)]
```

**Passo 6 - Bloquear a publicação**

Em `backend/app/routes/posts.py` existe hoje apenas `PUT /{post_id}`. Acrescente a checagem e exponha também o verbo `PATCH`, que é o contrato do PI 2 para atualização parcial:

```python
from app.repositories import post_assets as asset_repo

STATUS_QUE_EXIGEM_ACESSIBILIDADE = {"scheduled", "published"}


def _garantir_acessibilidade(db: Session, post_id: int, novo_status: str | None) -> None:
    """Impede agendar ou publicar um post com imagem sem texto alternativo válido."""
    if novo_status not in STATUS_QUE_EXIGEM_ACESSIBILIDADE:
        return
    pendentes = asset_repo.sem_alt_text_valido(db, post_id)
    if pendentes:
        raise HTTPException(
            status_code=422,
            detail={
                "error": {
                    "code": "acessibilidade_pendente",
                    "message": (
                        f"{len(pendentes)} imagem(ns) deste post estão sem texto alternativo válido. "
                        "Descreva cada imagem antes de agendar ou publicar."
                    ),
                    "field": "assets.alt_text",
                    "asset_ids": [a.id for a in pendentes],
                }
            },
        )


@router.patch("/{post_id}", response_model=PostResponse)
@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post: PostUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    existente = post_repo.get_by_id(db, post_id)
    if not existente:
        raise HTTPException(status_code=404, detail="Post não encontrado")

    _garantir_acessibilidade(db, post_id, post.status)

    updated = post_repo.update(db, post_id, post)
    updated.source_ids = post_repo.get_source_ids(db, post_id)

    return updated
```

Aplique a mesma checagem em `backend/app/routes/automation.py`, na rota que o n8n usa para marcar o post como publicando, para que a automação não contorne a regra.

**Passo 7 - Testar**

```bash
cd backend
python -c "
from app.services.accessibility import validar_alt_text, AltTextInvalido
casos = ['', '   ', 'imagem', 'foto', 'Picture', 'curto', 'x'*301, 'Card escuro com o titulo Sinais organizacionais']
for c in casos:
    try:
        print('OK   ->', validar_alt_text(c)[:40])
    except AltTextInvalido as e:
        print('ERRO ->', repr(c[:12]), e)
"
```

Depois, pela API:

```bash
curl -X PATCH "http://localhost:8000/posts/12" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "scheduled"}'
```

**Passo 8 - Commit e Pull Request**

```bash
git add backend/app/services/accessibility.py backend/app/schemas/post_asset.py backend/app/routes/assets.py backend/app/routes/posts.py backend/app/routes/automation.py backend/app/repositories/post_assets.py
git commit -m "feat(backend): torna o texto alternativo obrigatorio e validado

Cria o servico accessibility com a regra unica de validacao do alt_text
(minimo 10, maximo 300 caracteres, sem espacos vazios e sem termos
genericos) e aplica no upload, no PATCH de assets e na mudanca de status
do post. Agendar ou publicar um post com imagem sem descricao passa a
retornar 422. Base: Lei 13.146/2015, eMAG 3.6 e WCAG 2.1 criterio 1.1.1."
git push -u origin feat/pi2-05-validacao-alt-text
gh pr create --base main --title "[PI2][P0][Backend] Tornar o texto alternativo obrigatorio e validado na API" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

Tentativa de agendar um post cujo carrossel tem dois slides sem descrição:

```bash
curl -i -X PATCH "http://localhost:8000/posts/12" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "scheduled"}'
```

Resposta `422 Unprocessable Entity`:

```json
{
  "detail": {
    "error": {
      "code": "acessibilidade_pendente",
      "message": "2 imagem(ns) deste post estão sem texto alternativo válido. Descreva cada imagem antes de agendar ou publicar.",
      "field": "assets.alt_text",
      "asset_ids": [52, 55]
    }
  }
}
```

Tentativa de salvar um texto alternativo genérico:

```bash
curl -i -X PATCH "http://localhost:8000/assets/52" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alt_text": "imagem"}'
```

Resposta `422 Unprocessable Entity`:

```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "alt_text"],
      "msg": "Value error, O texto alternativo não pode ser um termo genérico como 'imagem', 'foto', 'image' ou 'picture'. Descreva o conteúdo da imagem.",
      "input": "imagem"
    }
  ]
}
```

Depois de corrigir os dois slides, o mesmo `PATCH` de status retorna `200 OK`.

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Casos inválidos recusados | Rodar os 7 casos negativos do Passo 7 | 7 de 7 levantam `AltTextInvalido` |
| Caso válido aceito | Texto descritivo de 46 caracteres | Retorna a string normalizada |
| Bloqueio de agendamento | `PATCH /posts/{id}` com `status=scheduled` e 2 assets sem descrição | HTTP 422 com `code=acessibilidade_pendente` |
| Liberação após correção | Corrigir os `alt_text` e repetir o `PATCH` | HTTP 200 e status gravado como `scheduled` |
| Automação não contorna a regra | `POST /automation/posts/{id}/publish-attempt` em post pendente | HTTP 422 |
| Cobertura de imagens descritas | `SELECT COUNT(*) FROM post_assets WHERE length(trim(alt_text)) < 10` | 0 registros |

## Definition of Done

- [ ] `backend/app/services/accessibility.py` com `validar_alt_text`, `alt_text_valido` e a lista de termos genéricos
- [ ] `field_validator` aplicado em `PostAssetUpdate` e no upload multipart
- [ ] Regras: obrigatório, mínimo 10, máximo 300, sem apenas espaços, sem termos genéricos
- [ ] `PATCH /posts/{id}` disponível além do `PUT` existente, ambos com a checagem de acessibilidade
- [ ] Status `scheduled` e `published` bloqueados com 422 no envelope `{"error": {...}}`
- [ ] Rota de automação do n8n também protegida
- [ ] Justificativa normativa (Lei 13.146/2015, eMAG 3.6, WCAG 2.1 AA 1.1.1) citada na docstring do serviço e no PR
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- Lei 13.146/2015 - Lei Brasileira de Inclusão, art. 63: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
- eMAG - Modelo de Acessibilidade em Governo Eletrônico, recomendação 3.6: https://emag.governoeletronico.gov.br/
- WCAG 2.1 - Critério 1.1.1 Conteúdo não textual: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
- W3C WAI - Como escrever textos alternativos: https://www.w3.org/WAI/tutorials/images/
- Pydantic v2 - `field_validator`: https://docs.pydantic.dev/latest/concepts/validators/
- FastAPI - `HTTPException` e tratamento de erros: https://fastapi.tiangolo.com/tutorial/handling-errors/
- Documentação interna: `PI1/architecture.md`
- Issues anteriores: PI2-01, PI2-02, PI2-03 e PI2-04
