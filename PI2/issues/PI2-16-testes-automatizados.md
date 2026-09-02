<!-- TITLE: [PI2][P0][Testing] Configurar testes automatizados (pytest + Vitest) para imagens, carrossel, alt text e métricas -->
<!-- LABELS: area:testing,area:infra,prio:p0,sprint:pi2,type:task -->

## Contexto (PI 2)

O PI 1 foi entregue sem nenhum runner de teste: existem apenas dois arquivos soltos, `frontend/src/lib/generatorValidation.test.mjs` e `loginError.test.mjs`, rodados na mão com `node`. Isso funcionou enquanto o produto era só texto, mas o PI 2 acrescenta upload de imagem, carrossel de LinkedIn e regras de acessibilidade que não podem depender de alguém lembrar de conferir: se o texto alternativo obrigatório voltar a ser opcional em um refactor, ninguém percebe até a entrega. Esta issue instala pytest no backend, Vitest no frontend, migra os dois testes existentes, cobre as regras críticas das issues PI2-01 a PI2-12 e liga tudo em um workflow do GitHub Actions que roda a cada pull request.

## Integrante responsável

Jeferson Ferraz Ferreira

## Branch

`feat/pi2-16-testes-automatizados`

## Estimativa

14 a 18 horas

## Arquivos que você vai criar ou editar

- `backend/requirements-dev.txt` - dependências de teste, separadas das de produção
- `backend/pytest.ini` - configuração do pytest e do coverage
- `backend/tests/conftest.py` - fixtures do `TestClient` e do SQLite em memória
- `backend/tests/test_assets.py` - upload de imagem, tipo, tamanho e alt text
- `backend/tests/test_carousel.py` - regras de mínimo e máximo de slides e geração do PDF
- `backend/tests/test_metrics.py` - cálculo da taxa de engajamento no resumo
- `frontend/package.json` - Vitest, Testing Library, jsdom, axe e o script `test`
- `frontend/vitest.config.js` - configuração do ambiente jsdom
- `frontend/src/test/setup.js` - setup global do Testing Library
- `frontend/src/lib/generatorValidation.test.js` - migração do `.test.mjs`
- `frontend/src/lib/loginError.test.js` - migração do `.test.mjs`
- `frontend/src/components/posts/PostModal.test.jsx` - botão Salvar desabilitado sem alt text e teste axe
- `frontend/src/pages/CarouselPage.test.jsx` - teste axe da página de carrossel
- `.github/workflows/tests.yml` - roda as duas suítes em todo pull request

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-16-testes-automatizados
```

Esta issue depende das issues PI2-01 a PI2-05 (assets e carrossel) e da PI2-12 (métricas) estarem em `main`. Se alguma ainda não estiver, escreva o teste correspondente marcado com `@pytest.mark.skip(reason="depende da issue PI2-0X")` e destrave depois, em vez de deixar a suíte vermelha.

**Passo 2 - Instalar as dependências de teste do backend**

Crie `backend/requirements-dev.txt`. As dependências de teste ficam fora do `requirements.txt` para não entrarem na imagem Docker de produção. O `httpx` já está no `requirements.txt`, na versão 0.27.2, e é o que o `TestClient` do Starlette usa por baixo.

```text
-r requirements.txt
pytest==8.3.3
pytest-cov==5.0.0
httpx==0.27.2
```

```bash
cd backend
pip install -r requirements-dev.txt
```

**Passo 3 - Configurar o pytest**

Crie `backend/pytest.ini`:

```ini
[pytest]
testpaths = tests
python_files = test_*.py
addopts =
    -q
    --cov=app
    --cov-report=term-missing
    --cov-fail-under=70
```

A meta de cobertura é 70% do pacote `app`. Não é um número simbólico: abaixo disso as regras de acessibilidade e de métricas ficam sem rede de proteção, e acima de 90% o time gastaria o sprint testando getter de Pydantic. A build falha sozinha se a cobertura cair.

**Passo 4 - Escrever o `conftest.py`**

O ponto central: o teste nunca toca o `flowity.db` real. A fixture troca a dependência `get_db` por uma sessão de SQLite em memória, criada e destruída a cada teste, e também sobrescreve `get_current_admin`, para não precisar de login em cada chamada.

Crie `backend/tests/conftest.py`:

```python
"""Fixtures compartilhadas da suíte de testes do backend."""
import io
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.core.security import get_current_admin


@pytest.fixture()
def db_session():
    """SQLite em memória, isolado por teste. StaticPool mantém a mesma conexão."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Importar os modelos registra as tabelas no metadata antes do create_all.
    from app.models import source, post, generation, post_asset, post_metric  # noqa: F401

    Base.metadata.create_all(bind=engine)
    Sessao = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    sessao = Sessao()
    try:
        yield sessao
    finally:
        sessao.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture()
def client(db_session):
    """TestClient com o banco e a autenticação substituídos."""
    def _get_db():
        try:
            yield db_session
        finally:
            pass  # o encerramento é responsabilidade da fixture db_session

    app.dependency_overrides[get_db] = _get_db
    app.dependency_overrides[get_current_admin] = lambda: "admin-de-teste"

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture()
def post_publicado(db_session):
    """Um post já publicado, base para os testes de asset e de métrica."""
    from datetime import datetime
    from app.models.post import Post

    post = Post(
        hook="Post de teste do PI 2",
        body="corpo",
        channel="linkedin",
        status="published",
        published_at=datetime(2026, 8, 26, 9, 0, 0),
    )
    db_session.add(post)
    db_session.commit()
    db_session.refresh(post)
    return post


def png_falso(tamanho_bytes: int = 1024) -> io.BytesIO:
    """PNG mínimo válido, com preenchimento até o tamanho pedido."""
    cabecalho = bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    conteudo = cabecalho + b"\x00" * max(tamanho_bytes - len(cabecalho), 0)
    return io.BytesIO(conteudo)
```

**Passo 5 - Testes de upload de asset**

Crie `backend/tests/test_assets.py`:

```python
"""Regras de upload de imagem e de texto alternativo obrigatório."""
import pytest
from tests.conftest import png_falso

CINCO_MB = 5 * 1024 * 1024


def test_upload_aceita_png(client, post_publicado):
    resposta = client.post(
        f"/posts/{post_publicado.id}/assets",
        files={"file": ("capa.png", png_falso(2048), "image/png")},
        data={"alt_text": "Gráfico de barras com a taxa de engajamento por semana"},
    )
    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["mime_type"] == "image/png"
    assert corpo["alt_text"].startswith("Gráfico de barras")


def test_upload_rejeita_svg(client, post_publicado):
    """SVG carrega script embutido e não é aceito, mesmo sendo imagem."""
    svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    resposta = client.post(
        f"/posts/{post_publicado.id}/assets",
        files={"file": ("mapa.svg", svg, "image/svg+xml")},
        data={"alt_text": "Mapa vetorial"},
    )
    assert resposta.status_code == 422
    assert "svg" in resposta.json()["detail"].lower()


def test_upload_rejeita_arquivo_maior_que_5mb(client, post_publicado):
    resposta = client.post(
        f"/posts/{post_publicado.id}/assets",
        files={"file": ("grande.png", png_falso(CINCO_MB + 1), "image/png")},
        data={"alt_text": "Imagem grande demais"},
    )
    assert resposta.status_code == 413


def test_alt_text_vazio_retorna_422(client, post_publicado):
    """Acessibilidade: WCAG 1.1.1. Alt text em branco é rejeitado na entrada."""
    resposta = client.post(
        f"/posts/{post_publicado.id}/assets",
        files={"file": ("capa.png", png_falso(), "image/png")},
        data={"alt_text": "   "},
    )
    assert resposta.status_code == 422


def test_agendar_post_com_asset_sem_alt_retorna_422(client, db_session, post_publicado):
    """Nenhum post vai para scheduled se algum asset estiver sem alt text."""
    from app.models.post_asset import PostAsset

    db_session.add(PostAsset(
        post_id=post_publicado.id,
        kind="image",
        position=0,
        file_path="sem-alt.png",
        mime_type="image/png",
        alt_text="",           # gravado direto no banco, driblando a rota
    ))
    db_session.commit()

    resposta = client.put(
        f"/posts/{post_publicado.id}",
        json={"status": "scheduled", "scheduled_at": "2026-09-10T09:00:00"},
    )
    assert resposta.status_code == 422
    assert "alt" in resposta.text.lower()
```

**Passo 6 - Testes do carrossel**

Crie `backend/tests/test_carousel.py`:

```python
"""Regras do carrossel de LinkedIn: mínimo de 3 slides e PDF gerado."""
from tests.conftest import png_falso


def _slides(quantidade: int):
    return [
        ("files", (f"slide{i}.png", png_falso(1024), "image/png"))
        for i in range(quantidade)
    ]


def test_carrossel_com_2_slides_retorna_422(client, post_publicado):
    resposta = client.post(
        f"/posts/{post_publicado.id}/carousel",
        files=_slides(2),
        data={"alt_texts": ["Slide um", "Slide dois"]},
    )
    assert resposta.status_code == 422
    assert "3" in resposta.json()["detail"]


def test_carrossel_com_5_slides_gera_5_assets_e_1_pdf(client, db_session, post_publicado):
    resposta = client.post(
        f"/posts/{post_publicado.id}/carousel",
        files=_slides(5),
        data={"alt_texts": [f"Slide {i + 1} do carrossel" for i in range(5)]},
    )
    assert resposta.status_code == 201

    corpo = resposta.json()
    assert len(corpo["slides"]) == 5
    assert corpo["pdf_path"].endswith(".pdf")

    from app.models.post_asset import PostAsset
    assets = (
        db_session.query(PostAsset)
        .filter(PostAsset.post_id == post_publicado.id, PostAsset.kind == "carousel_slide")
        .order_by(PostAsset.position)
        .all()
    )
    assert [a.position for a in assets] == [0, 1, 2, 3, 4]
    assert all(a.alt_text.strip() for a in assets)
```

**Passo 7 - Teste do cálculo da taxa de engajamento**

Crie `backend/tests/test_metrics.py`:

```python
"""O número que sustenta o dashboard e os alertas precisa estar certo."""
from datetime import datetime


def _criar_metrica(client, post_id, **campos):
    corpo = {
        "platform": "linkedin",
        "impressions": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "clicks": 0,
        "collected_at": "2026-08-27T10:00:00",
    }
    corpo.update(campos)
    return client.post(f"/posts/{post_id}/metrics", json=corpo)


def test_summary_calcula_taxa_de_engajamento(client, post_publicado):
    resposta = _criar_metrica(
        client, post_publicado.id,
        impressions=2400, likes=58, comments=11, shares=7, clicks=43,
    )
    assert resposta.status_code == 201

    resumo = client.get("/metrics/summary").json()
    # (58 + 11 + 7) / 2400 = 0.031666...
    assert abs(resumo["engagement_rate"] - 0.0317) < 0.0001
    assert resumo["total_publicados"] == 1


def test_summary_sem_impressoes_nao_divide_por_zero(client, post_publicado):
    _criar_metrica(client, post_publicado.id, impressions=0, likes=3)
    resumo = client.get("/metrics/summary").json()
    assert resumo["engagement_rate"] == 0.0


def test_summary_identifica_melhor_dia_e_horario(client, post_publicado):
    _criar_metrica(client, post_publicado.id, impressions=1000, likes=40, comments=5, shares=5)
    resumo = client.get("/metrics/summary").json()
    # O post da fixture foi publicado em 26/08/2026, uma quarta-feira, às 9h.
    assert resumo["melhor_dia_engajamento"]["dia_semana"] == "quarta"
    assert resumo["melhor_horario_engajamento"]["hora"] == 9


def test_plataforma_invalida_retorna_422(client, post_publicado):
    resposta = _criar_metrica(client, post_publicado.id, platform="tiktok")
    assert resposta.status_code == 422
```

Rode:

```bash
cd backend
pytest
```

**Passo 8 - Instalar o Vitest no frontend**

```bash
cd frontend
npm install --save-dev vitest@2 @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest-axe
```

Em `frontend/package.json`, acrescente os scripts:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
```

**Passo 9 - Configurar o Vitest**

Crie `frontend/vitest.config.js`:

```javascript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.test.{js,jsx,mjs}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/lib/**", "src/components/**"],
      thresholds: { lines: 60, functions: 60, branches: 50 },
    },
  },
});
```

Crie `frontend/src/test/setup.js`:

```javascript
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as matchers from "vitest-axe/matchers";

expect.extend(matchers);
```

**Passo 10 - Migrar os dois testes existentes**

Os arquivos atuais usam `node:assert` e são rodados com `node arquivo.test.mjs`. Traduza para o formato do Vitest, mantendo exatamente as mesmas asserções, e apague os `.test.mjs` originais.

Crie `frontend/src/lib/loginError.test.js`:

```javascript
import { describe, it, expect } from "vitest";
import { getLoginErrorMessage } from "./loginError.mjs";

describe("getLoginErrorMessage", () => {
  it("avisa quando o backend está fora do ar", () => {
    expect(getLoginErrorMessage({ request: {}, message: "Network Error" })).toBe(
      "Backend unavailable. Make sure the API is running at http://localhost:8000."
    );
  });

  it("avisa quando as credenciais estão erradas", () => {
    expect(getLoginErrorMessage({ response: { status: 401 } })).toBe(
      "Invalid username or password."
    );
  });
});
```

Faça o mesmo com `generatorValidation.test.mjs`, criando `frontend/src/lib/generatorValidation.test.js` com um `describe` por função exportada.

```bash
cd frontend
git rm src/lib/loginError.test.mjs src/lib/generatorValidation.test.mjs
```

**Passo 11 - Teste do botão Salvar e teste axe no `PostModal`**

Crie `frontend/src/components/posts/PostModal.test.jsx`:

```jsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import PostModal from "./PostModal";

const postComImagem = {
  id: 1,
  hook: "Post de teste",
  body: "corpo",
  channel: "linkedin",
  status: "draft",
  assets: [{ id: 10, kind: "image", position: 0, file_path: "capa.png", alt_text: "" }],
};

describe("PostModal e o texto alternativo obrigatório", () => {
  it("mantém o botão Salvar desabilitado enquanto o alt text estiver vazio", async () => {
    render(<PostModal post={postComImagem} open onClose={vi.fn()} onSave={vi.fn()} />);

    const salvar = screen.getByRole("button", { name: /salvar/i });
    expect(salvar).toBeDisabled();

    await userEvent.type(
      screen.getByLabelText(/texto alternativo/i),
      "Capa roxa com o titulo do post em destaque"
    );

    expect(salvar).toBeEnabled();
  });

  it("não chama onSave quando o alt text tem apenas espaços", async () => {
    const onSave = vi.fn();
    render(<PostModal post={postComImagem} open onClose={vi.fn()} onSave={onSave} />);

    await userEvent.type(screen.getByLabelText(/texto alternativo/i), "   ");
    await userEvent.click(screen.getByRole("button", { name: /salvar/i }));

    expect(onSave).not.toHaveBeenCalled();
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(
      <PostModal post={postComImagem} open onClose={vi.fn()} onSave={vi.fn()} />
    );
    const resultado = await axe(container);
    expect(resultado).toHaveNoViolations();
  });
});
```

**Passo 12 - Teste axe da `CarouselPage`**

Crie `frontend/src/pages/CarouselPage.test.jsx`:

```jsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";
import CarouselPage from "./CarouselPage";

// O axios não faz requisição de verdade dentro do jsdom.
vi.mock("../lib/api", () => ({
  postsApi: { get: vi.fn().mockResolvedValue({ data: { id: 1, hook: "Teste", assets: [] } }) },
  carouselApi: { create: vi.fn() },
}));

describe("CarouselPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/carousel/1"]}>
        <CarouselPage />
      </MemoryRouter>
    );

    await screen.findByRole("heading", { level: 1 });

    const resultado = await axe(container);
    expect(resultado).toHaveNoViolations();
  });
});
```

```bash
cd frontend
npm test
```

**Passo 13 - Criar o workflow do GitHub Actions**

Crie `.github/workflows/tests.yml`. As duas suítes rodam em jobs paralelos, para o resultado do backend não ficar esperando o `npm ci`.

```yaml
name: Testes

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  backend:
    name: pytest (backend)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
          cache-dependency-path: backend/requirements-dev.txt

      - name: Instalar dependências
        run: pip install -r requirements-dev.txt

      - name: Rodar os testes com cobertura
        env:
          DATABASE_URL: "sqlite:///./test.db"
          JWT_SECRET: "segredo-de-teste-nao-usar-em-producao"
        run: pytest

  frontend:
    name: vitest (frontend)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Instalar dependências
        run: npm ci

      - name: Rodar os testes
        run: npm run test:coverage

      - name: Conferir que o build continua passando
        run: npm run build
```

Depois do primeiro PR verde, peça ao responsável pelo repositório para marcar os checks "pytest (backend)" e "vitest (frontend)" como obrigatórios em Settings, Branches, regra da `main`.

**Passo 14 - Commit e Pull Request**

```bash
git add backend/requirements-dev.txt backend/pytest.ini backend/tests/ frontend/package.json frontend/package-lock.json frontend/vitest.config.js frontend/src/test/ frontend/src/lib/*.test.js frontend/src/components/posts/PostModal.test.jsx frontend/src/pages/CarouselPage.test.jsx .github/workflows/tests.yml
git commit -m "test: configura pytest e vitest com testes de imagem, carrossel, alt text e metricas

Instala pytest, pytest-cov e httpx no backend com fixture de SQLite em
memoria e override de get_db e get_current_admin. Instala vitest,
testing-library, jsdom e vitest-axe no frontend, migra os dois testes
soltos em .test.mjs e cobre o alt text obrigatorio e a acessibilidade do
PostModal e da CarouselPage. Adiciona o workflow que roda as duas
suites em todo pull request."
git push -u origin feat/pi2-16-testes-automatizados
gh pr create --base main --title "[PI2][P0][Testing] Configurar testes automatizados (pytest + Vitest)" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

```bash
cd backend && pytest
```

```text
tests/test_assets.py .....                                               [ 41%]
tests/test_carousel.py ..                                                [ 58%]
tests/test_metrics.py ....                                               [100%]

---------- coverage: platform linux, python 3.12.3-final-0 -----------
Name                                    Stmts   Miss  Cover   Missing
---------------------------------------------------------------------
app/repositories/metrics.py                74      9    88%   142-150
app/routes/assets.py                       46      4    91%   61-64
app/services/carousel.py                   58     11    81%   88-98
---------------------------------------------------------------------
TOTAL                                     612    168    73%

Required test coverage of 70% reached. Total coverage: 72.55%
11 passed in 3.42s
```

```bash
cd frontend && npm test
```

```text
 ✓ src/lib/loginError.test.js (2)
 ✓ src/lib/generatorValidation.test.js (6)
 ✓ src/components/posts/PostModal.test.jsx (3)
   ✓ mantém o botão Salvar desabilitado enquanto o alt text estiver vazio
   ✓ não chama onSave quando o alt text tem apenas espaços
   ✓ não tem violações de acessibilidade
 ✓ src/pages/CarouselPage.test.jsx (1)
   ✓ não tem violações de acessibilidade

 Test Files  4 passed (4)
      Tests  12 passed (12)
   Duration  4.18s
```

Falha esperada quando alguém torna o alt text opcional:

```text
 FAIL  src/components/posts/PostModal.test.jsx > mantém o botão Salvar desabilitado
AssertionError: expected element to be disabled
- Expected: disabled
+ Received: enabled
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Cobertura do backend | `pytest` com `--cov-fail-under=70` | maior ou igual a 70%, com a build falhando abaixo disso |
| Cobertura do frontend | `npm run test:coverage` em `src/lib` e `src/components` | maior ou igual a 60% de linhas |
| Violações de acessibilidade | `axe` no `PostModal` e na `CarouselPage` | 0 violações nos dois componentes |
| Regras críticas cobertas | Contar os testes que passam por png aceito, svg rejeitado, arquivo acima de 5 MB, alt vazio, agendamento sem alt, 2 slides, 5 slides e taxa de engajamento | 8 de 8 regras com teste |
| Testes soltos eliminados | `ls frontend/src/lib/*.test.mjs` | nenhum arquivo restante |
| Tempo da pipeline | Duração do workflow "Testes" em um pull request | menos de 4 minutos no total |
| Detecção de regressão | Remover `nullable=False` de `alt_text` e rodar as suítes | pelo menos 1 teste falha |

## Definition of Done

- [ ] `backend/requirements-dev.txt` e `backend/pytest.ini` criados, com meta de cobertura de 70%
- [ ] `conftest.py` com `TestClient` e SQLite em memória sobrescrevendo `get_db` e `get_current_admin`
- [ ] Testes de asset cobrindo png aceito, svg rejeitado, acima de 5 MB, alt vazio e agendamento bloqueado sem alt
- [ ] Testes de carrossel cobrindo 2 slides rejeitados e 5 slides gerando 5 assets mais 1 PDF
- [ ] Teste de `GET /metrics/summary` conferindo a taxa de engajamento com tolerância de 0.0001
- [ ] Vitest, Testing Library, jsdom e vitest-axe instalados, com o script `"test": "vitest run"`
- [ ] Os dois `.test.mjs` migrados e os arquivos antigos removidos
- [ ] Teste do botão Salvar desabilitado sem alt text passando
- [ ] Testes axe com 0 violações no `PostModal` e na `CarouselPage`
- [ ] `.github/workflows/tests.yml` rodando as duas suítes em pull request, verde no PR desta issue
- [ ] Checks marcados como obrigatórios na proteção da `main`
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- pytest - Documentação e fixtures: https://docs.pytest.org/en/stable/how-to/fixtures.html
- pytest-cov - Cobertura: https://pytest-cov.readthedocs.io/en/latest/
- FastAPI - Testando a aplicação: https://fastapi.tiangolo.com/tutorial/testing/
- FastAPI - Sobrescrevendo dependências nos testes: https://fastapi.tiangolo.com/advanced/testing-dependencies/
- SQLAlchemy - `StaticPool` com SQLite em memória: https://docs.sqlalchemy.org/en/20/dialects/sqlite.html#using-a-memory-database-in-multiple-threads
- Vitest - Guia de configuração: https://vitest.dev/guide/
- Vitest - Cobertura e thresholds: https://vitest.dev/guide/coverage.html
- Testing Library - React: https://testing-library.com/docs/react-testing-library/intro/
- Testing Library - Queries por papel acessível: https://testing-library.com/docs/queries/byrole/
- vitest-axe: https://github.com/chaance/vitest-axe
- axe-core - Regras verificadas: https://dequeuniversity.com/rules/axe/4.9
- GitHub Actions - `setup-python` e `setup-node`: https://docs.github.com/en/actions/automating-builds-and-tests
- WCAG 2.1 - Critério 1.1.1 Conteúdo não textual: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
