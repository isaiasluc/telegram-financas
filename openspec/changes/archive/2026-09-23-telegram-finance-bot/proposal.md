## Why

Hoje não existe nenhum jeito rápido de registrar e consultar gastos pessoais sem abrir um app ou planilha. Um bot de Telegram elimina essa fricção: registrar um gasto ou perguntar "quanto gastei essa semana?" vira só mandar uma mensagem de texto. Telegram foi escolhido no lugar de WhatsApp por ter uma API de bot oficial, gratuita e estável (sem risco de banimento de número, sem biblioteca não-oficial).

## What Changes

- Novo serviço Node.js que conecta a um bot do Telegram (criado via BotFather) usando a API oficial de bots, e escuta mensagens recebidas de um único usuário autorizado (o dono, identificado pelo seu Telegram user ID).
- Toda mensagem de texto recebida é interpretada por um LLM (Claude API), que classifica a intenção (registrar gasto, consultar gastos, ou desconhecida) e extrai os campos relevantes (valor, descrição, categoria, período da consulta, etc.).
- Gastos registrados são persistidos em PostgreSQL (valor, descrição, categoria, data, método de pagamento opcional).
- Consultas suportadas no MVP: total gasto em um período (semana/mês), maior gasto de um período, e total por categoria.
- O bot responde no próprio Telegram com uma mensagem de texto formatada (confirmação de registro ou resultado da consulta).
- Sem frontend: toda a interação é via Telegram. Não há multi-tenant — o bot reconhece apenas o Telegram user ID do dono e ignora/rejeita mensagens de outros usuários.

## Capabilities

### New Capabilities
- `telegram-gateway`: conexão do bot com a API do Telegram (via long polling), recebimento de mensagens de texto do usuário autorizado e envio de respostas.
- `message-intent-parsing`: uso de LLM para converter uma mensagem de texto livre em uma intenção estruturada (`register_expense`, `query_spending`, `unknown`) com os campos extraídos, incluindo tratamento de mensagens ambíguas ou fora do domínio.
- `expense-tracking`: modelo de dados e operações de persistência para transações financeiras (criar, listar, agregar por período/categoria) em PostgreSQL.
- `financial-queries`: lógica que responde perguntas sobre gastos (total por período, maior gasto, total por categoria) a partir dos dados persistidos e formata a resposta em texto legível para o Telegram.

### Modified Capabilities
(nenhuma — projeto novo, sem specs existentes)

## Impact

- Novo repositório/serviço standalone (sem dependências de outros projetos existentes; é o pivot de um protótipo equivalente baseado em WhatsApp/Baileys, que fica descontinuado).
- Dependências novas: biblioteca de bot do Telegram (`grammy` ou `telegraf`), `pg`/`drizzle-orm` (Postgres), SDK da Anthropic (`@anthropic-ai/sdk`) para o parsing de intenção.
- Requer uma instância PostgreSQL (local via Docker no MVP), uma chave de API da Anthropic, e um bot token do Telegram (criado via @BotFather).
- Sem risco de banimento de número — a API de bots do Telegram é oficial e gratuita para esse uso.
