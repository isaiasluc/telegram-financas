import { describe, expect, it } from "vitest";

import type { Transaction } from "../expense-tracking/schema.js";
import { answerSpendingQuery } from "./spending-answer.js";

function transaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: 1,
    amountCents: 1000,
    description: "gasto",
    category: "outros",
    paymentMethod: null,
    occurredAt: new Date("2026-09-23T15:00:00.000Z"),
    rawMessage: "gasto 10",
    createdAt: new Date("2026-09-23T15:00:00.000Z"),
    ...overrides,
  };
}

const transactions = [
  transaction({ id: 1, amountCents: 1896, description: "almoço", category: "alimentacao" }),
  transaction({
    id: 2,
    amountCents: 180000,
    description: "aluguel",
    category: "moradia",
    // 02:00 UTC do dia 5 ainda é dia 4 em -03:00.
    occurredAt: new Date("2026-09-05T02:00:00.000Z"),
  }),
  transaction({ id: 3, amountCents: 2350, description: "uber", category: "transporte" }),
  transaction({ id: 4, amountCents: 4200, description: "mercado", category: "alimentacao" }),
];

describe("answerSpendingQuery — total_by_period", () => {
  it("responde com o total do período", () => {
    const answer = answerSpendingQuery({ intent: "query_spending", queryType: "total_by_period", period: "current_week" }, transactions);

    expect(answer).toBe("Você gastou R$ 1.884,46 essa semana.");
  });

  it("informa quando não há gastos no período", () => {
    const answer = answerSpendingQuery({ intent: "query_spending", queryType: "total_by_period", period: "current_month" }, []);

    expect(answer).toBe("Nenhum gasto registrado esse mês.");
  });
});

describe("answerSpendingQuery — biggest_expense", () => {
  it("responde com valor, descrição e data local do maior gasto", () => {
    const answer = answerSpendingQuery({ intent: "query_spending", queryType: "biggest_expense", period: "current_month" }, transactions);

    expect(answer).toBe("Seu maior gasto esse mês foi R$ 1.800,00 — aluguel (04/09).");
  });

  it("informa quando não há gastos no período", () => {
    const answer = answerSpendingQuery({ intent: "query_spending", queryType: "biggest_expense", period: "current_week" }, []);

    expect(answer).toBe("Nenhum gasto registrado essa semana.");
  });
});

describe("answerSpendingQuery — total_by_category", () => {
  it("responde com o total da categoria no período", () => {
    const answer = answerSpendingQuery(
      { intent: "query_spending", queryType: "total_by_category", period: "current_month", category: "alimentacao" },
      transactions,
    );

    expect(answer).toBe("Você gastou R$ 60,96 com Alimentação esse mês.");
  });

  it("informa quando não há gastos da categoria, mesmo havendo outros no período", () => {
    const answer = answerSpendingQuery(
      { intent: "query_spending", queryType: "total_by_category", period: "current_month", category: "saude" },
      transactions,
    );

    expect(answer).toBe("Nenhum gasto com Saúde registrado esse mês.");
  });
});
