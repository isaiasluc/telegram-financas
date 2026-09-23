import "dotenv/config";

import { handleOwnerMessage } from "./handle-owner-message.js";
import { createBot } from "./telegram-gateway/bot.js";
import { sendTextMessage } from "./telegram-gateway/messages.js";
import { onOwnerMessage } from "./telegram-gateway/owner-messages.js";

const PROCESSING_FAILED_REPLY = "Não consegui processar sua mensagem agora. Tente de novo em instantes.";

const bot = createBot();

onOwnerMessage(bot, async (chatId, text) => {
  console.log(`Mensagem recebida: ${text}`);

  // Falha da API da Anthropic ou do banco não pode derrubar o polling nem deixar o
  // dono sem resposta: ele precisa saber que o gasto não foi registrado.
  try {
    await sendTextMessage(bot, chatId, await handleOwnerMessage(text));
  } catch (error) {
    console.error("Falha ao processar mensagem:", error);
    await sendTextMessage(bot, chatId, PROCESSING_FAILED_REPLY);
  }
});

await bot.start();
