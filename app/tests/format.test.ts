import { describe, it, expect } from "vitest"
import { formatearDuracion, formatearEspera } from "~/lib/format"

describe("formatearDuracion", () => {
  it("formats seconds under a minute", () => {
    expect(formatearDuracion(45)).toBe("0:45")
  })
  it("formats exactly one minute", () => {
    expect(formatearDuracion(60)).toBe("1:00")
  })
  it("formats minutes and seconds", () => {
    expect(formatearDuracion(195)).toBe("3:15")
  })
  it("pads single-digit seconds", () => {
    expect(formatearDuracion(61)).toBe("1:01")
  })
})

describe("formatearEspera", () => {
  it("shows seconds when under a minute", () => {
    expect(formatearEspera(30)).toBe("30s")
  })
  it("shows minutes when 60 or more seconds", () => {
    expect(formatearEspera(60)).toBe("1 min")
  })
  it("rounds down to minutes", () => {
    expect(formatearEspera(150)).toBe("2 min")
  })
})
