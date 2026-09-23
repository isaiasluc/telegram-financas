## ADDED Requirements

### Requirement: Persistência de transações financeiras
O sistema SHALL persistir cada gasto registrado em PostgreSQL com valor em centavos, descrição, categoria, método de pagamento opcional, data de ocorrência e o texto original da mensagem recebida.

#### Scenario: Registro bem-sucedido
- **WHEN** uma intenção `register_expense` com valor e descrição válidos é processada
- **THEN** o sistema insere uma nova linha na tabela de transações com esses dados e a data/hora atual como data de ocorrência

#### Scenario: Preservação da mensagem original
- **WHEN** uma transação é persistida
- **THEN** o texto original da mensagem do Telegram que originou o registro é armazenado junto, para auditoria

### Requirement: Consulta de transações por período
O sistema SHALL permitir consultar todas as transações cuja data de ocorrência esteja dentro de um intervalo de datas informado (ex: semana atual, mês atual).

#### Scenario: Listar transações da semana atual
- **WHEN** é solicitada a lista de transações com período "semana atual"
- **THEN** o sistema retorna todas as transações cuja `occurred_at` está entre o início e o fim da semana corrente (fuso `America/Sao_Paulo`)

#### Scenario: Listar transações do mês atual
- **WHEN** é solicitada a lista de transações com período "mês atual"
- **THEN** o sistema retorna todas as transações cuja `occurred_at` está entre o primeiro e o último dia do mês corrente (fuso `America/Sao_Paulo`)

### Requirement: Agregação de transações
O sistema SHALL calcular a soma total de valores, o maior valor individual, e a soma total agrupada por categoria, para um conjunto de transações de um período informado.

#### Scenario: Soma total de um período
- **WHEN** é solicitada a soma total de um período com transações existentes
- **THEN** o sistema retorna a soma dos valores de todas as transações desse período

#### Scenario: Maior gasto de um período
- **WHEN** é solicitado o maior gasto de um período com transações existentes
- **THEN** o sistema retorna a transação de maior valor individual desse período, incluindo descrição e valor

#### Scenario: Total por categoria em um período
- **WHEN** é solicitado o total gasto em uma categoria específica dentro de um período
- **THEN** o sistema retorna a soma dos valores das transações desse período que pertencem a essa categoria

#### Scenario: Período sem transações
- **WHEN** é solicitada qualquer agregação de um período sem nenhuma transação registrada
- **THEN** o sistema retorna um resultado vazio/zero, sem erro
