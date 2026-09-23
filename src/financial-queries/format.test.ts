import { describe, expect, it } from "vitest";

import { formatBrl, formatCategory } from "./format.js";

describe("formatBrl", () => {
  it("formata centavos em reais com vírgula decimal", () => {
    expect(formatBrl(1896)).toBe("R$ 18,96");
  });

  it("completa com zeros valores menores que um real", () => {
    expect(formatBrl(5)).toBe("R$ 0,05");
    expect(formatBrl(0)).toBe("R$ 0,00");
  });

  it("separa milhares com ponto", () => {
    expect(formatBrl(180000)).toBe("R$ 1.800,00");
    expect(formatBrl(123456789)).toBe("R$ 1.234.567,89");
  });
});

describe("formatCategory", () => {
  it("usa o rótulo acentuado da categoria", () => {
    expect(formatCategory("alimentacao")).toBe("Alimentação");
    expect(formatCategory("saude")).toBe("Saúde");
  });
});
