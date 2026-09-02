# Continuidade do PI 1 para o PI 2 - Levantamento de novos problemas

Documento de resposta às perguntas levantadas pelo grupo após a revisão do Relatório Final do PI 1.
As respostas foram dadas pela comunidade externa participante (Flowity AI), na condição de usuária real
da aplicação, e servem de base para a delimitação do problema e do escopo do PI 2.

- Comunidade externa: Flowity AI
- Respondente: Andrea Nina Maciel Cressoni (fundadora)
- Data do levantamento: 02/09/2026
- Período de uso considerado: maio de 2026 a agosto de 2026

---

## 1. O novo problema identificado: o conteúdo não é só texto

Antes de responder às perguntas, é preciso registrar o problema que apareceu com o uso contínuo e que
não existia no diagnóstico do PI 1.

O Flowity Content Engine, na versão do PI 1, organiza referências e gera **texto**. Só que nenhuma
publicação profissional no LinkedIn é publicada só como texto. Na prática, todo post que a Flowity AI
publica passa por uma segunda etapa que acontece **fora** da aplicação:

1. o texto é gerado e revisado no Flowity Content Engine;
2. o texto é copiado para uma ferramenta de design externa (Canva);
3. lá é montada a imagem única ou o carrossel, slide a slide;
4. o material é exportado (PNG ou PDF);
5. o arquivo é baixado, renomeado e enviado manualmente ao LinkedIn;
6. o texto alternativo das imagens, quando é escrito, é escrito na hora da publicação, à mão, no
   próprio LinkedIn - e frequentemente é esquecido.

Ou seja: a aplicação resolveu a dispersão das ideias, mas o gargalo se deslocou. Hoje o gargalo é a
produção visual e a publicação. O tempo economizado na escrita é devolvido na montagem do carrossel.

Além disso, a etapa 6 revelou um problema de acessibilidade. Um carrossel do LinkedIn com sete slides
publicado sem descrição de imagem é, para uma pessoa cega que usa leitor de tela, um post vazio. Como a
Flowity AI produz conteúdo profissional e público, isso não é um detalhe estético: é exclusão de
público. A Lei Brasileira de Inclusão (Lei nº 13.146/2015) e o eMAG estabelecem a acessibilidade
digital como requisito, e o texto alternativo é uma das práticas centrais previstas.

**Problema do PI 2, em uma frase:** o Flowity Content Engine precisa produzir a peça de conteúdo
completa - texto, imagem única e carrossel - com acessibilidade garantida por padrão (texto alternativo
obrigatório, navegação por teclado, contraste adequado, estrutura semântica), disponível em nuvem e com
medição dos ganhos obtidos.

---

## 2. Respostas às perguntas do grupo

### Pergunta 1 - Faz sentido medir o processo de postagem antes e depois do Flowity Content Engine, como caso de teste de desempenho e eficiência?

**Sim, e é a lacuna mais séria do PI 1.** O Relatório Final afirmou ganho de organização, mas não
apresentou número nenhum, porque a coleta não foi planejada antes do uso. No PI 2 isso pode ser
corrigido, desde que a medição seja desenhada agora, e não no fim.

Como era o processo antes da aplicação (linha de base, medida por reconstituição com os registros
existentes de maio de 2026):

| Etapa | Antes (manual) | Onde acontecia |
|---|---|---|
| Encontrar a referência ou ideia | 10 a 20 min | Prints, notas soltas, mensagens salvas, itens salvos do LinkedIn |
| Escrever o rascunho do post | 25 a 40 min | Documento em branco |
| Revisar e ajustar tom | 10 min | Documento |
| Montar a imagem ou o carrossel | 30 a 60 min | Canva |
| Programar ou publicar | 5 a 10 min | LinkedIn |
| **Total por publicação** | **80 a 140 min** | - |

Com o Flowity Content Engine do PI 1, as três primeiras etapas caíram para cerca de 15 a 25 minutos
somadas. As duas últimas continuaram idênticas. É exatamente por isso que o ganho percebido foi real,
mas menor do que o esperado: a aplicação cobre metade do processo.

Proposta de teste de desempenho para o PI 2:

- **Métrica principal:** tempo total de produção por publicação (minutos, do início da ideia ao arquivo
  pronto para publicar).
- **Métricas secundárias:** número de trocas de ferramenta por publicação; número de publicações
  concluídas por semana; percentual de imagens publicadas com texto alternativo preenchido.
- **Instrumentação:** registro automático de `created_at`, `updated_at`, `scheduled_at` e `published_at`
  de cada post, mais um campo de tempo declarado pelo usuário para as etapas que ocorrem fora da tela.
- **Desenho do teste:** 10 publicações produzidas pelo fluxo manual (grupo de controle, reconstituído e
  cronometrado) contra 10 publicações produzidas pelo fluxo do PI 2, com geração de imagem e carrossel
  dentro da aplicação.
- **Hipótese a testar:** redução de pelo menos 50% no tempo total por publicação e redução de 5 para 1
  no número de ferramentas usadas.

### Pergunta 2 - Relatórios e dashboards com dias de maior fluxo e engajamento ainda são importantes? Isso se enquadra em análise de dados no PI 2? Alertas de posts abaixo de um limite mínimo configurável seriam úteis?

**Sim para as três perguntas, com uma ordem de prioridade.**

Sobre a importância: depois de alguns meses de uso, o valor mudou de figura. No começo, a pergunta era
"o que eu publico?". Hoje, com o calendário cheio, a pergunta é "o que valeu a pena publicar?". Sem um
painel, essa resposta hoje depende de abrir o LinkedIn post a post e anotar número na mão, o que na
prática não é feito. Então o recurso é importante, sim, mas o valor está menos em "dia de maior fluxo de
postagem" (esse dado a própria empresa já controla, porque é ela que agenda) e mais em **engajamento por
dia, por horário e por formato**. O corte por formato é novo e passa a fazer sentido justamente porque o
PI 2 introduz imagem única e carrossel: sem ele não há como saber se o carrossel compensa o esforço
extra.

Sobre o enquadramento: sim, é o candidato natural ao tópico de análise de dados do PI 2. Envolve coleta
(registro manual e importação de CSV exportado da plataforma), armazenamento em banco relacional,
agregação por período, plataforma e formato, cálculo de taxa de engajamento
`(curtidas + comentários + compartilhamentos) / impressões` e apresentação visual acessível.

Sobre os alertas: **úteis, desde que o limite seja configurável e o alerta seja informativo, não
punitivo.** Um alerta fixo seria inútil, porque a base de seguidores muda e o que é bom hoje não é
comparável ao de seis meses atrás. O que a empresa precisa é: "este post ficou abaixo do limite que você
mesmo definiu, e ele era do formato X". O limite inicial sugerido é 2% de taxa de engajamento no
LinkedIn, ajustável na tela de configurações. O alerta deve aparecer com ícone e texto, nunca apenas com
a cor vermelha, para não depender de percepção de cor.

### Pergunta 3 - A classificação e a organização das referências permitem encontrar conteúdos relacionados de forma eficiente? Há necessidade de mais filtros?

**Parcialmente, e sim, há necessidade de mais filtros.**

O cadastro funciona. O problema aparece com volume: a biblioteca passou de algumas dezenas para algumas
centenas de referências, e a listagem simples deixou de ser suficiente. Hoje, encontrar "aquela
referência sobre churn que eu salvei em junho" exige rolar a lista.

Filtros e recursos que faltam, em ordem de utilidade:

1. **Busca textual** em título, resumo e notas (é o mais sentido no dia a dia);
2. **Tags múltiplas combináveis**, com a opção de exigir todas ou qualquer uma;
3. **Filtro por período** de cadastro;
4. **Filtro "já usada / nunca usada"** - hoje não há como saber se uma referência já virou post, e isso
   causa repetição de conteúdo;
5. **Ordenação** por mais recentes, mais usadas e alfabética;
6. **Paginação**, porque a tela já está pesada.

O item 4 é o que mais dói e é o menos óbvio: sem ele, referências boas ficam esquecidas e referências já
usadas voltam por engano.

### Pergunta 4 - Há interesse em comparar o desempenho de conteúdos publicados em plataformas diferentes, como LinkedIn e X?

**Há interesse, mas com uma ressalva honesta que precisa constar no relatório.**

Interesse existe porque a aplicação já gera versão curta para o X (campo `short_x`) a partir do mesmo
post, e hoje não há qualquer evidência de que essa versão curta traga retorno. A comparação serviria
para uma decisão prática: continuar publicando no X ou parar e concentrar esforço no LinkedIn.

A ressalva: o volume das duas plataformas é muito diferente. O LinkedIn é o canal principal da Flowity
AI; o X é secundário e com poucas publicações. Comparar números absolutos levaria a uma conclusão
errada. A comparação só é válida se for feita com **métricas normalizadas** (taxa de engajamento sobre
impressões, e não curtidas absolutas) e se a tela deixar explícito o número de publicações de cada
plataforma no período, para que a diferença de amostra fique visível. Recomenda-se também não tirar
conclusão com menos de 10 publicações por plataforma no período analisado.

### Pergunta 5 - Após alguns meses de uso, quais processos feitos fora do Flowity Content Engine ainda poderiam ser integrados ou automatizados?

Em ordem de impacto:

1. **Produção da imagem e do carrossel (Canva).** É o maior custo remanescente: 30 a 60 minutos por
   publicação. É o foco central do PI 2.
2. **Escrita do texto alternativo.** Hoje é feita no LinkedIn, na hora, e é a primeira coisa que se
   perde quando há pressa. Deve nascer dentro da aplicação, obrigatória, com sugestão automática
   derivada do próprio conteúdo do slide e possibilidade de edição.
3. **Exportação e organização dos arquivos.** Baixar, renomear, achar o arquivo certo na hora de
   publicar. Deve virar um download único e nomeado pela aplicação.
4. **Coleta de métricas.** Hoje é olhar o LinkedIn e não anotar nada. Deve virar registro manual rápido
   mais importação de CSV.
5. **Checklist de publicação.** Formato correto, proporção 4:5, limite de páginas do PDF, todos os
   slides com descrição. Hoje isso está na cabeça de uma pessoa; deve estar na tela.
6. **Aprovação do conteúdo.** Quando há revisão de terceiros, ela acontece por mensagem. Poderia usar o
   próprio campo de status do post (`draft` -> `revised` -> `scheduled`), que já existe no banco e está
   subutilizado.

Fora de escopo declarado para o PI 2 (registrado aqui para o Relatório Final, como trabalho futuro): a
publicação automática direta na API do LinkedIn, que depende de aprovação de aplicativo junto à
plataforma e não cabe no prazo do semestre.

---

## 3. O que isso define para o PI 2

| Necessidade levantada | Vira, no PI 2 |
|---|---|
| Produção visual fora da aplicação | Geração de imagem única e de carrossel dentro do sistema |
| Texto alternativo esquecido | Campo obrigatório, validado pela API, bloqueando o agendamento |
| Exclusão de usuários com deficiência | Conformidade WCAG 2.1 AA: teclado, foco, contraste, semântica |
| Ganho de tempo não comprovado | Teste de desempenho com linha de base e métrica de tempo por publicação |
| Falta de leitura dos resultados | Painel de análise de dados e alertas com limite configurável |
| Biblioteca difícil de percorrer | Busca textual, tags combináveis, filtro de uso e paginação |
| Dúvida sobre o X | Comparação entre plataformas com métricas normalizadas |
| Uso restrito à máquina local | Implantação em nuvem e consolidação da API |
