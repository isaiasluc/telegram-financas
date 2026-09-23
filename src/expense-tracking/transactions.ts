import { between } from "drizzle-orm";

import { db } from "./db.js";
import { type NewTransaction, type Transaction, transactions } from "./schema.js";

export async function insertTransaction(data: NewTransaction): Promise<Transaction> {
  const [inserted] = await db.insert(transactions).values(data).returning();
  return inserted;
}

export async function listTransactionsByPeriod(start: Date, end: Date): Promise<Transaction[]> {
  return db
    .select()
    .from(transactions)
    .where(between(transactions.occurredAt, start, end));
}
