import { beforeEach, describe, expect, it, vi } from "vitest"
import { obtenerSolicitudesPorHora } from "./estadisticas"

const { fetchSimulado } = vi.hoisted(() => ({ fetchSimulado: vi.fn<typeof fetch>() }))

vi.mock("@/shared/supabase/client", async () => {
  const { createClient } = await import("@supabase/supabase-js")
  return {
    supabase: createClient("https://larocola.example", "test-key", {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: fetchSimulado },
    }),
  }
})

describe("obtenerSolicitudesPorHora", () => {
  beforeEach(() => fetchSimulado.mockReset())

  it("agrupa solicitudes por hora local al cruzar medianoche y lee páginas adicionales", async () => {
    const pagina = Array.from({ length: 500 }, (_, i) => ({
      id: String(i).padStart(3, "0"),
      created_at: "2026-11-27T04:59:59Z",
    }))
    fetchSimulado
      .mockResolvedValueOnce(Response.json(pagina))
      .mockResolvedValueOnce(Response.json([{ id: "500", created_at: "2026-11-27T05:00:00Z" }]))

    await expect(obtenerSolicitudesPorHora("sesion-1", "America/Bogota")).resolves.toEqual({
      total: 501,
      franjas: [{ hora: 0, cantidad: 1 }, { hora: 23, cantidad: 500 }],
    })

    const url = new URL(String(fetchSimulado.mock.calls[1][0]))
    expect(url.pathname).toBe("/rest/v1/solicitud")
    expect(url.searchParams.get("sesion_id")).toBe("eq.sesion-1")
    expect(url.searchParams.get("id")).toBe("gt.499")
  })

  it("devuelve cero solicitudes para una sesión vacía", async () => {
    fetchSimulado.mockResolvedValueOnce(Response.json([]))

    await expect(obtenerSolicitudesPorHora("sesion-vacia", "America/Bogota")).resolves.toEqual({
      total: 0,
      franjas: [],
    })
  })
})
