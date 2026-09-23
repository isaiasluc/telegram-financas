import type { Transaction } from "../expense-tracking/schema.js";

const CATEGORY_LABELS: Record<Transaction["category"], string> = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  lazer: "Lazer",
  saude: "Saúde",
  moradia: "Moradia",
  outros: "Outros",
};

// Formatação por string em vez de Intl/divisão para nunca passar o valor por float.
export function formatBrl(amountCents: number): string {
  const digits = String(amountCents).padStart(3, "0");
  const reais = digits.slice(0, -2).replace(/\B(?=(\d{3})+$)/g, ".");
  const cents = digits.slice(-2);
  return `R$ ${reais},${cents}`;
}

export function formatCategory(category: Transaction["category"]): string {
  return CATEGORY_LABELS[category];
}
