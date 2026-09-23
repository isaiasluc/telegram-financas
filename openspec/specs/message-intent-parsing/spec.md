# message-intent-parsing Specification

## Purpose
TBD - created by archiving change telegram-finance-bot. Update Purpose after archive.
## Requirements
### Requirement: Classificação de intenção via LLM
O sistema SHALL enviar toda mensagem de texto autorizada a um LLM (Claude API) junto com a data/hora atual, e SHALL receber de volta uma intenção estruturada dentre exatamente três valores: `register_expense`, `query_spending` ou `unknown`.

#### Scenario: Mensagem de registro de gasto
- **WHEN** a mensagem recebida descreve um gasto com valor associado (ex: "almoço em churrascaria do arnaldo 18,96")
- **THEN** o LLM retorna `intent: register_expense` com os campos extraídos de valor e descrição preenchidos

#### Scenario: Mensagem de consulta
- **WHEN** a mensagem recebida é uma pergunta sobre gastos (ex: "quanto gastei essa semana?", "qual foi meu maior gasto do mês?")
- **THEN** o LLM retorna `intent: query_spending` com o tipo de consulta e o período identificados

#### Scenario: Mensagem fora do domínio ou ambígua
- **WHEN** a mensagem recebida não contém informação suficiente para registrar um gasto nem corresponde a uma pergunta de consulta reconhecida
- **THEN** o LLM retorna `intent: unknown`

### Requirement: Extração estruturada de dados de gasto
Quando a intenção for `register_expense`, o sistema SHALL extrair no mínimo valor monetário e descrição da mensagem, e SHALL sugerir uma categoria a partir de uma lista fixa (alimentação, transporte, lazer, saúde, moradia, outros).

#### Scenario: Valor e descrição presentes
- **WHEN** a mensagem contém um valor monetário claro (ex: "R$ 18,96", "18,96", "18.96") e uma descrição do gasto
- **THEN** o sistema extrai o valor em centavos, a descrição textual e uma categoria sugerida da lista fixa

#### Scenario: Valor ausente ou não identificável
- **WHEN** a mensagem parece descrever um gasto mas não contém um valor monetário identificável
- **THEN** o sistema classifica a intenção como `unknown` em vez de `register_expense` com valor vazio

### Requirement: Extração estruturada de parâmetros de consulta
Quando a intenção for `query_spending`, o sistema SHALL extrair o tipo de consulta (`total_by_period`, `biggest_expense`, `total_by_category`) e o período relevante (semana atual, mês atual, ou categoria informada).

#### Scenario: Consulta de total por período
- **WHEN** a mensagem pergunta quanto foi gasto em um período (ex: "quanto gastei essa semana?", "total do mês")
- **THEN** o sistema extrai `query_type: total_by_period` e o período correspondente (semana atual ou mês atual)

#### Scenario: Consulta de maior gasto
- **WHEN** a mensagem pergunta qual foi o maior gasto (ex: "qual foi meu maior gasto do mês?")
- **THEN** o sistema extrai `query_type: biggest_expense` e o período correspondente

#### Scenario: Consulta de total por categoria
- **WHEN** a mensagem pergunta quanto foi gasto em uma categoria específica (ex: "quanto gastei com alimentação esse mês?")
- **THEN** o sistema extrai `query_type: total_by_category`, a categoria informada e o período correspondente

