# Medição do ganho de tempo por publicação — PI 2 (Tarefa 16)

> **Estado deste documento (22/09/2026):** protocolo e instrumentos prontos; **nenhum dado coletado
> ainda**. As tabelas de linha de base e de resultados estão vazias de propósito e só devem ser
> preenchidas com medições reais. A coleta acontece nas quinzenas 4 a 6.

## 1. Pergunta que a medição responde

O PI 2 promete que produzir uma publicação completa (texto + mídia) dentro da Flowity Content Engine
leva menos tempo do que no processo manual antigo e do que no fluxo do PI 1. A medição responde:

> Quanto tempo, em minutos, leva para deixar **uma publicação do LinkedIn pronta para agendar** em
> cada um dos três fluxos — manual, PI 1 e PI 2?

## 2. Os três fluxos comparados

| Código (`workflow`) | Fluxo | Como a publicação é feita |
|---------------------|-------|----------------------------|
| `manual` | Processo antigo da Flowity AI | Texto escrito fora da ferramenta (documento, ChatGPT etc.), imagem ou carrossel montado no Canva/Figma, agendamento manual |
| `pi1` | Ferramenta do PI 1 (só texto) | Texto gerado e revisado na ferramenta; imagem/carrossel ainda montado fora (Canva/Figma) |
| `pi2` | Ferramenta do PI 2 (texto + mídia) | Texto, imagem única ou carrossel e texto alternativo produzidos dentro da ferramenta |

## 3. Unidade de medida e o que conta como "pronto"

- **Unidade:** uma publicação do LinkedIn com texto **e** mídia (imagem única ou carrossel), com
  texto alternativo na mídia. Publicações só de texto **não** entram na amostra, para os três fluxos
  medirem a mesma peça.
- **Início do cronômetro:** quando a pessoa abre a pauta/fonte escolhida e começa a escrever.
  A escolha do tema (pauta) fica **fora** da medição, porque é igual nos três fluxos.
- **Fim do cronômetro:** quando a publicação está pronta para agendar (no PI 1 e PI 2, status
  `scheduled`; no manual, texto e arquivo de mídia finalizados e agendados).
- **Pausas:** interrupções (reunião, almoço, outra tarefa) **pausam** o cronômetro. Não conta tempo
  parado.
- **Etapas incluídas:** escrever, revisar, montar imagem, montar carrossel, escrever texto
  alternativo, agendar.

## 4. Como cronometrar

- **Instrumento:** cronômetro do celular (ou Toggl Track), iniciado e pausado pela própria pessoa
  que produz a publicação.
- Separe o tempo em duas colunas:
  - `minutos_ferramenta`: tempo gasto **dentro** da Flowity Content Engine (no fluxo `manual`, é 0).
  - `minutos_externos`: tempo gasto **fora** dela (Canva, Figma, ChatGPT, editor de texto, agendador).
  - Tempo total da publicação = `minutos_ferramenta + minutos_externos`.
- Registre em **minutos inteiros**, arredondando para cima (ex.: 12 min 10 s → 13).
- Anote na coluna `tipo_medicao` se o tempo foi **cronometrado** na hora ou **autodeclarado** depois
  (reconstituído de memória). Autodeclarado é permitido, mas é contado separadamente na análise de
  limitações.
- Registre no mesmo dia. Não preencha linhas "de cabeça" dias depois.

## 5. Amostra e calendário

- **10 publicações por fluxo, 30 no total.**
- **Período:** quinzenas 4 a 6 do plano de ação.

| Quinzena | Período (aprox.) | Meta de coleta |
|----------|------------------|----------------|
| 4 | 21/09 a 04/10/2026 (início da medição em 27/09) | Reconstituir a linha de base manual com a Flowity AI; 3 publicações por fluxo |
| 5 | 05/10 a 18/10/2026 | 4 publicações por fluxo |
| 6 | 19/10 a 01/11/2026 (consolidação de 20/10 a 27/10) | 3 publicações por fluxo; fechar a análise |

- **Rodízio:** alterne a ordem dos fluxos (manual → pi1 → pi2, depois pi1 → pi2 → manual, e assim por
  diante). Se todos os `manual` forem feitos primeiro, a pessoa "aprende" o assunto e os fluxos
  seguintes ficam artificialmente mais rápidos.
- **Mesma pessoa, mesmo tipo de peça:** sempre que possível, a mesma pessoa produz nos três fluxos, com
  temas de complexidade parecida.

## 6. Quem registra

| Papel | Quem | O que faz |
|-------|------|-----------|
| Produtor(a) | Pessoa da Flowity AI que cria a publicação | Cronometra e preenche uma linha no CSV por publicação |
| Responsável pela medição | Integrante da Tarefa 16 (Andrea Nina Maciel Cressoni) | Garante o protocolo, confere o CSV a cada quinzena e roda o cálculo |
| Consolidação | Integrantes da atividade "Consolidar os indicadores de ganho de tempo" (quinzena 6) | Escrevem a análise e as limitações (seções 9 e 10) |

## 7. Onde registrar: `PI2/dados/tempos-producao.csv`

O arquivo já está versionado só com o cabeçalho. Ele usa **ponto e vírgula (`;`) como separador e
UTF-8 com BOM**, para abrir direto no Excel em português sem juntar tudo numa coluna só.
Ao salvar pelo Excel, escolha **"CSV UTF-8 (delimitado por vírgulas)"** — no Excel em português
ele grava com `;`.

| Coluna | Tipo | Exemplo de formato | Descrição |
|--------|------|--------------------|-----------|
| `id_post` | texto | `42` ou `M-03` | Id do post na ferramenta; no fluxo manual, um código `M-nn` |
| `workflow` | `manual` \| `pi1` \| `pi2` | `pi2` | Fluxo usado |
| `data` | AAAA-MM-DD | `2026-10-06` | Dia da produção |
| `minutos_ferramenta` | inteiro | `9` | Tempo dentro da ferramenta (0 no manual) |
| `minutos_externos` | inteiro | `4` | Tempo fora da ferramenta |
| `ferramentas` | texto | `Canva, ChatGPT` | Ferramentas externas usadas (vazio se nenhuma) |
| `alt_preenchido` | `sim` \| `nao` | `sim` | A mídia saiu com texto alternativo? |
| `tipo_medicao` | `cronometrado` \| `autodeclarado` | `cronometrado` | Como o tempo foi obtido |
| `registrado_por` | texto | `Nina` | Quem preencheu a linha |
| `observacoes` | texto | `carrossel de 6 slides` | Qualquer coisa que ajude a interpretar |

As sete primeiras colunas são as combinadas no plano da tarefa; as três últimas foram acrescentadas
para a análise de limitações.

## 8. Linha de base do processo manual (reconstituída com a Flowity AI)

> **A preencher na quinzena 4**, em conversa com a Flowity AI. Tempo médio por etapa, em minutos,
> para uma publicação com mídia. Não preencher com estimativa da equipe.

| Etapa | Manual | PI 1 (só texto) | PI 2 (texto + mídia) |
|-------|--------|-----------------|----------------------|
| Escrever o texto | — | — | — |
| Revisar | — | — | — |
| Montar imagem única | — | — | — |
| Montar carrossel | — | — | — |
| Escrever texto alternativo | — | — | — |
| Agendar | — | — | — |
| **Total** | — | — | — |

Fonte da linha de base: _(nome e cargo de quem informou na Flowity AI, data da conversa)_.

## 9. Resultados

> **A preencher na quinzena 6.** Gerar a tabela com o script abaixo, a partir do CSV real:

```bash
python PI2/dados/calcular_tempos.py PI2/dados/tempos-producao.csv
```

O script calcula, por fluxo, o número de publicações, a média, a mediana, o mínimo, o máximo e o
desvio padrão do tempo total, e o percentual de redução da **mediana** de `pi1` e `pi2` em relação
ao `manual`. Ele também avisa quando um fluxo tem menos de 10 publicações e quantas linhas são
autodeclaradas.

Usamos a **mediana** como número principal porque, com 10 amostras, uma única publicação atípica
(ex.: um carrossel muito longo) puxa a média para cima; a média aparece ao lado para transparência.

Percentual de redução = `(mediana_manual − mediana_fluxo) / mediana_manual × 100`.

| Fluxo | n | Mediana (min) | Média (min) | Desvio padrão | Redução da mediana vs. manual |
|-------|---|---------------|-------------|---------------|-------------------------------|
| manual | — | — | — | — | — |
| pi1 | — | — | — | — | — |
| pi2 | — | — | — | — | — |

## 10. Limitações (declarar no relatório, mesmo que o resultado seja bom)

- **Amostra pequena:** 10 publicações por fluxo não permitem teste estatístico com poder razoável; o
  resultado é descritivo, não uma prova de causa.
- **Uma única empresa participante** (Flowity AI): o ganho pode não se repetir em outras equipes.
- **Parte do tempo é autodeclarada**, não cronometrada — informar quantas linhas são de cada tipo.
- **Efeito de aprendizagem:** quem produz fica mais rápido com o tempo; o rodízio reduz, mas não
  elimina esse viés.
- **Temas diferentes** entre publicações têm complexidades diferentes.
- **Geração por IA em nuvem:** se a versão publicada usar o modo `template-fallback` (sem Ollama), o
  tempo de revisão do texto pode ser maior do que com o modelo local — registrar em `observacoes`.

Uma limitação declarada vale mais na banca do que um número inflado.

## 11. Pendências da Tarefa 16 (fora deste PR)

Os passos 3 a 5 da tarefa — campos `external_minutes`, `tools_used` e `workflow` no modelo `Post`,
no schema e no `PostModal.jsx`, e o endpoint `GET /reports/performance` — dependem de uma nova
migração Alembic. Eles ficam para um PR seguinte, depois que as migrações das Tarefas 3 e 5 (#99 e
#100) estiverem na `main`, para não criar duas "cabeças" de migração concorrentes. Enquanto isso, o
CSV e o script acima são o instrumento oficial de coleta.
