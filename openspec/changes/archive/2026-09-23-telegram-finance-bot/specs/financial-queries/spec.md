## ADDED Requirements

### Requirement: Resposta a consulta de total por período
Quando a intenção for `query_spending` do tipo `total_by_period`, o sistema SHALL calcular o total gasto no período identificado e SHALL responder com uma mensagem de texto legível informando o valor total e o período.

#### Scenario: Total da semana com gastos registrados
- **WHEN** o usuário pergunta o total gasto na semana atual e existem transações nesse período
- **THEN** o bot responde com o valor total formatado em reais e uma referência ao período ("essa semana")

#### Scenario: Total do mês sem nenhum gasto registrado
- **WHEN** o usuário pergunta o total gasto no mês atual e não existem transações nesse período
- **THEN** o bot responde informando que não há gastos registrados nesse período

### Requirement: Resposta a consulta de maior gasto
Quando a intenção for `query_spending` do tipo `biggest_expense`, o sistema SHALL identificar a transação de maior valor no período e SHALL responder com o valor, a descrição e a data desse gasto.

#### Scenario: Maior gasto do mês com transações existentes
- **WHEN** o usuário pergunta qual foi o maior gasto do mês e existem transações nesse período
- **THEN** o bot responde com o valor, a descrição e a data da transação de maior valor

#### Scenario: Maior gasto de período sem transações
- **WHEN** o usuário pergunta qual foi o maior gasto de um período sem nenhuma transação registrada
- **THEN** o bot responde informando que não há gastos registrados nesse período

### Requirement: Resposta a consulta de total por categoria
Quando a intenção for `query_spending` do tipo `total_by_category`, o sistema SHALL calcular o total gasto na categoria informada dentro do período identificado e SHALL responder com esse valor.

#### Scenario: Total de categoria com gastos existentes
- **WHEN** o usuário pergunta quanto gastou em uma categoria específica em um período com transações nessa categoria
- **THEN** o bot responde com o valor total gasto naquela categoria no período

#### Scenario: Categoria sem gastos no período
- **WHEN** o usuário pergunta quanto gastou em uma categoria específica em um período sem transações nessa categoria
- **THEN** o bot responde informando que não há gastos registrados naquela categoria nesse período

### Requirement: Confirmação de gasto registrado
Após persistir um gasto com sucesso, o sistema SHALL responder confirmando os dados registrados (valor, descrição e categoria) para que o usuário possa validar que o registro foi interpretado corretamente.

#### Scenario: Confirmação após registro bem-sucedido
- **WHEN** um gasto é persistido com sucesso a partir de uma mensagem do usuário
- **THEN** o bot responde confirmando o valor, a descrição e a categoria registrados

### Requirement: Resposta a mensagem não compreendida
Quando a intenção for `unknown`, o sistema SHALL responder pedindo esclarecimento, sem persistir nenhum dado.

#### Scenario: Mensagem ambígua ou fora do domínio
- **WHEN** a intenção classificada para uma mensagem é `unknown`
- **THEN** o bot responde explicando que não entendeu e sugerindo como registrar um gasto ou fazer uma consulta, sem gravar nada no banco
