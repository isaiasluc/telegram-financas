import { findBiggest, sumByCategory, sumTotal } from "../expense-tracking/aggregations.js";
import type { Transaction } from "../expense-tracking/schema.js";
import type { ExpenseCategory, Period, QuerySpendingIntent } from "../message-intent-parsing/intent.js";
import { formatBrl, formatCategory } from "./format.js";

const PERIOD_LABELS: Record<Period, string> = {
  current_week: "essa semana",
  current_month: "esse mês",
};

const dayMonthFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
});

export function answerSpendingQuery(query: QuerySpendingIntent, transactions: Transaction[]): string {
  switch (query.queryType) {
    case "total_by_period":
      return answerTotalByPeriod(transactions, query.period);
    case "biggest_expense":
      return answerBiggestExpense(transactions, query.period);
    case "total_by_category":
      return answerTotalByCategory(transactions, query.period, query.category);
  }
}

function answerTotalByPeriod(transactions: Transaction[], period: Period): string {
  if (transactions.length === 0) {
    return `Nenhum gasto registrado ${PERIOD_LABELS[period]}.`;
  }

  return `Você gastou ${formatBrl(sumTotal(transactions))} ${PERIOD_LABELS[period]}.`;
}

function answerBiggestExpense(transactions: Transaction[], period: Period): string {
  const biggest = findBiggest(transactions);
  if (!biggest) {
    return `Nenhum gasto registrado ${PERIOD_LABELS[period]}.`;
  }

  const date = dayMonthFormat.format(biggest.occurredAt);
  return `Seu maior gasto ${PERIOD_LABELS[period]} foi ${formatBrl(biggest.amountCents)} — ${biggest.description} (${date}).`;
}

function answerTotalByCategory(transactions: Transaction[], period: Period, category: ExpenseCategory): string {
  const hasCategory = transactions.some((transaction) => transaction.category === category);
  if (!hasCategory) {
    return `Nenhum gasto com ${formatCategory(category)} registrado ${PERIOD_LABELS[period]}.`;
  }

  return `Você gastou ${formatBrl(sumByCategory(transactions, category))} com ${formatCategory(category)} ${PERIOD_LABELS[period]}.`;
}
