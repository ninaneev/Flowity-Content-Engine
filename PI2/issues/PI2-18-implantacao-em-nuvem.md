<!-- TITLE: [PI2][P0][Infra] Implantar a aplicação em nuvem com banco gerenciado e armazenamento de mídia -->
<!-- LABELS: area:infra,prio:p0 -->

## Contexto (PI 2)

No PI 1 a aplicação rodava apenas na máquina local, por Docker Compose. Isso impediu que a comunidade
externa usasse o sistema fora da demonstração e limitou a coleta de dados de uso. O PI 2 exige a
aplicação implantada em nuvem, com banco de dados gerenciado, variáveis de configuração fora do
repositório e mídia (imagens e carrosséis) armazenada de forma persistente. Sem persistência de mídia, a
funcionalidade de imagens do PI 2 se perde a cada reinicialização do contêiner.

## Integrante responsável

Davi Corrêa Bueno (apoio: Andrea Nina Maciel Cressoni)

## Branch

`feat/pi2-18-deploy-nuvem`

## Estimativa

8 a 12 horas

## Arquivos que você vai criar ou editar

- `infra/deploy/README.md` - procedimento de implantação passo a passo
- `backend/Dockerfile` - imagem de produção (revisar)
- `frontend/Dockerfile` ou configuração de build estático - revisar
- `docker-compose.prod.yml` - composição de produção
- `.env.example` - novas variáveis (sem valores reais)
- `backend/app/core/config.py` - `MEDIA_BACKEND`, `MEDIA_DIR`, `S3_*`, `CORS_ORIGINS`
- `.github/workflows/deploy.yml` - build e publicação da imagem

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-18-deploy-nuvem
```

**Passo 2 - Escolher o provedor e registrar a decisão**

Compare no `infra/deploy/README.md` pelo menos duas opções (por exemplo Render e Railway para a
aplicação, com PostgreSQL gerenciado; ou uma VPS com Docker Compose). Registre custo, limite do plano
gratuito, se persiste disco e por que a opção foi escolhida. Essa justificativa entra no Relatório
Final.

**Passo 3 - Separar configuração de código**

Nenhuma credencial pode ir para o repositório. Todas as variáveis vêm do ambiente:

```python
class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./flowity.db"
    CORS_ORIGINS: str = "http://localhost:5173"
    MEDIA_BACKEND: str = "local"          # local | s3
    MEDIA_DIR: str = "./media"
    S3_ENDPOINT: str | None = None
    S3_BUCKET: str | None = None
    S3_ACCESS_KEY: str | None = None
    S3_SECRET_KEY: str | None = None
```

Atualize o `.env.example` com as chaves e **valores vazios ou de exemplo**. Confirme que `.env` está no
`.gitignore` antes de qualquer commit.

**Passo 4 - Resolver a persistência da mídia**

Sistema de arquivos de contêiner é efêmero. Implemente `backend/app/services/storage.py` com duas
implementações atrás da mesma interface:

```python
class Storage(Protocol):
    def save(self, key: str, data: bytes, mime_type: str) -> str: ...
    def url(self, key: str) -> str: ...
    def delete(self, key: str) -> None: ...
```

`LocalStorage` para desenvolvimento (grava em `MEDIA_DIR`) e `S3Storage` para produção (bucket S3 ou
compatível). A escolha é feita por `MEDIA_BACKEND`. Os endpoints de assets do PI 2 devem usar essa
interface e nunca escrever caminho de arquivo direto.

**Passo 5 - Migrar o banco em produção**

```bash
alembic upgrade head
```

Rode como etapa de release, não no `startup` da aplicação. Documente o comando exato usado no provedor.

**Passo 6 - Configurar CORS e a URL da API no front-end**

O back-end libera apenas a origem do front-end publicado (`CORS_ORIGINS`). O front-end usa
`VITE_API_URL` no build; nada de `localhost` fixo no código.

**Passo 7 - Publicar e testar de outra máquina**

Teste a partir de uma rede diferente da sua: login, cadastro de source, geração de post, upload de
imagem, geração de carrossel, download do PDF e recarregamento da página depois de reiniciar o serviço
(a imagem tem que continuar acessível).

**Passo 8 - Automatizar o build**

`.github/workflows/deploy.yml`: em push para `main`, roda os testes, constrói a imagem e dispara a
publicação. Segredos ficam em GitHub Secrets.

**Passo 9 - Commit e Pull Request**

```bash
git add infra docker-compose.prod.yml .env.example backend/app .github/workflows
git commit -m "infra(pi2): implantacao em nuvem com banco gerenciado e storage de midia"
git push origin feat/pi2-18-deploy-nuvem
```

## Exemplo de uso

```bash
# Verificação pós-implantação
curl -i https://<dominio-publicado>/health
curl -i https://<dominio-publicado>/docs

# A imagem gerada continua acessível depois de um restart do servico
curl -I https://<dominio-publicado>/media/posts/42/slide-01.png
```

```text
HTTP/2 200
content-type: image/png
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Disponibilidade pública | `GET /health` de outra rede | 200 em 3 tentativas seguidas |
| Persistência da mídia | Reiniciar o serviço e recarregar a imagem | Imagem continua acessível |
| Segredos no repositório | `git log -p` e varredura do diff | 0 credenciais versionadas |
| Tempo de resposta da API | Tempo do `GET /posts` com 100 registros | < 800 ms |
| Reprodutibilidade | Outro integrante segue o README e sobe um ambiente | Sucesso sem ajuda |

## Definition of Done

- [ ] Aplicação acessível por URL pública (front-end e `/docs` do back-end)
- [ ] Banco PostgreSQL gerenciado em uso, com `alembic upgrade head` aplicado
- [ ] Mídia persistente após reinicialização do serviço
- [ ] `.env.example` atualizado e nenhum segredo versionado
- [ ] CORS restrito à origem do front-end publicado
- [ ] `infra/deploy/README.md` com o procedimento completo e a justificativa da escolha do provedor
- [ ] Workflow de build no GitHub Actions rodando verde
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- `PI1/architecture.md` e `PI1/setup.md`
- FastAPI - Deployment: https://fastapi.tiangolo.com/deployment/
- Alembic: https://alembic.sqlalchemy.org/
- Docker - Manage data in Docker: https://docs.docker.com/storage/
- GitHub Actions: https://docs.github.com/actions
