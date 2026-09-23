import { describe, expect, it } from "vitest";

import { getCurrentMonthRange, getCurrentWeekRange } from "./period.js";

describe("getCurrentWeekRange", () => {
  it("retorna segunda 00:00 até domingo 23:59:59.999 em America/Sao_Paulo para uma quarta-feira", () => {
    // 2026-09-23 é uma quarta-feira. 15:00 UTC = 12:00 em UTC-3.
    const now = new Date("2026-09-23T15:00:00.000Z");

    const { start, end } = getCurrentWeekRange(now);

    expect(start.toISOString()).toBe("2026-09-21T03:00:00.000Z"); // segunda 00:00 -03:00
    expect(end.toISOString()).toBe("2026-09-28T02:59:59.999Z"); // domingo 23:59:59.999 -03:00
  });

  it("mantém a semana corrente quando 'now' está perto da meia-noite local", () => {
    // 2026-09-21T02:30:00Z = 2026-09-20T23:30 em -03:00 (ainda domingo, semana anterior)
    const now = new Date("2026-09-21T02:30:00.000Z");

    const { start, end } = getCurrentWeekRange(now);

    expect(start.toISOString()).toBe("2026-09-14T03:00:00.000Z");
    expect(end.toISOString()).toBe("2026-09-21T02:59:59.999Z");
  });
});

describe("getCurrentMonthRange", () => {
  it("retorna do dia 1 00:00 até o último dia 23:59:59.999 em America/Sao_Paulo", () => {
    const now = new Date("2026-09-23T15:00:00.000Z");

    const { start, end } = getCurrentMonthRange(now);

    expect(start.toISOString()).toBe("2026-09-01T03:00:00.000Z");
    expect(end.toISOString()).toBe("2026-10-01T02:59:59.999Z");
  });

  it("lida corretamente com fevereiro (mês curto)", () => {
    const now = new Date("2026-02-10T12:00:00.000Z");

    const { start, end } = getCurrentMonthRange(now);

    expect(start.toISOString()).toBe("2026-02-01T03:00:00.000Z");
    expect(end.toISOString()).toBe("2026-03-01T02:59:59.999Z");
  });
});
