# Roteiro de teste manual com NVDA — Tarefa 11

**Funcionalidade:** navegação por teclado e leitor de tela no carrossel  
**Aplicação:** Flowity Content Engine (`/carousel/1`)  
**Leitor de tela:** NVDA  
**Data do teste:** A preencher  
**Responsável:** A preencher

> **Estado deste relatório:** os cinco passos abaixo ainda não foram executados nesta sessão. Os resultados estão registrados como pendentes para evitar declarar testes que não foram realizados. Atualize cada resultado após testar a aplicação real com teclado e NVDA.

## Resultados dos testes

### 1. Abrir o carrossel e navegar apenas pelo teclado

- **Procedimento:** abrir `/carousel/1` e usar `Tab` e `Shift+Tab` para percorrer os controles, sem usar o mouse.
- **Resultado esperado:** os controles interativos recebem foco e o indicador visual de foco é perceptível.
- **Resultado observado:** Pendente — executar o teste.
- **Status:** Não executado.

### 2. Navegar entre os slides com as setas

- **Procedimento:** focar um cartão de slide e pressionar `ArrowRight` e `ArrowLeft`.
- **Resultado esperado:** a seleção muda para o slide seguinte/anterior dentro dos limites da lista, e o NVDA anuncia a posição do slide (por exemplo, “Slide 2 de 7”).
- **Resultado observado:** Pendente — executar o teste.
- **Status:** Não executado.

### 3. Abrir a edição do slide com Enter ou Espaço

- **Procedimento:** focar um cartão de slide e pressionar `Enter`; repetir com `Espaço`.
- **Resultado esperado:** o foco vai para o campo de texto do slide, e o NVDA identifica o campo de edição.
- **Resultado observado:** Pendente — executar o teste.
- **Status:** Não executado.

### 4. Abrir o modal da publicação

- **Procedimento:** usando apenas o teclado, abrir o modal de publicação (`PostModal`) pelo fluxo disponível na aplicação.
- **Resultado esperado:** o modal abre e o foco fica em um controle apropriado dentro dele.
- **Resultado observado:** Pendente — executar o teste.
- **Status:** Não executado.

### 5. Fechar com Escape e verificar a restauração do foco

- **Procedimento:** com o modal aberto, pressionar `Escape`.
- **Resultado esperado:** o modal fecha e o foco retorna ao elemento que o abriu.
- **Resultado observado:** Pendente — executar o teste.
- **Status:** Não executado.

## Conclusão

**Resultado geral:** Pendente de validação manual.

Não é possível confirmar a aprovação da Tarefa 11 até que os cinco passos sejam executados na aplicação com teclado e NVDA. Registre acima o resultado observado de cada passo e anote eventuais problemas encontrados.
