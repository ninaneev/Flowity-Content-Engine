# Referências bibliográficas do PI 2 (versão 2)

Revisão de 10/09/2026. Substitui `referencias-bibliograficas.md`.

Duas mudanças em relação à versão anterior:

1. **Janela temporal de cinco a seis anos.** Salvo as exceções listadas abaixo, só entram obras
   publicadas ou revisadas de **2020 em diante**. Cada referência traz o ano da edição efetivamente
   consultada, não o ano da primeira edição.
2. **Peso maior em fontes científicas.** A rubrica do Relatório Parcial exige "estudos em fontes
   confiáveis (artigos científicos, livros, dissertações e teses, TCCs)". Documentação oficial de
   biblioteca sustenta a metodologia, mas não sustenta sozinha a fundamentação teórica. A seção 7
   traz o protocolo de busca dos artigos que faltam.

## Exceções justificadas à janela de cinco a seis anos

Devem ser mantidas mesmo sendo mais antigas, e a justificativa precisa aparecer no texto do
relatório na primeira vez que forem citadas:

| Referência | Por que fica |
|---|---|
| Lei nº 13.146/2015 (LBI) | Norma jurídica vigente. Ano é o da promulgação e não envelhece. |
| eMAG 3.1 (2014) | Modelo oficial do governo brasileiro ainda em vigor, sem versão posterior. |
| ABNT NBR 14724:2011 | Norma vigente para apresentação de trabalhos acadêmicos. |
| ABNT NBR 6023:2018 | Norma vigente para elaboração de referências. |
| NIELSEN (1994) | Texto seminal; citar pela versão revisada em 2024 no site do Nielsen Norman Group. |
| CHACON; STRAUB (2014) | Livro mantido em edição on-line contínua; citar a versão consultada em 2026. |

Formatação segundo a ABNT NBR 6023:2018. Citação no texto: (AUTOR, ano).

---

## 1. Acessibilidade digital e legislação

Fundamenta o requisito de texto alternativo obrigatório, contraste, navegação por teclado e estrutura
semântica adotado no PI 2.

BRASIL. **Lei nº 13.146, de 6 de julho de 2015.** Institui a Lei Brasileira de Inclusão da Pessoa com
Deficiência (Estatuto da Pessoa com Deficiência). Brasília, DF, 2015. Disponível em:
https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm. Acesso livre.

BRASIL. **Lei nº 14.126, de 22 de março de 2021.** Classifica a visão monocular como deficiência
sensorial do tipo visual. Brasília, DF, 2021. Disponível em:
https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14126.htm. Acesso livre.
> Amplia o público atingido pela ausência de texto alternativo e reforça a relevância social do PI 2.

WORLD WIDE WEB CONSORTIUM (W3C). **Web Content Accessibility Guidelines (WCAG) 2.2.** W3C
Recommendation, 5 out. 2023, revisada em 12 dez. 2024. Disponível em: https://www.w3.org/TR/WCAG22/.
Acesso livre.
> **Substitui a WCAG 2.1 (2018) da versão anterior desta lista.** Critérios usados no PI 2: 1.1.1
> Conteúdo não textual, 1.4.1 Uso de cor, 1.4.3 Contraste mínimo (4.5:1), 2.1.1 Teclado, 2.4.1
> Ignorar blocos, 2.4.7 Foco visível, 2.4.11 Foco não obscurecido (novo na 2.2), 2.5.8 Tamanho do
> alvo (novo na 2.2), 4.1.2 Nome, função, valor.

WORLD WIDE WEB CONSORTIUM (W3C). **WAI-ARIA Authoring Practices Guide (APG).** Web Accessibility
Initiative, 2025. Disponível em: https://www.w3.org/WAI/ARIA/apg/. Acesso livre.
> Base do padrão de carrossel acessível, do foco em modais e do uso de regiões `aria-live`.

eMAG. **Modelo de Acessibilidade em Governo Eletrônico, versão 3.1.** Governo Digital. Brasília, DF,
2014. Disponível em:
https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital. Acesso livre.

WEBAIM. **The WebAIM Million: an annual accessibility analysis of the top 1.000.000 home pages.**
Utah State University, Logan, 2025. Disponível em: https://webaim.org/projects/million/. Acesso livre.
> Fonte quantitativa para justificar o problema. **Citar sempre a edição do ano corrente**, porque o
> relatório é anual e o dado de imagens sem texto alternativo muda a cada edição.

INSTITUTO BRASILEIRO DE GEOGRAFIA E ESTATÍSTICA (IBGE). **Pesquisa Nacional de Saúde 2019: ciclos de
vida.** Rio de Janeiro: IBGE, 2021. Disponível em: https://biblioteca.ibge.gov.br. Acesso livre.
> Dimensiona a população brasileira com deficiência. **Conferir antes de citar** se já há divulgação
> do Censo Demográfico 2022 sobre pessoas com deficiência; havendo, ela substitui esta referência.

DEQUE SYSTEMS. **axe DevTools: accessibility testing tools.** 2025. Disponível em:
https://www.deque.com/axe/. Acesso livre (extensão gratuita).

GOOGLE. **Lighthouse: auditorias automatizadas para páginas web.** Chrome for Developers, 2025.
Disponível em: https://developer.chrome.com/docs/lighthouse/. Acesso livre.

---

## 2. JavaScript, interatividade e front-end

Fundamenta os recursos em JavaScript exigidos pelo PI 2: carrossel de imagens, reordenação de slides,
pré-visualização de upload e navegação por teclado.

HAVERBEKE, Marijn. **Eloquent JavaScript: a modern introduction to programming.** 4. ed. San
Francisco: No Starch Press, 2024. Disponível em: https://eloquentjavascript.net/. Acesso livre.
> **Substitui a 3. ed. (2018) da versão anterior desta lista.**

ECMA INTERNATIONAL. **ECMA-262: ECMAScript language specification.** 15. ed. Genebra: Ecma
International, 2024. Disponível em:
https://www.ecma-international.org/publications-and-standards/standards/ecma-262/. Acesso livre.

MOZILLA. **MDN Web Docs: referência de HTML, CSS e JavaScript.** 2026. Disponível em:
https://developer.mozilla.org/pt-BR/. Acesso livre.

META. **React: a biblioteca para interfaces de usuário web e nativas.** Documentação oficial, 2026.
Disponível em: https://react.dev/. Acesso livre.

---

## 3. Back-end, API e banco de dados

RAMÍREZ, Sebastián. **FastAPI: framework web moderno e de alto desempenho para APIs em Python.**
Documentação oficial, 2026. Disponível em: https://fastapi.tiangolo.com/. Acesso livre.

BAYER, Michael. **SQLAlchemy 2.0 documentation.** 2023. Disponível em: https://docs.sqlalchemy.org/.
Acesso livre.

OPENAPI INITIATIVE. **OpenAPI Specification, versão 3.1.1.** Linux Foundation, 2024. Disponível em:
https://spec.openapis.org/oas/latest.html. Acesso livre.
> Base da documentação automática da API em `/docs`, entregue como requisito do PI 2.

PYTHON SOFTWARE FOUNDATION; CLARK, Alex et al. **Pillow (PIL Fork) documentation.** 2025. Disponível
em: https://pillow.readthedocs.io/. Acesso livre.
> Biblioteca usada na renderização das imagens e dos slides do carrossel.

POSTGRESQL GLOBAL DEVELOPMENT GROUP. **PostgreSQL 17 documentation.** 2024. Disponível em:
https://www.postgresql.org/docs/17/. Acesso livre.
> Citar a versão efetivamente usada no projeto, e não a página genérica de documentação.

---

## 4. Engenharia de software, qualidade e testes

INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. **ISO/IEC 25010:2023: systems and software
engineering: SQuaRE: product quality model.** 2. ed. Genebra: ISO, 2023.
> **Substitui a ISO/IEC 25010:2011 da versão anterior desta lista.** A revisão de 2023 reorganiza as
> características de qualidade e passa a tratar interaction capability, o que cobre acessibilidade de
> forma explícita, que é justamente o eixo do PI 2.

PRESSMAN, Roger S.; MAXIM, Bruce R. **Engenharia de software: uma abordagem profissional.** 9. ed.
Porto Alegre: AMGH, 2021.
> **Conferir no acervo da Univesp qual edição está disponível** e citar a que for efetivamente lida.

SOMMERVILLE, Ian. **Engenharia de software.** 10. ed. São Paulo: Pearson, 2019.
> Uso pontual, apenas para processo e requisitos. Se o grupo precisar de uma obra mais recente em
> português, substituir por título equivalente do acervo da Univesp publicado a partir de 2020.

NIELSEN, Jakob. **10 usability heuristics for user interface design.** Nielsen Norman Group, 1994.
Atualizado em 2024. Disponível em: https://www.nngroup.com/articles/ten-usability-heuristics/. Acesso
livre.

PYTEST DEVELOPMENT TEAM. **pytest documentation.** 2025. Disponível em: https://docs.pytest.org/.
Acesso livre.

VITEST. **Vitest: a Vite-native testing framework.** 2025. Disponível em: https://vitest.dev/. Acesso
livre.

TESTING LIBRARY. **React Testing Library.** 2025. Disponível em:
https://testing-library.com/docs/react-testing-library/intro/. Acesso livre.

CHACON, Scott; STRAUB, Ben. **Pro Git.** 2. ed. Apress, 2014. Edição on-line atualizada. Disponível
em: https://git-scm.com/book/pt-br/v2. Acesso livre.
> Base do fluxo de controle de versão adotado pelo grupo: branch por tarefa, pull request e revisão.

---

## 5. Análise de dados e métricas de conteúdo

McKINNEY, Wes. **Python for data analysis.** 3. ed. Sebastopol: O'Reilly, 2022. Disponível em:
https://wesmckinney.com/book/. Acesso livre.

KNAFLIC, Cole Nussbaumer. **Storytelling with data: let's practice!** Hoboken: Wiley, 2020.
> **Substitui FEW (2013) da versão anterior desta lista.** Referência para o painel de análise: evitar
> excesso de elementos decorativos e não codificar informação apenas por cor, o que também é
> requisito de acessibilidade (critério 1.4.1 da WCAG).

LINKEDIN. **LinkedIn Help: publicações, documentos e acessibilidade.** 2026. Disponível em:
https://www.linkedin.com/help/linkedin. Acesso livre.
> Fonte das restrições de formato adotadas na geração do carrossel: documento em PDF, proporção
> recomendada e limite de páginas.

---

## 6. Normas de documentação

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 10520:2023: informação e documentação: citações em
documentos: apresentação.** Rio de Janeiro: ABNT, 2023.
> **Nova nesta versão.** É a norma que rege as citações do relatório; a lista anterior só trazia a de
> referências.

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6023:2018: informação e documentação: referências:
elaboração.** Rio de Janeiro: ABNT, 2018.

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 14724:2011: informação e documentação: trabalhos
acadêmicos: apresentação.** Rio de Janeiro: ABNT, 2011.

UNIVERSIDADE VIRTUAL DO ESTADO DE SÃO PAULO (UNIVESP). **Projeto Integrador em Computação II:
material da disciplina e modelos de relatório.** Ambiente Virtual de Aprendizagem. São Paulo, 2026.

---

## 7. Lacuna a fechar: artigos científicos

A lista acima ainda é majoritariamente normativa e documental. A rubrica do Relatório Parcial dá
2,0 pontos para fundamentação teórica e exige artigos científicos, dissertações ou teses. O grupo
precisa acrescentar **de três a cinco artigos revisados por pares, publicados de 2020 em diante**,
antes da Quinzena 4.

Nenhum artigo foi listado aqui de propósito: referência inventada ou não lida derruba a nota. O que
segue é o protocolo de busca.

**Onde buscar (todas com acesso livre ou via login Univesp):** SciELO, Portal de Periódicos CAPES,
Biblioteca Digital Brasileira de Teses e Dissertações, Google Acadêmico, ACM Digital Library, IEEE
Xplore.

**Termos de busca, por eixo do trabalho:**

| Eixo | Busca em português | Busca em inglês |
|---|---|---|
| Acessibilidade web | `acessibilidade web AND avaliação AND WCAG` | `web accessibility evaluation WCAG conformance` |
| Texto alternativo | `descrição de imagens AND leitor de tela` | `alternative text quality screen reader users` |
| Acessibilidade em redes sociais | `acessibilidade AND redes sociais AND deficiência visual` | `social media accessibility visually impaired` |
| Geração automática de mídia | `geração automática de conteúdo visual` | `automated visual content generation` |
| Qualidade e testes | `testes automatizados AND qualidade de software` | `automated testing software quality ISO 25010` |

**Filtros a aplicar:** ano a partir de 2020; revisado por pares; texto completo disponível.

**Critério de aceitação de cada artigo:** precisa poder ser citado indiretamente em pelo menos um
parágrafo do relatório. Se o grupo não consegue escrever esse parágrafo, o artigo não entra na lista.

---

## 8. Como usar estas referências no Relatório Final

| Seção do relatório | Referências que sustentam |
|---|---|
| Introdução e justificativa | BRASIL (2015); BRASIL (2021); IBGE (2021); WEBAIM (2025) |
| Fundamentação teórica de acessibilidade | W3C (2023); W3C APG (2025); eMAG (2014); artigos da seção 7 |
| Fundamentação teórica de JavaScript e interface | HAVERBEKE (2024); ECMA (2024); MOZILLA; META; NIELSEN (1994/2024) |
| Metodologia e arquitetura | RAMÍREZ; BAYER (2023); OPENAPI (2024); POSTGRESQL (2024); PRESSMAN e MAXIM (2021) |
| Testes e qualidade | ISO/IEC 25010 (2023); PYTEST; VITEST; TESTING LIBRARY; DEQUE (2025); GOOGLE (2025) |
| Análise de dados e resultados | McKINNEY (2022); KNAFLIC (2020); LINKEDIN (2026) |
| Controle de versão e processo | CHACON e STRAUB (2014); SOMMERVILLE (2019) |
