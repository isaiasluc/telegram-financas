import { z } from "zod";

import { expenseCategory } from "../expense-tracking/schema.js";

export const EXPENSE_CATEGORIES = expenseCategory.enumValues;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const QUERY_TYPES = ["total_by_period", "biggest_expense", "total_by_category"] as const;
export type QueryType = (typeof QUERY_TYPES)[number];

export const PERIODS = ["current_week", "current_month"] as const;
export type Period = (typeof PERIODS)[number];

// Schema plano (campos nulos em vez de união discriminada) porque é o formato que o
// structured output da Anthropic garante com mais robustez; a união tipada é montada
// depois em `toIntent`.
export const llmIntentSchema = z.object({
  intent: z.enum(["register_expense", "query_spending", "unknown"]),
  amount_cents: z
    .number()
    .int()
    .nullable()
    .describe("Valor do gasto em centavos inteiros (ex: 18,96 → 1896). null se não houver valor claro."),
  description: z.string().nullable().describe("Descrição curta do gasto. null se não for registro."),
  category: z.enum(EXPENSE_CATEGORIES).nullable(),
  payment_method: z
    .string()
    .nullable()
    .describe("Forma de pagamento se mencionada (ex: pix, crédito, débito, dinheiro). null caso contrário."),
  query_type: z.enum(QUERY_TYPES).nullable(),
  period: z.enum(PERIODS).nullable(),
});

export type LlmIntent = z.infer<typeof llmIntentSchema>;

export type RegisterExpenseIntent = {
  intent: "register_expense";
  amountCents: number;
  description: string;
  category: ExpenseCategory;
  paymentMethod: string | null;
};

export type QuerySpendingIntent =
  | { intent: "query_spending"; queryType: "total_by_period" | "biggest_expense"; period: Period }
  | { intent: "query_spending"; queryType: "total_by_category"; period: Period; category: ExpenseCategory };

export type UnknownIntent = { intent: "unknown" };

export type ParsedIntent = RegisterExpenseIntent | QuerySpendingIntent | UnknownIntent;

const UNKNOWN: UnknownIntent = { intent: "unknown" };

export function toIntent(llmIntent: LlmIntent): ParsedIntent {
  switch (llmIntent.intent) {
    case "register_expense":
      return toRegisterExpenseIntent(llmIntent);
    case "query_spending":
      return toQuerySpendingIntent(llmIntent);
    case "unknown":
      return UNKNOWN;
  }
}

function toRegisterExpenseIntent(llmIntent: LlmIntent): ParsedIntent {
  const description = llmIntent.description?.trim();
  if (llmIntent.amount_cents === null || llmIntent.amount_cents <= 0 || !description) {
    return UNKNOWN;
  }

  return {
    intent: "register_expense",
    amountCents: llmIntent.amount_cents,
    description,
    category: llmIntent.category ?? "outros",
    paymentMethod: llmIntent.payment_method?.trim() || null,
  };
}

function toQuerySpendingIntent(llmIntent: LlmIntent): ParsedIntent {
  const { query_type: queryType, period, category } = llmIntent;
  if (queryType === null || period === null) {
    return UNKNOWN;
  }

  if (queryType === "total_by_category") {
    return category === null ? UNKNOWN : { intent: "query_spending", queryType, period, category };
  }

  return { intent: "query_spending", queryType, period };
}
