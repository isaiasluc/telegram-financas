import { describe, expect, it } from "vitest";

import { llmIntentSchema, toIntent, type LlmIntent } from "./intent.js";

function makeLlmIntent(overrides: Partial<LlmIntent>): LlmIntent {
  return {
    intent: "unknown",
    amount_cents: null,
    description: null,
    category: null,
    payment_method: null,
    query_type: null,
    period: null,
    ...overrides,
  };
}

describe("llmIntentSchema", () => {
  it("rejeita valor em centavos não inteiro", () => {
    const result = llmIntentSchema.safeParse(
      makeLlmIntent({ intent: "register_expense", amount_cents: 18.96, description: "almoço" }),
    );

    expect(result.success).toBe(false);
  });

  it("rejeita categoria fora da lista fixa", () => {
    const result = llmIntentSchema.safeParse({ ...makeLlmIntent({}), category: "educacao" });

    expect(result.success).toBe(false);
  });
});

describe("toIntent — register_expense", () => {
  it("monta o gasto com valor, descrição, categoria e forma de pagamento", () => {
    const intent = toIntent(
      makeLlmIntent({
        intent: "register_expense",
        amount_cents: 1896,
        description: "Almoço na Churrascaria do Arnaldo",
        category: "alimentacao",
        payment_method: "pix",
      }),
    );

    expect(intent).toEqual({
      intent: "register_expense",
      amountCents: 1896,
      description: "Almoço na Churrascaria do Arnaldo",
      category: "alimentacao",
      paymentMethod: "pix",
    });
  });

  it("usa `outros` quando o LLM não sugere categoria", () => {
    const intent = toIntent(
      makeLlmIntent({ intent: "register_expense", amount_cents: 500, description: "coisa" }),
    );

    expect(intent).toMatchObject({ intent: "register_expense", category: "outros" });
  });

  it("cai em unknown quando o valor está ausente", () => {
    const intent = toIntent(
      makeLlmIntent({ intent: "register_expense", amount_cents: null, description: "remédio" }),
    );

    expect(intent).toEqual({ intent: "unknown" });
  });

  it("cai em unknown quando o valor não é positivo", () => {
    const intent = toIntent(
      makeLlmIntent({ intent: "register_expense", amount_cents: 0, description: "remédio" }),
    );

    expect(intent).toEqual({ intent: "unknown" });
  });

  it("cai em unknown quando a descrição está vazia", () => {
    const intent = toIntent(
      makeLlmIntent({ intent: "register_expense", amount_cents: 1896, description: "   " }),
    );

    expect(intent).toEqual({ intent: "unknown" });
  });
});

describe("toIntent — query_spending", () => {
  it("monta consulta de total por período", () => {
    const intent = toIntent(
      makeLlmIntent({ intent: "query_spending", query_type: "total_by_period", period: "current_week" }),
    );

    expect(intent).toEqual({ intent: "query_spending", queryType: "total_by_period", period: "current_week" });
  });

  it("monta consulta de maior gasto", () => {
    const intent = toIntent(
      makeLlmIntent({ intent: "query_spending", query_type: "biggest_expense", period: "current_month" }),
    );

    expect(intent).toEqual({ intent: "query_spending", queryType: "biggest_expense", period: "current_month" });
  });

  it("monta consulta por categoria com a categoria informada", () => {
    const intent = toIntent(
      makeLlmIntent({
        intent: "query_spending",
        query_type: "total_by_category",
        period: "current_month",
        category: "alimentacao",
      }),
    );

    expect(intent).toEqual({
      intent: "query_spending",
      queryType: "total_by_category",
      period: "current_month",
      category: "alimentacao",
    });
  });

  it("cai em unknown quando consulta por categoria vem sem categoria", () => {
    const intent = toIntent(
      makeLlmIntent({ intent: "query_spending", query_type: "total_by_category", period: "current_month" }),
    );

    expect(intent).toEqual({ intent: "unknown" });
  });

  it("cai em unknown quando falta o tipo de consulta ou o período", () => {
    expect(toIntent(makeLlmIntent({ intent: "query_spending", period: "current_week" }))).toEqual({
      intent: "unknown",
    });
    expect(toIntent(makeLlmIntent({ intent: "query_spending", query_type: "biggest_expense" }))).toEqual({
      intent: "unknown",
    });
  });
});

describe("toIntent — unknown", () => {
  it("mantém unknown", () => {
    expect(toIntent(makeLlmIntent({ intent: "unknown" }))).toEqual({ intent: "unknown" });
  });
});
