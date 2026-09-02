# Plano de Ação - PI 2 - texto para preenchimento

Texto pronto para colar em cada campo do documento `Plano_de_Acao_PI2_Flowity_Content_Engine.docx`.
Revisão de 02/09/2026, incorporando o novo problema levantado com a comunidade externa: geração de
imagens e carrosséis e acessibilidade (ver `perguntas-continuidade-pi1.md`).

---

## Integrantes

Andrea Nina Maciel Cressoni - RA 24222953
Tiago Antonio Ferreira - RA 23220708
João Maike Silva de Jesus - RA 24209375
Davi Corrêa Bueno - RA 23224112
Pedro Luiz Simonetti Filho - RA 24211664
Roger Luiz de Paula - RA 24203760
Jeferson Ferraz Ferreira - RA 1902243
Diego Gustavo Franco - RA 23208003

## Disciplina

Projeto Integrador em Computação II

## Tema escolhido pelo grupo com base no tema norteador da Univesp

Desenvolvimento de soluções tecnológicas para problemas reais identificados em comunidades externas.

## Título provisório do trabalho

Flowity Content Engine 2.0: geração de imagens e carrosséis acessíveis, API em nuvem e testes
automatizados.

## Problema

A versão entregue no PI 1 organiza referências e gera apenas texto, funciona principalmente em ambiente
local e não foi medida quanto ao ganho de tempo. Com o uso contínuo pela comunidade externa, o gargalo
se deslocou: toda publicação profissional exige imagem única ou carrossel, produzidos hoje em uma
ferramenta externa, e o texto alternativo das imagens é escrito manualmente na hora da publicação, ou
simplesmente esquecido, o que exclui pessoas com deficiência visual do conteúdo. Somam-se a isso a
ausência de implantação em nuvem, de consolidação da API, de análise dos resultados publicados e de uma
estratégia sistemática de testes.

## Objetivo

Evoluir o protótipo do PI 1 para uma aplicação web implantada em nuvem, integrada por API, capaz de
produzir a peça de conteúdo completa - texto, imagem única e carrossel para o LinkedIn - com
acessibilidade assegurada por padrão (texto alternativo obrigatório, navegação por teclado, contraste
adequado e estrutura semântica), com recursos em JavaScript, análise de dados das publicações, controle
de versão e testes automatizados, validada com a comunidade externa e medida por indicadores de ganho de
tempo.

## Polo(s)

Araras, Rio Claro, Santa Gertrudes, Sumaré e Cordeirópolis

## Orientador do PI

Rafaela Afonso Crepaldi

---

## Descreva o processo de escolha do local de realização do PI.

No PI 1, o grupo analisou pequenas empresas de tecnologia, profissionais de marketing digital e
organizações que produzem conteúdo profissional. A Flowity AI foi escolhida por apresentar uma
necessidade real de organização e reaproveitamento de ideias, além de disponibilidade para dialogar com
os estudantes. Para o PI 2, o grupo decidiu manter a mesma comunidade porque o protótipo já foi validado
por seus colaboradores e porque alguns meses de uso contínuo revelaram necessidades novas e mensuráveis,
que não estavam visíveis no diagnóstico inicial. A continuidade evita reiniciar o diagnóstico, permite
comparar o antes e o depois com a mesma organização e concentra o trabalho em melhorias tecnológicas,
acessibilidade e avaliação de resultados.

## Descreva como foi a conversa com a comunidade externa que participará do projeto e que acolheu o grupo.

O primeiro contato ocorreu por reunião on-line com Andrea Nina Maciel Cressoni, fundadora da Flowity AI.
A empresa relatou, no PI 1, que ideias e referências para conteúdo estratégico ficavam dispersas em
mensagens, documentos e anotações. No encerramento do PI 1, colaboradores testaram o cadastro, a
consulta e o calendário da aplicação. Na retomada para o PI 2, realizada em 02/09/2026, o grupo
apresentou um roteiro de perguntas construído a partir do Relatório Final do PI 1, e a empresa demonstrou
o fluxo real de trabalho de ponta a ponta. Ficou evidente que o texto é apenas metade do processo: cada
publicação passava por uma ferramenta de design externa para montagem de imagem ou carrossel, exportação
manual do arquivo e escrita do texto alternativo direto na rede social. O grupo registrou esse retorno e
definiu como prioridade para o PI 2 tornar a solução acessível remotamente, mais confiável, capaz de
produzir a peça visual completa e acessível a pessoas com deficiência.

## Descreva, a partir da conversa com a comunidade externa, quais problemas podem ser pesquisados e que se relacionam com o tema norteador definido pela Univesp.

O problema inicial de dispersão das referências foi parcialmente atendido pelo protótipo, mas quatro
problemas novos foram identificados no uso contínuo. Primeiro, a produção visual: imagens e carrosséis
continuam sendo feitos fora da aplicação, consumindo de trinta a sessenta minutos por publicação e
anulando parte do ganho obtido na escrita. Segundo, a acessibilidade: as imagens são publicadas sem
descrição textual, o que torna o conteúdo inacessível a pessoas que utilizam leitores de tela, contrariando
a Lei Brasileira de Inclusão (Lei nº 13.146/2015) e as práticas do eMAG e das WCAG 2.1. Terceiro, a
ausência de leitura dos resultados: não há registro nem análise de desempenho das publicações, o que
impede decidir formatos, dias e canais. Quarto, a execução permaneceu local, sem implantação em nuvem,
sem consolidação da API e sem estratégia de testes, e o ganho de tempo nunca foi medido. Assim, o PI 2
pesquisará como gerar imagens e carrosséis acessíveis dentro da própria aplicação, como assegurar
acessibilidade por padrão, como analisar os dados das publicações e como disponibilizar e avaliar a
solução em nuvem junto à Flowity AI.

## Frente ao tema norteador e aos problemas levantados junto à comunidade externa, descreva qual o tema específico a ser trabalhado pelo grupo no PI.

O tema específico será a evolução do Flowity Content Engine para uma aplicação web em nuvem capaz de
produzir conteúdo completo e acessível: além do texto já gerado no PI 1, o sistema passará a gerar
imagens únicas e carrosséis para o LinkedIn, com texto alternativo obrigatório em cada imagem, interface
navegável por teclado, contraste conforme as WCAG 2.1 nível AA e estrutura semântica em HTML. O trabalho
inclui ainda banco de dados, API documentada, recursos em JavaScript, análise de dados das publicações
com alertas configuráveis, controle de versão e testes automatizados. A proposta mantém a solução
construída no PI 1, mas amplia seu alcance técnico, social e sua validação prática. O tema relaciona o
tema norteador da UNIVESP a um problema real da Flowity AI: produzir, publicar e avaliar conteúdo
estratégico com qualidade, disponibilidade e inclusão de pessoas com deficiência.

---

# Plano de Ação

## Quinzena 1

**Objetivo:** Analisar o cenário do projeto e iniciar o levantamento bibliográfico para abordar o problema.

| Atividade | Responsável | Início | Finalização | Observação |
|---|---|---|---|---|
| Retomar o relatório, o repositório e os resultados do PI 1. | Andrea Cressoni; Tiago Ferreira | 10/08/2026 | 12/08/2026 | Registrar decisões na ata inicial. |
| Analisar limitações do protótipo e requisitos oficiais do PI 2. | João Maike; Davi Bueno | 10/08/2026 | 14/08/2026 | Foco em imagens, acessibilidade, nuvem, API e testes. |
| Realizar levantamento bibliográfico sobre acessibilidade digital (LBI, eMAG, WCAG 2.1) e JavaScript. | Pedro Simonetti; Roger de Paula | 11/08/2026 | 18/08/2026 | Organizar referências em `PI2/referencias-bibliograficas.md`. |
| Diagnosticar código, banco de dados, implantação e pendências do projeto. | Jeferson Ferreira; Diego Franco | 13/08/2026 | 21/08/2026 | Gerar backlog técnico priorizado. |
| Reunir o grupo com o facilitador para validar o direcionamento inicial. | Todos os integrantes | 22/08/2026 | 23/08/2026 | Registrar orientações e responsáveis. |

## Quinzena 2

**Objetivo:** Interagir com a comunidade externa, definir o problema e organizar o plano de ação.

| Atividade | Responsável | Início | Finalização | Observação |
|---|---|---|---|---|
| Retomar o contato com a Flowity AI e aplicar o roteiro de perguntas de continuidade do PI 1. | Andrea Cressoni; João Maike | 24/08/2026 | 26/08/2026 | Registrado em `PI2/perguntas-continuidade-pi1.md`. |
| Delimitar problema, questão de pesquisa, objetivo e escopo do PI 2. | Tiago Ferreira; Davi Bueno | 24/08/2026 | 28/08/2026 | Evitar repetição do escopo do PI 1. |
| Definir requisitos funcionais, não funcionais e critérios de aceitação. | Pedro Simonetti; Roger de Paula | 26/08/2026 | 30/08/2026 | Incluir imagens, carrossel, texto alternativo, API, nuvem e testes. |
| Elaborar o plano de ação, abrir as issues do PI 2 no GitHub e distribuir prazos. | Jeferson Ferreira; Diego Franco | 27/08/2026 | 31/08/2026 | Conferir participação de todo o grupo. |
| Revisar o plano com o facilitador e realizar a entrega no AVA. | Todos os integrantes | 31/08/2026 | 01/09/2026 | Entrega até 23h59; carência até 06/09. |

## Quinzena 3

**Objetivo:** Definir título do trabalho, visitar o local de pesquisa, dar continuidade ao desenvolvimento do trabalho.

| Atividade | Responsável | Início | Finalização | Observação |
|---|---|---|---|---|
| Consolidar o título e definir a arquitetura da nova versão, incluindo o módulo de mídia. | Tiago Ferreira; Diego Franco | 07/09/2026 | 09/09/2026 | Documentar componentes e integrações. |
| Preparar ambiente de nuvem, banco de dados, armazenamento de mídia e variáveis de configuração. | Andrea Cressoni; Davi Bueno | 08/09/2026 | 13/09/2026 | Não expor credenciais no repositório. |
| Definir e documentar os endpoints e contratos da API, incluindo os de imagem e carrossel. | João Maike; Jeferson Ferreira | 09/09/2026 | 15/09/2026 | Padronizar respostas e erros no OpenAPI. |
| Iniciar recursos em JavaScript (upload com pré-visualização, montagem de carrossel) e acessibilidade. | Pedro Simonetti; Roger de Paula | 10/09/2026 | 18/09/2026 | Aplicar critérios de teclado, foco e contraste. |
| Integrar a primeira etapa e apresentar o andamento ao facilitador. | Todos os integrantes | 19/09/2026 | 20/09/2026 | Atualizar backlog após a reunião. |

## Quinzena 4

**Objetivo:** Construir e apresentar a solução inicial (Relatório Parcial); coletar sugestões com a comunidade externa; entregar o Relatório Parcial.

| Atividade | Responsável | Início | Finalização | Observação |
|---|---|---|---|---|
| Disponibilizar a solução inicial em nuvem, integrar a API ao banco e persistir a mídia. | Andrea Cressoni; Davi Bueno | 21/09/2026 | 25/09/2026 | Registrar procedimento de implantação. |
| Implementar a geração de imagem única e do carrossel do LinkedIn com texto alternativo obrigatório. | Pedro Simonetti; Roger de Paula | 21/09/2026 | 26/09/2026 | Validar o fluxo nas telas principais. |
| Criar testes automatizados (pytest e Vitest) e organizar o fluxo de versionamento. | Jeferson Ferreira; Diego Franco | 23/09/2026 | 28/09/2026 | Registrar evidências dos testes. |
| Apresentar a solução inicial à Flowity AI, coletar sugestões e iniciar a medição de tempo. | João Maike; Tiago Ferreira | 27/09/2026 | 29/09/2026 | Consolidar feedback e primeiros dados de desempenho. |
| Revisar com o facilitador e entregar o Relatório Parcial. | Todos os integrantes | 29/09/2026 | 30/09/2026 | Entrega até 23h59; carência até 04/10. |

## Quinzena 5

**Objetivo:** Construir a solução final, com base nas sugestões do Relatório Parcial.

| Atividade | Responsável | Início | Finalização | Observação |
|---|---|---|---|---|
| Organizar as sugestões da comunidade e atualizar o backlog. | Tiago Ferreira; João Maike | 05/10/2026 | 06/10/2026 | Priorizar itens de maior impacto. |
| Aprimorar API, regras de negócio, armazenamento de mídia e configuração em nuvem. | Andrea Cressoni; Davi Bueno | 05/10/2026 | 12/10/2026 | Manter compatibilidade com o banco. |
| Concluir a auditoria de acessibilidade (WCAG 2.1 AA) e aplicar as correções de interface. | Pedro Simonetti; Roger de Paula | 07/10/2026 | 14/10/2026 | Auditar com axe DevTools e Lighthouse. |
| Implementar a análise de dados das publicações e os alertas com limite configurável. | Jeferson Ferreira; Diego Franco | 09/10/2026 | 16/10/2026 | Comparar desempenho entre LinkedIn e X. |
| Homologar a solução final e apresentar o resultado ao facilitador. | Todos os integrantes | 17/10/2026 | 18/10/2026 | Registrar pendências residuais. |

## Quinzena 6

**Objetivo:** Analisar os resultados, finalizar o protótipo e preparar o vídeo de apresentação.

| Atividade | Responsável | Início | Finalização | Observação |
|---|---|---|---|---|
| Aplicar a solução final e executar cenários reais de publicação com a comunidade. | Andrea Cressoni; João Maike | 19/10/2026 | 23/10/2026 | Coletar retorno dos usuários. |
| Consolidar os indicadores de ganho de tempo e de acessibilidade e analisar os resultados. | Tiago Ferreira; Roger de Paula | 20/10/2026 | 27/10/2026 | Comparar fluxo manual, PI 1 e PI 2. |
| Finalizar documentação da API, da implantação e dos testes. | Davi Bueno; Jeferson Ferreira | 22/10/2026 | 29/10/2026 | Preparar material técnico do projeto. |
| Redigir resultados e discussão e iniciar o Relatório Final. | Pedro Simonetti; Diego Franco | 24/10/2026 | 31/10/2026 | Integrar textos, tabelas e evidências. |
| Reunir-se com o facilitador e planejar roteiro e gravação do vídeo. | Todos os integrantes | 31/10/2026 | 01/11/2026 | Definir falas e demonstração. |

## Quinzena 7

**Objetivo:** Concluir e entregar o Relatório Final e o vídeo de apresentação.

| Atividade | Responsável | Início | Finalização | Observação |
|---|---|---|---|---|
| Finalizar e revisar o Relatório Final conforme o modelo do AVA. | Tiago Ferreira; Pedro Simonetti | 02/11/2026 | 04/11/2026 | Conferir texto, figuras e referências. |
| Gravar, editar e revisar o vídeo de apresentação com legendas. | Roger de Paula; Diego Franco | 02/11/2026 | 05/11/2026 | Demonstrar problema, solução e resultados. |
| Realizar validação final da nuvem, do repositório e da documentação. | Andrea Cressoni; Davi Bueno | 03/11/2026 | 05/11/2026 | Arquivar evidências da versão entregue. |
| Revisar a acessibilidade da versão final e concluir a avaliação colaborativa. | João Maike; Jeferson Ferreira | 04/11/2026 | 06/11/2026 | Todos devem concluir a avaliação. |
| Validar com o facilitador e entregar relatório, vídeo e avaliação no AVA. | Todos os integrantes | 06/11/2026 | 06/11/2026 | Prazo às 23h59; carência até 15/11. |
