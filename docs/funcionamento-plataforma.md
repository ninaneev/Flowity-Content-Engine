# Funcionamento da Plataforma — Flowity Content Engine

## Objetivo do sistema

O Flowity Content Engine é uma plataforma interna desenvolvida para apoiar o processo de produção, revisão, agendamento e publicação de conteúdos digitais da Flowity AI. A solução centraliza referências editoriais, gera rascunhos com apoio de IA, organiza o fluxo de aprovação humana e integra automações para publicação programada.

O fluxo foi estruturado para atender ao contexto do Projeto Integrador, demonstrando uma aplicação web com frontend, backend, banco de dados, inteligência artificial local e automação por workflow.

---

## Imagem 01 — Login e controle de acesso

![Imagem 01 — Login](../images/01-login.png)

A primeira etapa do uso da plataforma é a autenticação do usuário administrador. A tela de login restringe o acesso ao ambiente interno, garantindo que apenas usuários autorizados possam visualizar, criar, revisar ou agendar conteúdos.

O login envia as credenciais ao backend, que valida o usuário administrador e retorna um token JWT. Esse token é armazenado no navegador e passa a acompanhar as próximas requisições feitas pela interface.

---

## Imagem 02 — Calendário editorial e fluxo de aprovação

![Imagem 02 — Calendário editorial](../images/02-calendario-fluxo-aprovacao.png)

Após o login, o usuário acessa o calendário editorial. Essa tela apresenta a visão mensal dos conteúdos e explica o fluxo operacional da plataforma:

1. **Ideia/Rascunho:** o conteúdo é criado manualmente ou gerado pelo módulo de IA.
2. **Revisado:** o conteúdo passa por aprovação humana antes de qualquer publicação.
3. **Agendado:** após revisão e definição de data, o conteúdo fica disponível para publicação automática.
4. **Publicado/Falhou:** a automação registra o resultado da tentativa de publicação.

Esse fluxo evita que a IA publique diretamente sem controle editorial, mantendo uma etapa humana de revisão antes do envio automático.

---

## Imagem 03 — Biblioteca de referências

![Imagem 03 — Library](../images/03-library-sources.png)

A biblioteca, chamada de **Library**, armazena as referências utilizadas para geração de conteúdo. Cada referência pode representar um insight, objeção de cliente, trecho de pesquisa, frase, comentário ou material externo.

Essas fontes funcionam como matéria-prima editorial. Ao cadastrar referências, o time mantém uma base organizada para que os posts sejam gerados com contexto e coerência. A tela também possui busca e filtro por tipo de source, facilitando a localização das informações.

---

## Imagem 04 — Configuração da geração de conteúdo

![Imagem 04 — Generator configuração](../images/04-generator-configuracao.png)

No módulo **Generator**, o usuário seleciona até três referências da biblioteca e define os parâmetros de geração:

- canal de publicação, como LinkedIn ou X;
- tom do conteúdo;
- formato textual;
- modo de geração, por template ou por IA local via Ollama;
- objetivo opcional do post.

Essa etapa transforma referências brutas em uma solicitação estruturada para criação do conteúdo.

---

## Imagem 05 — Resultado gerado e salvamento como rascunho

![Imagem 05 — Generator resultado](../images/05-generator-resultado.png)

Após executar a geração, a plataforma apresenta uma prévia do conteúdo produzido, dividida em hook, corpo e CTA. O usuário pode copiar o texto ou salvar o resultado como rascunho.

Ao salvar como rascunho, o post passa a existir no banco de dados e entra no pipeline editorial. Nesse momento, ele ainda não está aprovado nem pronto para publicação automática.

---

## Imagem 06 — Pipeline editorial

![Imagem 06 — Pipeline](../images/06-pipeline-rascunho.png)

O pipeline organiza os posts por status. Ele permite acompanhar visualmente em que etapa cada conteúdo se encontra:

- Ideia;
- Rascunho;
- Revisado;
- Agendado;
- Publicado.

O post criado no Generator aparece na coluna **Rascunho**, enquanto conteúdos já aprovados ou agendados aparecem em suas respectivas etapas. Essa visão facilita o acompanhamento do trabalho editorial e reduz o risco de publicar conteúdos sem revisão.

---

## Imagem 07 — Modal de revisão, aprovação e agendamento

![Imagem 07 — Modal de post](../images/07-modal-aprovacao-agendamento.png)

Ao clicar em um post, a plataforma abre um modal de edição. Nele, o usuário pode revisar o hook, corpo, CTA, versão para X, canal, status, data de agendamento e observações internas.

A regra principal do processo é que o status **Revisado** representa aprovação humana. Somente depois dessa validação o post deve ser alterado para **Agendado**, com data e hora definidas. A partir desse estado, a automação pode identificar o post como pronto para publicação.

---

## Imagem 08 — Configurações de IA e automação

![Imagem 08 — Settings](../images/08-settings-automacao.png)

A tela **Settings** apresenta as integrações técnicas da plataforma:

- **Ollama:** responsável pela geração local com modelo de IA, como `llama3.1:8b`.
- **n8n:** responsável pela automação de publicação dos posts agendados.
- **Supabase/Database URL:** responsável pela persistência dos dados em ambiente produtivo ou local.

O workflow do n8n deve ser importado a partir de `infra/n8n/flowity-publishing.json`. Ele consulta periodicamente os posts agendados, tenta realizar a publicação e devolve ao backend o resultado da operação.

---

## Imagem 09 — Análise das publicações (Analytics)

![Imagem 09 — Analytics](../images/09-analytics-painel.png)

A tela **Analytics**, nova no menu lateral, mostra como as publicações estão performando:

- números gerais: quantidade de publicações, impressões, interações (curtidas, comentários e compartilhamentos) e taxa média de engajamento;
- gráfico de engajamento médio por dia da semana, para descobrir em que dia o público responde mais;
- comparação LinkedIn x X, com a taxa normalizada (interações divididas por impressões);
- faixa de alerta no topo, listando os posts publicados que ficaram abaixo do limite de engajamento definido nas configurações.

As métricas são registradas manualmente por post (números lidos no LinkedIn ou no X).

---

## Imagem 10 — Limite de engajamento nas configurações

![Imagem 10 — Settings, alertas](../images/10-settings-alertas-engajamento.png)

Em **Settings**, o bloco **Alertas** guarda a taxa mínima de engajamento (em %). Quando um post publicado fica abaixo desse valor, ele aparece na faixa de alerta da tela Analytics. O valor é salvo no botão **Salvar limite** e vale para todos os posts.

---

## Imagem 11 — Editor de carrossel

![Imagem 11 — Carrossel, editor](../images/11-carrossel-editor.png)

A tela **Carrossel** (menu lateral, ou botão a partir de um post no Pipeline) transforma um post em um carrossel do LinkedIn:

- de 3 a 10 slides, com capa, conteúdo e fechamento;
- texto de cada slide com contador (até 220 caracteres);
- botões para mover o slide para cima ou para baixo, remover e adicionar slide;
- pré-visualização ao lado, que acompanha o slide selecionado;
- navegação por teclado e leitor de tela (Tab percorre os slides).

O texto dos slides é salvo automaticamente e carregado de novo na próxima vez que o post é aberto.

---

## Imagem 12 — Carrossel gerado, PDF e checklist de publicação

![Imagem 12 — Carrossel gerado e checklist](../images/12-carrossel-exportar-checklist.png)

Ao clicar em **Gerar carrossel**, a plataforma cria uma imagem PNG (1080x1350) por slide e um PDF único, que é o formato aceito pelo LinkedIn para carrosséis. A tela mostra:

- as miniaturas dos slides gerados;
- **Baixar PDF** e **Copiar legenda**, para colar no post do LinkedIn;
- o **Checklist de publicação**: de 3 a 10 slides, texto alternativo em todas as imagens, hook, corpo e CTA preenchidos, e PDF já baixado.

---

## Imagem 13 — Imagem do post com texto alternativo obrigatório

![Imagem 13 — Modal do post, imagens](../images/13-post-modal-imagem-texto-alternativo.png)

No modal de revisão do post (Imagem 07), o bloco **Imagens do post** permite enviar uma imagem PNG ou JPEG de até 5 MB. O **texto alternativo é obrigatório**, de 10 a 300 caracteres, com contador e mensagem de ajuda. Sem ele o botão **Salvar imagem** continua desabilitado. É a regra de acessibilidade do PI 2: nenhuma imagem sem descrição para quem usa leitor de tela.

As imagens 09 a 13 foram capturadas em 27/10/2026 em uma instância local de demonstração, com banco SQLite temporário e posts de exemplo. Nenhum dado real do Supabase aparece nelas. No SQLite o gráfico por dia da semana fica vazio; no PostgreSQL de produção ele é preenchido.

---

## Fluxo completo de funcionamento

O funcionamento ponta a ponta da plataforma segue a sequência abaixo:

1. O administrador acessa o sistema com login protegido por JWT.
2. O usuário cadastra referências editoriais na Library.
3. O Generator usa essas referências para gerar uma proposta de post.
4. O conteúdo gerado é salvo como rascunho.
5. O rascunho aparece no Pipeline editorial.
6. O usuário revisa manualmente o conteúdo e altera o status para Revisado.
7. O usuário define data/hora e altera o status para Agendado.
8. O n8n consulta os posts agendados e executa a tentativa de publicação.
9. O backend registra o resultado como Publicado ou Falhou.
10. O calendário e o pipeline refletem o estado atualizado do conteúdo.

---

## Considerações finais

A plataforma demonstra uma arquitetura integrada entre interface web, API, banco de dados, geração assistida por IA e automação. O principal diferencial do fluxo é manter a IA como apoio à produção, sem eliminar a aprovação humana antes da publicação.

Dessa forma, o sistema combina produtividade, controle editorial e rastreabilidade, características importantes para uma ferramenta profissional de gestão de conteúdo digital.
