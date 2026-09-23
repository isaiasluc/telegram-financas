import { describe, expect, it } from "vitest";

import { findBiggest, sumByCategory, sumTotal } from "./aggregations.js";
import type { Transaction } from "./schema.js";

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: 1,
    amountCents: 1000,
    description: "gasto genérico",
    category: "outros",
    paymentMethod: null,
    occurredAt: new Date("2026-09-23T12:00:00.000Z"),
    rawMessage: "gasto genérico 10,00",
    createdAt: new Date("2026-09-23T12:00:00.000Z"),
    ...overrides,
  };
}

describe("sumTotal", () => {
  it("soma o amountCents de todas as transações", () => {
    const transactions = [
      makeTransaction({ id: 1, amountCents: 1896 }),
      makeTransaction({ id: 2, amountCents: 500 }),
    ];

    expect(sumTotal(transactions)).toBe(2396);
  });

  it("retorna 0 para uma lista vazia", () => {
    expect(sumTotal([])).toBe(0);
  });
});

describe("findBiggest", () => {
  it("retorna a transação de maior valor", () => {
    const biggest = makeTransaction({ id: 2, amountCents: 9999, description: "aluguel" });
    const transactions = [makeTransaction({ id: 1, amountCents: 1896 }), biggest];

    expect(findBiggest(transactions)).toEqual(biggest);
  });

  it("retorna undefined para uma lista vazia", () => {
    expect(findBiggest([])).toBeUndefined();
  });
});

describe("sumByCategory", () => {
  it("soma apenas as transações da categoria informada", () => {
    const transactions = [
      makeTransaction({ id: 1, amountCents: 1000, category: "alimentacao" }),
      makeTransaction({ id: 2, amountCents: 2000, category: "transporte" }),
      makeTransaction({ id: 3, amountCents: 500, category: "alimentacao" }),
    ];

    expect(sumByCategory(transactions, "alimentacao")).toBe(1500);
  });

  it("retorna 0 quando não há transações da categoria no período", () => {
    const transactions = [makeTransaction({ category: "transporte" })];

    expect(sumByCategory(transactions, "saude")).toBe(0);
  });
});
