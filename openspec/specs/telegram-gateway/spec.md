# telegram-gateway Specification

## Purpose
TBD - created by archiving change telegram-finance-bot. Update Purpose after archive.
## Requirements
### Requirement: Conexão com a API do Telegram via long polling
O sistema SHALL conectar ao bot do Telegram usando um bot token e SHALL receber mensagens via long polling (`getUpdates`), sem exigir webhook/URL pública.

#### Scenario: Start do serviço
- **WHEN** o serviço inicia com um bot token válido configurado
- **THEN** o sistema começa a receber atualizações de mensagens via long polling

#### Scenario: Token inválido ou ausente
- **WHEN** o serviço inicia sem um bot token válido configurado
- **THEN** o sistema falha ao iniciar com um erro claro, sem tentar operar sem autenticação

### Requirement: Filtro por usuário autorizado
O sistema SHALL processar apenas mensagens recebidas do Telegram user ID configurado como dono (via variável de ambiente) e SHALL ignorar silenciosamente mensagens de qualquer outro usuário, sem enviar resposta.

#### Scenario: Mensagem do dono
- **WHEN** uma mensagem de texto chega de um user ID igual ao configurado como autorizado
- **THEN** o sistema encaminha o conteúdo da mensagem para o parsing de intenção

#### Scenario: Mensagem de usuário não autorizado
- **WHEN** uma mensagem de texto chega de um user ID diferente do configurado como autorizado
- **THEN** o sistema descarta a mensagem sem processá-la e sem enviar qualquer resposta

### Requirement: Envio de respostas de texto
O sistema SHALL permitir enviar uma mensagem de texto de volta ao chat do usuário autorizado como resposta a uma mensagem recebida.

#### Scenario: Resposta após processar uma mensagem
- **WHEN** o processamento de uma mensagem recebida (registro de gasto ou consulta) produz um texto de resposta
- **THEN** o sistema envia esse texto como mensagem do Telegram de volta ao chat do usuário autorizado

