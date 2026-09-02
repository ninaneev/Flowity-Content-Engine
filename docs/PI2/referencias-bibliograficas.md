# Referências bibliográficas - PI 2

Base bibliográfica do Projeto Integrador em Computação II (Flowity Content Engine 2.0).
Formatação segundo a ABNT NBR 6023:2018. Todas as fontes marcadas com "acesso livre" podem ser lidas ou
baixadas gratuitamente, o que facilita a conferência pelo orientador e pela banca.

Convenção de citação no texto: (AUTOR, ano). Exemplo: (BRASIL, 2015), (W3C, 2018), (HAVERBEKE, 2018).

---

## 1. Acessibilidade digital e legislação

Fundamenta o requisito de texto alternativo obrigatório, contraste, navegação por teclado e estrutura
semântica adotado no PI 2.

A acessibilidade é fundamental para que pessoas com deficiência consigam acessar serviços e informações
com autonomia. Na internet existem diversas práticas para promover a acessibilidade de pessoas com
diferentes deficiências (visuais, motoras, auditivas ou cognitivas); pode-se citar algumas como:
contraste adequado de cores, suporte à navegação por teclado, estrutura semântica em HTML e descrições
de imagem (texto alt) (BRASIL, 2015; eMAG, 2014). No Brasil, a Lei Brasileira de Inclusão (Lei nº
13.146/2015) estabelece a obrigatoriedade de acessibilidade nos sítios da internet mantidos por órgãos
públicos e empresas privadas.

BRASIL. **Lei nº 13.146, de 6 de julho de 2015.** Institui a Lei Brasileira de Inclusão da Pessoa com
Deficiência (Estatuto da Pessoa com Deficiência). Brasília, DF, 2015. Disponível em:
https://www2.senado.leg.br/bdsf/handle/id/592376. Acesso livre.

eMAG. **Modelo de Acessibilidade em Governo Eletrônico.** Governo Digital, Ministério da Gestão e da
Inovação em Serviços Públicos. Brasília, DF, 2014. Disponível em:
https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/eMAGv31.pdf/view.
Acesso livre.

WORLD WIDE WEB CONSORTIUM (W3C). **Web Content Accessibility Guidelines (WCAG) 2.1.** W3C
Recommendation, 5 jun. 2018. Disponível em: https://www.w3.org/TR/WCAG21/. Acesso livre.
> Critérios usados no PI 2: 1.1.1 Conteúdo não textual (texto alternativo), 1.4.3 Contraste mínimo
> (4.5:1), 1.4.1 Uso de cor, 2.1.1 Teclado, 2.4.1 Ignorar blocos (skip link), 2.4.7 Foco visível,
> 4.1.2 Nome, função, valor.

WORLD WIDE WEB CONSORTIUM (W3C). **WAI-ARIA Authoring Practices Guide (APG).** Web Accessibility
Initiative. Disponível em: https://www.w3.org/WAI/ARIA/apg/. Acesso livre.
> Base do padrão de carrossel acessível, do foco em modais e do uso de regiões `aria-live`.

WEBAIM. **The WebAIM Million: an annual accessibility analysis of the top 1.000.000 home pages.** Utah
State University, Logan, EUA. Disponível em: https://webaim.org/projects/million/. Acesso livre.
> Fonte quantitativa para justificar o problema: imagens sem texto alternativo continuam entre as
> falhas de acessibilidade mais frequentes na web.

INSTITUTO BRASILEIRO DE GEOGRAFIA E ESTATÍSTICA (IBGE). **Pesquisa Nacional de Saúde 2019: ciclos de
vida.** Rio de Janeiro: IBGE, 2021. Disponível em: https://www.ibge.gov.br. Acesso livre.
> Dimensiona a população brasileira com deficiência, sustentando a relevância social do requisito.

DEQUE SYSTEMS. **axe DevTools: accessibility testing tools.** Disponível em: https://www.deque.com/axe/.
Acesso livre (extensão gratuita).
> Ferramenta usada para a auditoria automatizada de acessibilidade descrita nos critérios de aceitação.

GOOGLE. **Lighthouse: auditorias automatizadas para páginas web.** Chrome for Developers. Disponível em:
https://developer.chrome.com/docs/lighthouse/. Acesso livre.

---

## 2. JavaScript, interatividade e front-end

Fundamenta os recursos em JavaScript exigidos pelo PI 2: carrossel de imagens, reordenação de slides,
pré-visualização de upload e navegação por teclado.

JavaScript é uma linguagem de programação muito utilizada para melhorar a interatividade e o dinamismo
do usuário com o site. Ela foi criada em 1995 por Brendan Eich e evoluiu ao longo dos anos; antigamente
sua função principal era validar formulários, e atualmente é possível proporcionar diferentes formas de
interatividade com o JavaScript, como: modo escuro (dark mode), menus suspensos (dropdowns) e carrossel
de imagens (HAVERBEKE, 2018).

HAVERBEKE, Marijn. **Eloquent JavaScript: a modern introduction to programming.** 3. ed. San Francisco:
No Starch Press, 2018. Disponível em: https://eloquentjavascript.net/. Acesso livre.

MOZILLA. **MDN Web Docs: referência de HTML, CSS e JavaScript.** Disponível em:
https://developer.mozilla.org/pt-BR/. Acesso livre.

META (FACEBOOK). **React: a biblioteca para interfaces de usuário web e nativas.** Documentação oficial.
Disponível em: https://react.dev/. Acesso livre.

FLAVIO COPES; ECMA INTERNATIONAL. **ECMAScript language specification (ECMA-262).** Genebra: Ecma
International. Disponível em: https://www.ecma-international.org/publications-and-standards/standards/ecma-262/.
Acesso livre.

---

## 3. Back-end, API e banco de dados

RAMÍREZ, Sebastián. **FastAPI: framework web moderno e de alto desempenho para APIs em Python.**
Documentação oficial. Disponível em: https://fastapi.tiangolo.com/. Acesso livre.

BAYER, Michael. **SQLAlchemy 2.0 documentation.** Disponível em: https://docs.sqlalchemy.org/. Acesso
livre.

OPENAPI INITIATIVE. **OpenAPI Specification.** Linux Foundation. Disponível em:
https://spec.openapis.org/oas/latest.html. Acesso livre.
> Base da documentação automática da API em `/docs`, entregue como requisito do PI 2.

PYTHON SOFTWARE FOUNDATION; CLARK, Alex et al. **Pillow (PIL Fork) documentation.** Disponível em:
https://pillow.readthedocs.io/. Acesso livre.
> Biblioteca usada na renderização das imagens e dos slides do carrossel.

POSTGRESQL GLOBAL DEVELOPMENT GROUP. **PostgreSQL documentation.** Disponível em:
https://www.postgresql.org/docs/. Acesso livre.

---

## 4. Engenharia de software, qualidade e testes

PRESSMAN, Roger S.; MAXIM, Bruce R. **Engenharia de software: uma abordagem profissional.** 8. ed. Porto
Alegre: AMGH, 2016.

SOMMERVILLE, Ian. **Engenharia de software.** 10. ed. São Paulo: Pearson, 2018.

INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. **ISO/IEC 25010:2011 - Systems and software engineering:
systems and software Quality Requirements and Evaluation (SQuaRE): system and software quality models.**
Genebra: ISO, 2011.
> Modelo de qualidade usado para justificar as características avaliadas no PI 2: funcionalidade,
> usabilidade (incluindo acessibilidade), confiabilidade e manutenibilidade.

NIELSEN, Jakob. **10 usability heuristics for user interface design.** Nielsen Norman Group, 1994,
atualizado. Disponível em: https://www.nngroup.com/articles/ten-usability-heuristics/. Acesso livre.

PYTEST DEVELOPMENT TEAM. **pytest documentation.** Disponível em: https://docs.pytest.org/. Acesso livre.

VITEST. **Vitest: a Vite-native testing framework.** Disponível em: https://vitest.dev/. Acesso livre.

TESTING LIBRARY. **React Testing Library.** Disponível em:
https://testing-library.com/docs/react-testing-library/intro/. Acesso livre.

CHACON, Scott; STRAUB, Ben. **Pro Git.** 2. ed. Apress, 2014. Disponível em: https://git-scm.com/book/pt-br/v2.
Acesso livre.
> Base do fluxo de controle de versão adotado pelo grupo: branch por tarefa, pull request e revisão.

---

## 5. Análise de dados e métricas de conteúdo

McKINNEY, Wes. **Python for data analysis.** 3. ed. Sebastopol: O'Reilly, 2022. Disponível em:
https://wesmckinney.com/book/. Acesso livre.

FEW, Stephen. **Information dashboard design: displaying data for at-a-glance monitoring.** 2. ed.
Burlingame: Analytics Press, 2013.
> Referência para o painel de análise: evitar excesso de elementos decorativos e não codificar
> informação apenas por cor, o que também é um requisito de acessibilidade (WCAG 2.1, critério 1.4.1).

LINKEDIN. **LinkedIn Help: publicações, documentos e acessibilidade.** Disponível em:
https://www.linkedin.com/help/linkedin. Acesso livre.
> Fonte das restrições de formato adotadas na geração do carrossel: documento em PDF, proporção
> recomendada 4:5 e limite de páginas.

---

## 6. Normas de documentação

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 6023:2018 - Informação e documentação: referências:
elaboração.** Rio de Janeiro: ABNT, 2018.

ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. **NBR 14724:2011 - Informação e documentação: trabalhos
acadêmicos: apresentação.** Rio de Janeiro: ABNT, 2011.

UNIVERSIDADE VIRTUAL DO ESTADO DE SÃO PAULO (UNIVESP). **Projeto Integrador em Computação II: material
da disciplina e modelos de relatório.** Ambiente Virtual de Aprendizagem (AVA). São Paulo, 2026.

---

## 7. Como usar estas referências no Relatório Final

| Seção do relatório | Referências que sustentam |
|---|---|
| Introdução e justificativa | BRASIL (2015); eMAG (2014); IBGE (2021); WEBAIM |
| Fundamentação teórica - acessibilidade | W3C (2018); W3C APG; eMAG (2014) |
| Fundamentação teórica - JavaScript e interface | HAVERBEKE (2018); MOZILLA; META; NIELSEN (1994) |
| Metodologia e arquitetura | RAMÍREZ; BAYER; OPENAPI; POSTGRESQL; PRESSMAN e MAXIM (2016) |
| Testes e qualidade | ISO/IEC 25010 (2011); PYTEST; VITEST; TESTING LIBRARY; DEQUE; GOOGLE |
| Análise de dados e resultados | McKINNEY (2022); FEW (2013); LINKEDIN |
| Controle de versão e processo | CHACON e STRAUB (2014); SOMMERVILLE (2018) |
