# telegram-financas

Bot pessoal de Telegram para controle financeiro. Você manda uma mensagem de texto livre
e o bot registra o gasto ou responde perguntas sobre os seus gastos. A interpretação das
mensagens é feita pelo Claude (API da Anthropic). O bot só responde ao seu Telegram user ID.

```
você: almoço em churrascaria do arnaldo 18,96
bot:  Anotado: R$ 18,96 em Alimentação — Almoço na Churrascaria do Arnaldo

você: quanto gastei essa semana?
bot:  Você gastou R$ 142,30 essa semana.
```

Consultas suportadas: total da semana ou do mês, maior gasto do período e total por
categoria (alimentação, transporte, lazer, saúde, moradia, outros).

## Requisitos

- Node.js (testado com a versão 24)
- Docker (para o PostgreSQL local)
- Uma conta no Telegram
- Uma chave de API da Anthropic, com créditos

## Setup

### 1. Criar o bot no Telegram

1. No Telegram, abra uma conversa com o [@BotFather](https://t.me/BotFather) e envie `/newbot`.
2. Escolha um nome e um username terminado em `bot`.
3. O BotFather responde com o token do bot. Esse é o valor de `TELEGRAM_BOT_TOKEN`.

### 2. Descobrir o seu Telegram user ID

Envie qualquer mensagem para o [@userinfobot](https://t.me/userinfobot). Ele responde com o
seu ID numérico, que é o valor de `OWNER_TELEGRAM_USER_ID`. Mensagens de qualquer outro
usuário são ignoradas, sem resposta.

### 3. Configurar o `.env`

```sh
cp .env.example .env
```

Preencha as variáveis:

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | Já vem apontando para o Postgres do Docker Compose |
| `ANTHROPIC_API_KEY` | Chave criada em https://console.anthropic.com |
| `TELEGRAM_BOT_TOKEN` | Token do passo 1 |
| `OWNER_TELEGRAM_USER_ID` | ID do passo 2 |

O `.env` está no `.gitignore` e não deve ser commitado.

### 4. Subir o banco e rodar as migrations

```sh
docker compose up -d
npm install
npm run db:migrate
```

O Postgres fica exposto em `localhost:5436`.

### 5. Rodar o bot

```sh
npm run dev
```

O bot usa long polling, então não precisa de URL pública nem de webhook. Mande uma mensagem
para ele no Telegram para testar.

Para rodar a versão compilada: `npm run build && npm start`.

## Desenvolvimento

```sh
npm run typecheck
npm test
```

Mudanças no schema do banco são feitas em `src/expense-tracking/schema.ts`, seguidas de
`npm run db:generate` para gerar a migration e `npm run db:migrate` para aplicá-la.
