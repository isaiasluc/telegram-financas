## 1. Setup do projeto

- [x] 1.1 Inicializar projeto Node.js + TypeScript (package.json, tsconfig.json, estrutura de pastas `src/`)
- [x] 1.2 Configurar Docker Compose com PostgreSQL local
- [x] 1.3 Configurar variáveis de ambiente (`.env`): `DATABASE_URL`, `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `OWNER_TELEGRAM_USER_ID`
- [x] 1.4 Adicionar dependências: biblioteca de bot do Telegram (`grammy`), `drizzle-orm`, `pg`, `@anthropic-ai/sdk`

## 2. Banco de dados (expense-tracking)

- [x] 2.1 Definir schema Drizzle da tabela `transactions` (id, amount_cents, description, category, payment_method, occurred_at, raw_message, created_at)
- [x] 2.2 Gerar e rodar migration inicial
- [x] 2.3 Implementar função `insertTransaction(data)`
- [x] 2.4 Implementar função `listTransactionsByPeriod(start, end)`
- [x] 2.5 Implementar funções de agregação: `sumTotal(transactions)`, `findBiggest(transactions)`, `sumByCategory(transactions, category)`
- [x] 2.6 Implementar helpers de período (início/fim da semana atual e do mês atual, fuso `America/Sao_Paulo`, UTC-3 fixo)

## 3. Bot do Telegram (telegram-gateway)

- [x] 3.1 Criar bot via @BotFather e obter `TELEGRAM_BOT_TOKEN`
- [x] 3.2 Implementar conexão via long polling (`getUpdates`) usando a biblioteca escolhida
- [x] 3.3 Implementar filtro de remetente: processar apenas mensagens do `OWNER_TELEGRAM_USER_ID`, ignorar demais silenciosamente
- [x] 3.4 Implementar função de envio de mensagem de texto de resposta
- [x] 3.5 Testar ponta a ponta: enviar uma mensagem de teste pelo Telegram e confirmar recebimento no processo (echo simples)

## 4. Parsing de intenção via LLM (message-intent-parsing)

- [x] 4.1 Definir schema estruturado (tool use / structured output) da Anthropic para a resposta do LLM: `intent`, campos de gasto, campos de consulta
- [x] 4.2 Escrever prompt de sistema com a data/hora atual, lista fixa de categorias e exemplos de cada intenção
- [x] 4.3 Implementar função `parseMessage(text, now)` que chama a API e retorna a intenção estruturada tipada
- [x] 4.4 Tratar caso de valor monetário ausente/ambíguo como `unknown`
- [x] 4.5 Testar manualmente com variações de mensagens de registro e consulta (incluindo mensagens fora do domínio)

## 5. Fluxo de registro de gasto (ponta a ponta)

- [x] 5.1 Conectar `telegram-gateway` → `message-intent-parsing`: mensagem recebida do dono é enviada para parsing
- [x] 5.2 Quando `intent = register_expense`, persistir via `insertTransaction`, incluindo `raw_message`
- [x] 5.3 Responder confirmando valor, descrição e categoria registrados (financial-queries: confirmação de registro)
- [x] 5.4 Testar ponta a ponta: enviar "almoço em churrascaria do arnaldo 18,96" pelo Telegram e confirmar linha criada no banco e resposta de confirmação recebida

## 6. Fluxo de consultas (ponta a ponta)

- [ ] 6.1 Quando `intent = query_spending` com `query_type = total_by_period`, buscar transações do período e responder com o total formatado
- [ ] 6.2 Quando `query_type = biggest_expense`, buscar transações do período e responder com a de maior valor (descrição, valor, data)
- [ ] 6.3 Quando `query_type = total_by_category`, buscar transações do período filtradas por categoria e responder com o total
- [ ] 6.4 Tratar período sem transações em cada tipo de consulta com resposta apropriada ("nenhum gasto registrado")
- [ ] 6.5 Testar ponta a ponta: "quanto gastei essa semana?", "qual foi meu maior gasto do mês?", "quanto gastei com alimentação esse mês?"

## 7. Resposta a mensagens não compreendidas

- [ ] 7.1 Quando `intent = unknown`, responder pedindo esclarecimento sem persistir nada
- [ ] 7.2 Testar com mensagem ambígua/fora do domínio (ex: "oi", "bom dia")

## 8. Polimento

- [ ] 8.1 Formatar valores monetários em reais (R$) nas respostas
- [ ] 8.2 Adicionar logs básicos (mensagem recebida, intenção classificada, ação tomada) para debug
- [ ] 8.3 Revisar `.gitignore` (`.env`, `node_modules`)
- [ ] 8.4 Escrever README com instruções de setup (Docker, .env, criação do bot no @BotFather)
