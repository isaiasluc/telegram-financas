import type { Transaction } from "../expense-tracking/schema.js";
import { formatBrl, formatCategory } from "./format.js";

export function formatExpenseConfirmation(transaction: Transaction): string {
  return `Anotado: ${formatBrl(transaction.amountCents)} em ${formatCategory(transaction.category)} — ${transaction.description}`;
}
