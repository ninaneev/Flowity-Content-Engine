# PI 2 — Projeto Integrador em Computação II

Documentação do segundo Projeto Integrador do grupo, sobre o Flowity Content Engine 2.0.
A documentação do PI 1 continua em [`../PI1/`](../PI1/).

## Escopo do PI 2

Gerar a peça de conteúdo completa dentro da aplicação — texto, imagem única e carrossel para o
LinkedIn — com acessibilidade por padrão (texto alternativo obrigatório, navegação por teclado,
contraste WCAG 2.1 AA, HTML semântico), aplicação em nuvem, API consolidada, análise de dados das
publicações e testes automatizados.

## Arquivos

| Arquivo | O que é |
|---|---|
| [`team-tasks-pi2.md`](team-tasks-pi2.md) | **Comece por aqui.** As 16 tarefas com o passo a passo completo, na ordem de execução |
| [`plano-de-acao-pi2-texto.md`](plano-de-acao-pi2-texto.md) | Texto pronto de cada campo do Plano de Ação, incluindo as 7 quinzenas |
| [`Plano_de_Acao_PI2_Flowity_Content_Engine.docx`](Plano_de_Acao_PI2_Flowity_Content_Engine.docx) | Documento oficial entregue no AVA |
| [`perguntas-continuidade-pi1.md`](perguntas-continuidade-pi1.md) | Levantamento com a comunidade externa: o novo problema e as respostas às 5 perguntas do grupo |
| [`referencias-bibliograficas.md`](referencias-bibliograficas.md) | Bibliografia em ABNT, com indicação de onde usar cada referência no relatório |
| [`issues/`](issues/) | Texto de cada issue do GitHub (a versão curta; o passo a passo está no `team-tasks-pi2.md`) |

## Quadro no GitHub

- Projeto: https://github.com/users/ninaneev/projects/4
- Filtro das issues do PI 2 no repositório: `label:sprint:pi2`
- O board tem um campo numérico **Tarefa** (1 a 16). Ordene por ele para ver na ordem de execução,
  senão o GitHub lista pela ordem em que os itens entraram no quadro.

## As 16 tarefas

Duas por integrante. A coluna "Depende de" define a ordem.

| # | Tarefa | Integrante | Issue | Depende de |
|---|--------|-----------|-------|-----------|
| T1 | Modelo PostAsset | Davi Corrêa Bueno | [#79](https://github.com/ninaneev/Flowity-Content-Engine/issues/79) | — |
| T2 | Acessibilidade da aplicação | Pedro Luiz Simonetti Filho | [#87](https://github.com/ninaneev/Flowity-Content-Engine/issues/87) | — |
| T3 | Modelo PostMetric | João Maike Silva de Jesus | [#89](https://github.com/ninaneev/Flowity-Content-Engine/issues/89) | — |
| T4 | Implantação em nuvem | Andrea Nina Maciel Cressoni | [#95](https://github.com/ninaneev/Flowity-Content-Engine/issues/95) | — |
| T5 | API de imagens do post | Jeferson Ferraz Ferreira | [#80](https://github.com/ninaneev/Flowity-Content-Engine/issues/80) | T1 |
| T6 | Texto alternativo obrigatório | Jeferson Ferraz Ferreira | [#83](https://github.com/ninaneev/Flowity-Content-Engine/issues/83) | T1 |
| T7 | Imagem única com Pillow | Diego Gustavo Franco | [#81](https://github.com/ninaneev/Flowity-Content-Engine/issues/81) | T5 |
| T8 | Carrossel do LinkedIn | Davi Corrêa Bueno | [#82](https://github.com/ninaneev/Flowity-Content-Engine/issues/82) | T5, T7 |
| T9 | Upload de imagem no post | Pedro Luiz Simonetti Filho | [#85](https://github.com/ninaneev/Flowity-Content-Engine/issues/85) | T5 |
| T10 | Montar o carrossel do LinkedIn | Roger Luiz de Paula | [#86](https://github.com/ninaneev/Flowity-Content-Engine/issues/86) | T8, T9 |
| T11 | Teclado e leitor de tela no carrossel | Roger Luiz de Paula | [#88](https://github.com/ninaneev/Flowity-Content-Engine/issues/88) | T10 |
| T12 | Baixar o carrossel em PDF | Tiago Antonio Ferreira | [#93](https://github.com/ninaneev/Flowity-Content-Engine/issues/93) | T8, T10 |
| T13 | Painel de análise das publicações | João Maike Silva de Jesus | [#90](https://github.com/ninaneev/Flowity-Content-Engine/issues/90) | T3 |
| T14 | Alerta de engajamento baixo | Tiago Antonio Ferreira | [#91](https://github.com/ninaneev/Flowity-Content-Engine/issues/91) | T3 |
| T15 | Testes automatizados do projeto | Diego Gustavo Franco | [#96](https://github.com/ninaneev/Flowity-Content-Engine/issues/96) | T5, T6 |
| T16 | Medir o ganho de tempo | Andrea Nina Maciel Cressoni | [#94](https://github.com/ninaneev/Flowity-Content-Engine/issues/94) | — |

Podem começar no primeiro dia: **T1, T2, T3, T4 e T16**.

## Fora do escopo do PI 2

Registrado aqui para entrar no Relatório Final como trabalho futuro, com a justificativa:

- **Busca e filtros avançados na biblioteca de Sources** — issue #92, encerrada no replanejamento.
  A necessidade está descrita na Pergunta 3 de `perguntas-continuidade-pi1.md`.
- **Publicação automática direta na API do LinkedIn** — depende de aprovação de aplicativo junto à
  plataforma.
- **Armazenamento de mídia em S3** — o PI 2 usa disco persistente; a interface de storage fica
  preparada para a troca.

A documentação da API, que era a issue #84, virou critério de aceitação dentro da T5.
