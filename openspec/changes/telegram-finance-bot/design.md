## Context

Serviço novo, sem código existente. Uso pessoal (single-user): apenas o Telegram user ID do dono interage com o bot. Sem app web, sem autenticação multi-tenant. Stack fixada: Node.js + TypeScript, PostgreSQL via Drizzle, Telegram Bot API oficial, Anthropic (Claude) para interpretar linguagem natural. Este projeto é o pivot direto de um protótipo equivalente que usava WhatsApp/Baileys — mesmo domínio e mesma lógica de negócio, só troca o canal de mensageria.

## Goals / Non-Goals

**Goals:**
- Registrar gastos a partir de mensagens de texto livre no Telegram (ex: "almoço em churrascaria do arnaldo 18,96").
- Responder perguntas sobre gastos em linguagem natural (total da semana/mês, maior gasto, total por categoria).
- Persistir tudo em PostgreSQL de forma consultável e auditável (nunca perder um gasto por erro de parsing).
- Rodar localmente/self-hosted com setup simples (Docker Compose para Postgres, bot token único).

**Non-Goals:**
- Multi-usuário/multi-tenant, autenticação, ou onboarding de outros usuários do Telegram.
- Orçamentos, metas, alertas proativos ou integrações bancárias (Open Finance) — fica para uma fase futura.
- Frontend web/dashboard — toda a superfície é o Telegram.
- Alta disponibilidade / deploy em produção — nesta fase é uso pessoal local.
- Recursos ricos do Telegram (botões inline, comandos `/slash`, teclados customizados) — MVP é só texto livre.

## Decisions

### 1. Telegram Bot API oficial em vez de WhatsApp/Baileys
A API de bots do Telegram é gratuita, oficial, documentada, e não tem risco de banimento — diferente do Baileys (WhatsApp não-oficial). Não exige número de telefone dedicado, só um bot token criado via @BotFather. Trade-off: o usuário precisa ter/usar Telegram em vez do WhatsApp do dia a dia — aceitável, já que é escolha própria do dono do bot.

### 2. Long polling em vez de webhook
Para uso pessoal local (sem domínio público/HTTPS fixo), long polling (`getUpdates`) é mais simples que configurar um webhook — não exige expor uma URL pública. Trade-off aceito: leve overhead de polling contínuo, irrelevante para volume de uso pessoal. Migrar para webhook fica como opção futura se o serviço for hospedado com URL pública estável.

### 3. Filtro por Telegram user ID autorizado
Cada mensagem recebida é comparada contra um `OWNER_TELEGRAM_USER_ID` fixo (variável de ambiente). Mensagens de qualquer outro usuário são ignoradas silenciosamente (sem resposta), mesmo que descubram o bot (ex: por username público).

### 4. LLM (Claude) para intent parsing, não regex/NLU tradicional
Mensagens em português livre ("gastei 18,96 no almoço hoje", "quanto rolou de gasto essa semana?") têm variação demais para regras fixas. O LLM recebe a mensagem + data atual e retorna um JSON estruturado com `intent` (`register_expense` | `query_spending` | `unknown`) e os campos extraídos (valor, descrição, categoria sugerida, período). Uso de **tool use / structured output** da API da Anthropic para garantir JSON válido, com schema estrito. Se o LLM não conseguir extrair valor+descrição num `register_expense`, cai em `unknown` e o bot pede esclarecimento.

### 5. Categoria sugerida automaticamente, sem cadastro prévio
No MVP, o LLM sugere uma categoria (ex: alimentação, transporte, lazer, saúde, moradia, outros) a partir de uma lista fixa curta, em vez de exigir que o usuário categorize manualmente ou de ter uma tabela de categorias customizável. Reduz fricção; customização fica para depois.

### 6. Schema do banco: uma tabela `transactions`
Colunas: `id`, `amount_cents` (inteiro, evita erro de ponto flutuante em dinheiro), `description`, `category`, `payment_method` (nullable), `occurred_at` (timestamp, default now), `raw_message` (texto original recebido, para auditoria/debug), `created_at`. Sem tabela de usuários nesta fase (single-user); se multi-user vier depois, adiciona-se `user_id` via migration.

## Risks / Trade-offs

- [Bot token vazar e permitir controle do bot por terceiros] → Mitigação: token só em `.env` (nunca commitado), e mesmo que o bot receba mensagens de terceiros, o filtro por `OWNER_TELEGRAM_USER_ID` impede qualquer ação — o pior caso é o atacante ver que o bot existe, não comprometer dados.
- [LLM interpretar errado um gasto (valor ou categoria)] → Mitigação: bot sempre responde com o que entendeu registrar ("Anotado: R$18,96 em Alimentação — Churrascaria do Arnaldo"), permitindo ao usuário perceber erro rapidamente; comando futuro de correção/exclusão pode ser adicionado depois.
- [Custo de API da Anthropic por mensagem] → Mitigação: uso pessoal tem volume baixo (poucas mensagens/dia); usar um modelo custo-eficiente para essa tarefa de classificação simples.
- [Long polling parar silenciosamente após erro de rede] → Mitigação: biblioteca de bot (grammY/Telegraf) já trata retry de polling; logar qualquer erro de polling não recuperado automaticamente.

## Migration Plan

Não há sistema anterior no Telegram — é criação do zero (o protótipo em WhatsApp é descontinuado, sem migração de dados entre os dois, já que nenhum dado de produção foi gerado nele). Ordem de entrega: (1) infra base (Postgres + schema), (2) bot do Telegram funcionando (echo simples), (3) parsing de intenção via LLM, (4) registrar gasto ponta a ponta, (5) consultas ponta a ponta. Cada etapa é validável isoladamente antes de avançar.

## Open Questions

- Timezone para "essa semana"/"esse mês": assumir `America/Sao_Paulo` fixo por enquanto (sem horário de verão desde 2019, então é UTC-3 fixo) — confirmar se o usuário quer configurável.
- Lista fixa de categorias: validar com o usuário se a lista sugerida (alimentação, transporte, lazer, saúde, moradia, outros) cobre bem o caso de uso antes de travar no schema.
