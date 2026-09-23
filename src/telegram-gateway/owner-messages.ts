import type { Bot } from "grammy";

export type OwnerMessageHandler = (chatId: number, text: string) => Promise<void>;

export function onOwnerMessage(bot: Bot, handle: OwnerMessageHandler): void {
  const ownerId = getOwnerUserId();

  bot.on("message:text", async (ctx) => {
    if (ctx.from.id !== ownerId) return;
    await handle(ctx.chat.id, ctx.message.text);
  });
}

function getOwnerUserId(): number {
  const raw = process.env.OWNER_TELEGRAM_USER_ID;
  if (!raw) {
    throw new Error("OWNER_TELEGRAM_USER_ID não configurado");
  }

  return Number(raw);
}
