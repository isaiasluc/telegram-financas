import type { Bot } from "grammy";

export async function sendTextMessage(bot: Bot, chatId: number, text: string): Promise<void> {
  await bot.api.sendMessage(chatId, text);
}
