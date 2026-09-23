import "dotenv/config";

import { createBot } from "./telegram-gateway/bot.js";
import { sendTextMessage } from "./telegram-gateway/messages.js";
import { onOwnerMessage } from "./telegram-gateway/owner-messages.js";

const bot = createBot();

onOwnerMessage(bot, async (chatId, text) => {
  console.log(`Mensagem recebida: ${text}`);
  await sendTextMessage(bot, chatId, text);
});

await bot.start();
