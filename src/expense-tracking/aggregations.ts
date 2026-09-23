import type { Transaction } from "./schema.js";

export function sumTotal(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => total + transaction.amountCents, 0);
}

export function findBiggest(transactions: Transaction[]): Transaction | undefined {
  return transactions.reduce<Transaction | undefined>((biggest, transaction) => {
    if (!biggest || transaction.amountCents > biggest.amountCents) {
      return transaction;
    }
    return biggest;
  }, undefined);
}

export function sumByCategory(transactions: Transaction[], category: Transaction["category"]): number {
  return sumTotal(transactions.filter((transaction) => transaction.category === category));
}
