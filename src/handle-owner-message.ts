import type { Transaction } from "./expense-tracking/schema.js";
import { insertTransaction } from "./expense-tracking/transactions.js";
import { formatExpenseConfirmation } from "./financial-queries/expense-confirmation.js";
import type { RegisterExpenseIntent } from "./message-intent-parsing/intent.js";
import { parseMessage } from "./message-intent-parsing/parse-message.js";

export async function handleOwnerMessage(text: string): Promise<string> {
  const intent = await parseMessage(text, new Date());

  switch (intent.intent) {
    case "register_expense":
      return formatExpenseConfirmation(await registerExpense(intent, text));
    case "query_spending":
    case "unknown":
      return "Ainda não sei responder isso.";
  }
}

function registerExpense(intent: RegisterExpenseIntent, rawMessage: string): Promise<Transaction> {
  return insertTransaction({
    amountCents: intent.amountCents,
    description: intent.description,
    category: intent.category,
    paymentMethod: intent.paymentMethod,
    rawMessage,
  });
}
