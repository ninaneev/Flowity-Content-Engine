# Tarefas dos Integrantes - PI 2 (Flowity Content Engine 2.0)

> Continuação de `docs/PI1/team-tasks.md`. As tarefas do PI 1 continuam lá, para consulta.
> Cada tarefa aqui é uma **issue** no GitHub, no projeto **Flowity Content Engine - PI 2**.
> Cada integrante trabalha numa **branch separada**. Toda alteração entra por **Pull Request**,
> aprovado pelo líder antes do merge em `main`.

Repositório: https://github.com/ninaneev/Flowity-Content-Engine
Projeto (quadro): https://github.com/users/ninaneev/projects/4

---

## O que muda do PI 1 para o PI 2

No PI 1 o sistema gerava **texto**. No PI 2 ele passa a gerar a **peça completa**: texto, imagem única e
carrossel para o LinkedIn, com **acessibilidade obrigatória** (texto alternativo em toda imagem,
navegação por teclado, contraste conforme WCAG 2.1 AA, HTML semântico), rodando **em nuvem**, com
**análise de dados** das publicações e **testes automatizados**.

O levantamento que originou esse escopo está em `docs/PI2/perguntas-continuidade-pi1.md`.
A bibliografia está em `docs/PI2/referencias-bibliograficas.md`.
O texto do Plano de Ação está em `docs/PI2/plano-de-acao-pi2-texto.md`.

---

## Regras de trabalho (valem para todos)

1. **Uma issue = uma branch = um Pull Request.** Nome da branch está escrito na própria issue.
2. **Nunca commitar direto na `main`.**
3. **Nunca commitar `.env` nem credencial.** Só o `.env.example`, com valores vazios.
4. **Todo PR fecha a issue** com a linha `Closes #<numero>` na descrição.
5. **Toda imagem precisa de texto alternativo.** Isso não é opcional em nenhuma tarefa do PI 2;
   é requisito legal (Lei nº 13.146/2015) e critério de aceitação.
6. **Comentar o andamento na issue** pelo menos uma vez por semana (daily assíncrona).
7. Antes de abrir o PR, rode a aplicação e confira que **nada do PI 1 quebrou**.

Fluxo padrão, em qualquer tarefa:

```bash
git checkout main
git pull origin main
git checkout -b <branch-da-issue>
# ... trabalha ...
git add <arquivos>
git commit -m "feat: descricao curta em portugues"
git push origin <branch-da-issue>
# abre o Pull Request no GitHub com "Closes #<numero>"
```

---

## Distribuição das tarefas

| Issue | Tarefa | Integrante | Área | Prioridade |
|---|---|---|---|---|
| [#79](https://github.com/ninaneev/Flowity-Content-Engine/issues/79) | Modelo `PostAsset` e migração para imagens do post | Davi Corrêa Bueno | Backend | P0 |
| [#80](https://github.com/ninaneev/Flowity-Content-Engine/issues/80) | API de assets do post (upload, listar, reordenar, remover) | Jeferson Ferraz Ferreira | Backend | P0 |
| [#81](https://github.com/ninaneev/Flowity-Content-Engine/issues/81) | Serviço de renderização de imagem única (Pillow) | Diego Gustavo Franco | Backend | P1 |
| [#82](https://github.com/ninaneev/Flowity-Content-Engine/issues/82) | Serviço de geração de carrossel do LinkedIn (PNG + PDF) | Davi Corrêa Bueno | Backend | P0 |
| [#83](https://github.com/ninaneev/Flowity-Content-Engine/issues/83) | Texto alternativo obrigatório e validado na API | Jeferson Ferraz Ferreira | Backend | P0 |
| [#84](https://github.com/ninaneev/Flowity-Content-Engine/issues/84) | Contrato da API de mídia e documentação no OpenAPI | Diego Gustavo Franco | Backend | P1 |
| [#85](https://github.com/ninaneev/Flowity-Content-Engine/issues/85) | Upload e pré-visualização de imagem no PostModal | Pedro Luiz Simonetti Filho | Frontend | P0 |
| [#86](https://github.com/ninaneev/Flowity-Content-Engine/issues/86) | CarouselBuilder: montar, reordenar e pré-visualizar | Roger Luiz de Paula | Frontend | P0 |
| [#87](https://github.com/ninaneev/Flowity-Content-Engine/issues/87) | Acessibilidade WCAG 2.1 AA na aplicação | Pedro Luiz Simonetti Filho | Frontend | P0 |
| [#88](https://github.com/ninaneev/Flowity-Content-Engine/issues/88) | Navegação por teclado e leitor de tela | Roger Luiz de Paula | Frontend | P1 |
| [#93](https://github.com/ninaneev/Flowity-Content-Engine/issues/93) | Exportar e baixar o carrossel (PNG e PDF) | Tiago Antonio Ferreira | Frontend | P1 |
| [#89](https://github.com/ninaneev/Flowity-Content-Engine/issues/89) | Modelo `PostMetric` e ingestão de métricas | João Maike Silva de Jesus | Backend | P1 |
| [#90](https://github.com/ninaneev/Flowity-Content-Engine/issues/90) | Dashboard de análise de dados (LinkedIn x X) | João Maike Silva de Jesus | Frontend | P1 |
| [#91](https://github.com/ninaneev/Flowity-Content-Engine/issues/91) | Alertas de engajamento com limite configurável | Tiago Antonio Ferreira | Full-stack | P1 |
| [#92](https://github.com/ninaneev/Flowity-Content-Engine/issues/92) | Busca e filtros avançados na biblioteca de Sources | Diego Gustavo Franco | Full-stack | P1 |
| [#96](https://github.com/ninaneev/Flowity-Content-Engine/issues/96) | Testes automatizados (pytest + Vitest) | Jeferson Ferraz Ferreira | Testing | P0 |
| [#94](https://github.com/ninaneev/Flowity-Content-Engine/issues/94) | Medição do ganho de tempo (linha de base x PI 2) | Andrea Nina Maciel Cressoni | Projeto | P1 |
| [#95](https://github.com/ninaneev/Flowity-Content-Engine/issues/95) | Implantação em nuvem com banco e mídia persistente | Davi Corrêa Bueno (apoio: Andrea) | Infra | P0 |

Por integrante:

| Integrante | Issues |
|---|---|
| Andrea Nina Maciel Cressoni | #94 (e coordenação geral, apoio no #95) |
| Tiago Antonio Ferreira | #93, #91 |
| João Maike Silva de Jesus | #89, #90 |
| Davi Corrêa Bueno | #79, #82, #95 |
| Pedro Luiz Simonetti Filho | #85, #87 |
| Roger Luiz de Paula | #86, #88 |
| Jeferson Ferraz Ferreira | #80, #83, #96 |
| Diego Gustavo Franco | #81, #84, #92 |

---

## Ordem de execução (dependências)

Nem tudo pode começar ao mesmo tempo. A ordem abaixo evita retrabalho:

```
Onda 1 (base, começar já)
  #79 modelo PostAsset  ──┐
  #95 nuvem/storage     ──┤
  #87 acessibilidade    ──┤ (independente, pode ir em paralelo)
  #92 filtros de Sources ─┘ (independente)

Onda 2 (depende da onda 1)
  #80 API de assets       (precisa do #79)
  #83 validação alt text  (precisa do #79)
  #89 modelo PostMetric   (independente, pode antecipar)

Onda 3 (depende da onda 2)
  #81 imagem única        (precisa do #80)
  #82 carrossel           (precisa do #80)
  #85 upload no PostModal (precisa do #80)
  #90 dashboard           (precisa do #89)
  #91 alertas             (precisa do #89)

Onda 4 (fecha o fluxo)
  #86 CarouselBuilder     (precisa do #82 e do #85)
  #88 teclado/leitor      (precisa do #86)
  #93 exportar carrossel  (precisa do #82 e do #86)
  #84 contrato OpenAPI    (precisa de #80, #81, #82)

Contínuo
  #96 testes          (cresce junto com cada entrega)
  #94 medição de tempo    (coleta ao longo das quinzenas 4 a 6)
```

---

## Como cada um começa (passo a passo comum)

**Passo 1 - Abra a sua issue no GitHub.** Cada issue tem: contexto, arquivos a editar, passo a passo com
código pronto para copiar, exemplo de uso, critérios de medição de sucesso e a Definition of Done.

**Passo 2 - Suba o ambiente local**

```bash
# na raiz do projeto
docker compose up -d          # banco e serviços
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

Front-end em http://localhost:5173, documentação da API em http://localhost:8000/docs.
Se algo não subir, veja `docs/PI1/setup.md`.

**Passo 3 - Crie a branch com o nome exato que está na issue.**

**Passo 4 - Trabalhe em passos pequenos e commite com frequência.**

**Passo 5 - Antes de abrir o PR, confira a Definition of Done da issue item por item.**
Se sua tarefa mexe em tela, rode também a checagem de acessibilidade (extensão axe DevTools ou
Lighthouse no Chrome) e anexe a captura de tela no PR.

**Passo 6 - Abra o Pull Request** com título curto, descrição do que mudou, print ou GIF quando for
tela, e a linha `Closes #<numero>`.

---

## Cerimônias (Scrum simplificado, igual ao PI 1)

| Cerimônia | Quando | Duração |
|---|---|---|
| Planejamento da quinzena | Início de cada quinzena | 30 min |
| Daily assíncrona | Todo dia | 5 min (comentário na issue) |
| Revisão | Fim da quinzena | 20 min |
| Retrospectiva | Após a revisão | 15 min |

Entregas oficiais no AVA: Plano de Ação (01/09), Relatório Parcial (30/09), Relatório Final e vídeo
(06/11). Datas completas em `docs/PI2/plano-de-acao-pi2-texto.md`.

---

## Critério de acessibilidade que vale para todas as tarefas de tela

Antes de marcar qualquer tarefa de front-end como concluída:

- [ ] Toda imagem tem `alt` significativo (não "imagem", não vazio, salvo decorativa com `alt=""`)
- [ ] Dá para completar a tarefa **só com o teclado** (Tab, Shift+Tab, Enter, Espaço, setas, Esc)
- [ ] O foco é **visível** em todos os elementos interativos
- [ ] Nenhuma informação é passada **apenas por cor**
- [ ] Contraste de texto de no mínimo **4.5:1**
- [ ] Elementos clicáveis são `button` ou `a`, nunca `div` com `onClick`
- [ ] Campos de formulário têm `<label>` associado por `htmlFor`
- [ ] axe DevTools acusa **0 violações críticas ou sérias** na tela alterada

Referências: WCAG 2.1 (W3C, 2018), eMAG (2014), Lei nº 13.146/2015.
