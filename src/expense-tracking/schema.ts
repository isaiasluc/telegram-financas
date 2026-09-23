import { integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const expenseCategory = pgEnum("expense_category", [
  "alimentacao",
  "transporte",
  "lazer",
  "saude",
  "moradia",
  "outros",
]);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amountCents: integer("amount_cents").notNull(),
  description: text("description").notNull(),
  category: expenseCategory("category").notNull(),
  paymentMethod: text("payment_method"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  rawMessage: text("raw_message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
