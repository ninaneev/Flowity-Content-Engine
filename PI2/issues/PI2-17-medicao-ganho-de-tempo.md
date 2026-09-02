<!-- TITLE: [PI2][P1][Docs] Medir o ganho de tempo: linha de base manual x Flowity Content Engine -->
<!-- LABELS: area:project,type:docs,prio:p1 -->

## Contexto (PI 2)

O Relatório Final do PI 1 afirmou que houve ganho de organização, mas não apresentou nenhum número,
porque a coleta não foi planejada antes do uso. Esta tarefa corrige a lacuna: define a linha de base do
processo manual, instrumenta a aplicação para registrar tempo e produz o teste de desempenho e
eficiência que será apresentado nos resultados do PI 2. Sem ela, o relatório final repete o mesmo
problema do PI 1.

## Integrante responsável

Andrea Nina Maciel Cressoni

## Branch

`feat/pi2-17-medicao-tempo`

## Estimativa

6 a 8 horas (mais o tempo de coleta ao longo das quinzenas 4 a 6)

## Arquivos que você vai criar ou editar

- `PI2/medicao-desempenho.md` - protocolo do teste, linha de base e planilha de resultados
- `PI2/dados/tempos-producao.csv` - dados brutos coletados
- `backend/app/models/post.py` - novos campos de tempo declarado
- `backend/app/schemas/post.py` - expõe os novos campos
- `frontend/src/components/posts/PostModal.jsx` - campo "tempo gasto fora da ferramenta (min)"

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-17-medicao-tempo
```

**Passo 2 - Registrar a linha de base do processo manual**

Crie `PI2/medicao-desempenho.md` com a tabela da linha de base, reconstituída junto à Flowity AI
a partir dos registros de maio de 2026 (o levantamento já está em
`PI2/perguntas-continuidade-pi1.md`, seção 2, Pergunta 1):

| Etapa | Tempo manual | Ferramenta |
|---|---|---|
| Encontrar a referência ou ideia | 10 a 20 min | notas soltas, itens salvos |
| Escrever o rascunho | 25 a 40 min | documento em branco |
| Revisar e ajustar tom | 10 min | documento |
| Montar imagem ou carrossel | 30 a 60 min | Canva |
| Programar ou publicar | 5 a 10 min | LinkedIn |
| Total por publicação | 80 a 140 min | 5 ferramentas |

**Passo 3 - Instrumentar o back-end**

Adicione ao modelo `Post` os campos de tempo declarado, que complementam os carimbos automáticos que já
existem (`created_at`, `updated_at`, `scheduled_at`, `published_at`):

```python
    # ── Medição de desempenho (PI 2) ──────────────────────────────
    external_minutes: Mapped[int | None] = mapped_column(
        Integer, comment="Minutos gastos fora da aplicação nesta publicação"
    )
    tools_used: Mapped[int | None] = mapped_column(
        Integer, comment="Quantidade de ferramentas diferentes usadas nesta publicação"
    )
    workflow: Mapped[str | None] = mapped_column(
        String(20), comment="manual | engine_pi1 | engine_pi2"
    )
```

Gere a migração:

```bash
cd backend
alembic revision --autogenerate -m "add performance measurement fields to posts"
alembic upgrade head
```

**Passo 4 - Expor os campos na API e no formulário**

Inclua os três campos em `PostBase`, `PostUpdate` e `PostResponse` e adicione ao `PostModal` um bloco
"Medição do PI 2" com um campo numérico para minutos gastos fora da ferramenta e um seletor de fluxo
(`manual`, `engine_pi1`, `engine_pi2`). O campo deve ter `<label>` associado e texto de ajuda explicando
para que serve, para não parecer burocracia sem sentido a quem preenche.

**Passo 5 - Criar o endpoint de consolidação**

```python
@router.get("/reports/performance")
def performance_report(db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Compara tempo médio por publicação entre os fluxos manual, PI 1 e PI 2."""
```

A resposta deve trazer, por `workflow`: número de publicações, tempo médio total por publicação, desvio
padrão, média de ferramentas usadas e percentual de imagens com texto alternativo preenchido.

**Passo 6 - Coletar os dados**

Colete 10 publicações por fluxo. As do fluxo manual são cronometradas em uma sessão de reconstituição
com a Flowity AI (a pessoa refaz o processo antigo com um post real); as do fluxo PI 2 são medidas em
uso normal, ao longo das quinzenas 4 a 6. Registre tudo em `PI2/dados/tempos-producao.csv` com as
colunas: `id_post,workflow,data,minutos_ferramenta,minutos_externos,ferramentas,alt_preenchido`.

**Passo 7 - Escrever a análise**

Feche `PI2/medicao-desempenho.md` com: tabela comparativa dos três fluxos, gráfico de barras do
tempo médio, cálculo do percentual de redução e uma seção de limitações honesta (amostra pequena, uma
única empresa participante, parte do tempo é autodeclarada). Limitação declarada vale mais na banca do
que número inflado.

**Passo 8 - Commit e Pull Request**

```bash
git add PI2 backend/app frontend/src
git commit -m "docs(pi2): protocolo e instrumentacao da medicao de ganho de tempo"
git push origin feat/pi2-17-medicao-tempo
```

## Exemplo de uso

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/reports/performance
```

```json
{
  "manual":      {"posts": 10, "minutos_medios": 112.4, "ferramentas_medias": 5.0, "alt_preenchido_pct": 20.0},
  "engine_pi1":  {"posts": 10, "minutos_medios": 68.1,  "ferramentas_medias": 3.0, "alt_preenchido_pct": 30.0},
  "engine_pi2":  {"posts": 10, "minutos_medios": 41.7,  "ferramentas_medias": 1.0, "alt_preenchido_pct": 100.0},
  "reducao_pi2_vs_manual_pct": 62.9
}
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Publicações medidas por fluxo | Linhas no CSV agrupadas por `workflow` | >= 10 em cada um dos 3 fluxos |
| Redução do tempo total por publicação | `reducao_pi2_vs_manual_pct` no endpoint | >= 50% |
| Ferramentas usadas por publicação | Média de `tools_used` no fluxo `engine_pi2` | <= 2 |
| Imagens com texto alternativo | Percentual no fluxo `engine_pi2` | 100% |
| Rastreabilidade | Cada linha do CSV aponta para um `id_post` real | 100% |

## Definition of Done

- [ ] `PI2/medicao-desempenho.md` criado com linha de base, protocolo, resultados e limitações
- [ ] Campos `external_minutes`, `tools_used` e `workflow` criados no modelo e na migração
- [ ] Campos disponíveis na API e preenchíveis pelo PostModal, com `<label>` associado
- [ ] Endpoint `GET /reports/performance` funcionando e documentado no `/docs`
- [ ] CSV com no mínimo 30 registros (10 por fluxo) versionado em `PI2/dados/`
- [ ] Seção de resultados pronta para ser colada no Relatório Final
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- `PI2/perguntas-continuidade-pi1.md` - levantamento com a comunidade externa
- ISO/IEC 25010:2011 - modelo de qualidade (eficiência de desempenho e usabilidade)
- PRESSMAN, R. S.; MAXIM, B. R. Engenharia de software: uma abordagem profissional. 8. ed. 2016
- SQLAlchemy 2.0: https://docs.sqlalchemy.org/
- Alembic: https://alembic.sqlalchemy.org/
