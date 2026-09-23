import { getCurrentMonthRange, getCurrentWeekRange } from "./expense-tracking/period.js";
import type { Transaction } from "./expense-tracking/schema.js";
import { insertTransaction, listTransactionsByPeriod } from "./expense-tracking/transactions.js";
import { CLARIFICATION_REQUEST } from "./financial-queries/clarification-request.js";
import { formatExpenseConfirmation } from "./financial-queries/expense-confirmation.js";
import { answerSpendingQuery } from "./financial-queries/spending-answer.js";
import type { Period, QuerySpendingIntent, RegisterExpenseIntent } from "./message-intent-parsing/intent.js";
import { parseMessage } from "./message-intent-parsing/parse-message.js";

export async function handleOwnerMessage(text: string): Promise<string> {
  const now = new Date();
  const intent = await parseMessage(text, now);
  console.log(`Intenção classificada: ${JSON.stringify(intent)}`);

  switch (intent.intent) {
    case "register_expense":
      return formatExpenseConfirmation(await registerExpense(intent, text));
    case "query_spending":
      return answerSpendingQuery(intent, await listTransactionsForQuery(intent, now));
    case "unknown":
      console.log("Esclarecimento solicitado, nada persistido");
      return CLARIFICATION_REQUEST;
  }
}

async function registerExpense(intent: RegisterExpenseIntent, rawMessage: string): Promise<Transaction> {
  const transaction = await insertTransaction({
    amountCents: intent.amountCents,
    description: intent.description,
    category: intent.category,
    paymentMethod: intent.paymentMethod,
    rawMessage,
  });
  console.log(`Gasto registrado: id ${transaction.id}`);
  return transaction;
}

async function listTransactionsForQuery(query: QuerySpendingIntent, now: Date): Promise<Transaction[]> {
  const { start, end } = getPeriodRange(query.period, now);
  const transactions = await listTransactionsByPeriod(start, end);
  console.log(`Consulta ${query.queryType}: ${transactions.length} transações entre ${start.toISOString()} e ${end.toISOString()}`);
  return transactions;
}

function getPeriodRange(period: Period, now: Date): { start: Date; end: Date } {
  switch (period) {
    case "current_week":
      return getCurrentWeekRange(now);
    case "current_month":
      return getCurrentMonthRange(now);
  }
}
