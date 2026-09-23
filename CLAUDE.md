# telegram-financas

Bot pessoal de Telegram para controle financeiro. Uso single-user (só o Telegram user
ID do dono interage com o bot). Sem frontend — toda a superfície é o Telegram. Pivot
de um protótipo equivalente que usava WhatsApp/Baileys (descontinuado): mesmo domínio,
só troca o canal de mensageria.

## Stack

- Node.js + TypeScript (`strict: true`, sem `any` implícito)
- PostgreSQL via Drizzle ORM
- API oficial de bots do Telegram (via `grammy`), long polling — sem webhook/URL pública
- Anthropic SDK (Claude) para parsing de intenção via tool use / structured output

## Arquitetura (capabilities, ver `openspec/specs/`)

- `telegram-gateway` — conexão via long polling, filtro por Telegram user ID autorizado, envio de respostas
- `message-intent-parsing` — LLM converte texto livre em intenção estruturada (`register_expense` | `query_spending` | `unknown`)
- `expense-tracking` — schema e persistência das transações (Postgres/Drizzle)
- `financial-queries` — agregações e formatação de resposta em texto

Organize `src/` por capability (uma pasta por item acima), não por tipo técnico
(`controllers/`, `services/` genéricos).

## Clean code — regras deste projeto

- **Funções pequenas, uma responsabilidade.** Se uma função faz "parse e persiste e
  responde", quebre em três.
- **Nomes revelam intenção.** Sem abreviações obscuras; nomes de função são verbos,
  nomes de dado são substantivos.
- **Sem comentários óbvios.** Só comente o *porquê* quando não for óbvio pelo código
  (ex: uma decisão de trade-off, uma limitação da API do Telegram). Nunca comente o
  *o quê*.
- **Sem abstração prematura.** Três linhas parecidas são melhores que uma abstração
  para um caso hipotético futuro. Não adicione flags, configs ou camadas para
  requisitos que não existem ainda.
- **Erros só nas bordas.** Validação e tratamento de erro pertencem às bordas do
  sistema (mensagem recebida do Telegram, resposta do LLM, I/O do banco). Código
  interno confia nos tipos e nos contratos já validados — não reintroduza checagens
  defensivas redundantes.
- **Sem código morto nem shims de compatibilidade.** Isso é um projeto novo sem
  usuários externos: ao mudar algo, mude — não deixe a versão antiga "por garantia".

## Regras de domínio (não-negociáveis)

- **Dinheiro é sempre inteiro em centavos** (`amount_cents`). Nunca usar float para
  valores monetários, em nenhuma camada.
- **Nunca perder um gasto por erro de parsing.** Se o LLM não extrair valor e
  descrição com confiança, a intenção cai em `unknown` e o bot pede esclarecimento —
  nunca falha silenciosamente nem descarta a mensagem sem responder ao dono.
- **`raw_message` é sempre persistido junto com o registro**, para auditoria.
- Mensagens de usuários não autorizados são ignoradas **silenciosamente** (sem
  resposta) — não é bug, é requisito de segurança/privacidade.

## Segurança

- `.env` e qualquer credencial (bot token, chave da Anthropic) nunca são commitados
  (confirme `.gitignore` antes de criar esses arquivos).
- Nunca logar o conteúdo de mensagens de remetentes não autorizados.
- Nunca logar `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN` ou `DATABASE_URL`, nem em
  erros/stack traces.

## Banco de dados

- Alterações de schema sempre via migration do `drizzle-kit` — nunca editar o banco
  manualmente. Migrations aplicadas não são editadas retroativamente; uma correção é
  uma nova migration.

## Testes

- Priorize testes de unidade para lógica pura e crítica: extração de período
  (semana/mês em `America/Sao_Paulo`, UTC-3 fixo), agregações (`sumTotal`,
  `findBiggest`, `sumByCategory`), e o schema/parsing da resposta do LLM.
- Esses testes não devem exigir uma sessão real do Telegram conectada.

## Fluxo de trabalho (OpenSpec)

Este projeto usa OpenSpec (`openspec/`) para specs e mudanças de escopo.

- Mudança estrutural (nova capability, novo requirement, mudança de schema com
  impacto em spec existente) → propor via skill `opsx:propose` antes de implementar.
- Ajuste pequeno (bug fix, refino de mensagem de resposta, detalhe de implementação
  que não muda um requirement) não precisa de proposta nova — pode implementar direto.
- Ao concluir os tasks de uma change, arquivar com `opsx:archive`.
