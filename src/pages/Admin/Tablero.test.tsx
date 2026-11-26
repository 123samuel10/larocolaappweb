import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import Tablero from "./Tablero"

const invocar = vi.hoisted(() => vi.fn())
vi.mock("@/shared/supabase/client", () => ({ supabase: { functions: { invoke: invocar } } }))
vi.mock("@/store/useAuth", () => ({ useAuth: () => ({ admin: { establecimientoId: "local" } }) }))
vi.mock("recharts", () => ({
  Bar: () => null,
  BarChart: () => null,
  CartesianGrid: () => null,
  Legend: () => null,
  ResponsiveContainer: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

const corte = { version: "lote-1", publicado_en: "2026-11-26T16:10:00Z", corte_fuente: "2026-11-26T16:09:00Z" }
const sesion = {
  noche: "2026-11-25",
  sesion_id: "sesion-1",
  row_key: "sesion-1",
  metricas: {
    estado: "cerrada",
    abierta_en: "2026-11-25T23:00:00Z",
    zona_horaria: "America/Bogota",
    dia_semana: 3,
    solicitudes: 31,
    votos_vigentes: 12,
    dispositivos_unicos: 8,
    cancion_mas_votada_id: "cancion-1",
  },
}

function simularFuncion(datos: Record<string, unknown>) {
  invocar.mockImplementation(async (_nombre: string, { body }: { body: { p_kind: string } }) => ({
    data: datos[body.p_kind], error: null,
  }))
}

function mostrarTablero() {
  const queryClient = new QueryClient()
  return render(<QueryClientProvider client={queryClient}><Tablero /></QueryClientProvider>)
}

describe("Tablero de analítica", () => {
  afterEach(() => {
    cleanup()
    invocar.mockReset()
  })

  it("muestra la espera de la primera publicación sin inventar métricas", async () => {
    simularFuncion({ session: { version: null, publicado_en: null, corte_fuente: null, filas: [] } })
    mostrarTablero()

    expect(await screen.findByText("A la espera de la primera publicación")).toBeTruthy()
    expect(screen.queryByText("Dispositivos únicos")).toBeNull()
    expect(invocar).toHaveBeenCalledTimes(1)
  })

  it("muestra los indicadores, las vistas y envía el rango de noches a Supabase", async () => {
    simularFuncion({
      session: { ...corte, filas: [sesion] },
      song: { ...corte, filas: [{
        noche: sesion.noche, sesion_id: sesion.sesion_id, row_key: "cancion-1",
        metricas: { cancion_id: "cancion-1", titulo: "La canción", artista: "El artista", solicitudes: 31, votos_vigentes: 12, cuota_votos: 1 },
      }] },
      hour: { ...corte, filas: [{
        noche: sesion.noche, sesion_id: sesion.sesion_id, row_key: "2026-11-26T00:00",
        metricas: { franja_local: "2026-11-26T00:00:00", solicitudes: 0, altas_de_votos_aun_vigentes: 0 },
      }] },
    })
    mostrarTablero()

    expect(await screen.findByText("Dispositivos únicos")).toBeTruthy()
    expect(screen.getAllByText("La canción")).toHaveLength(3)
    expect(screen.getByText("Última publicación")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Diagnóstica" }))
    expect(screen.getByText("Concentración de votos")).toBeTruthy()
    expect(screen.getByText("26/11 · 00:00")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Comparativa" }))
    expect(screen.getByRole("table")).toBeTruthy()

    fireEvent.change(screen.getByLabelText("Noche desde"), { target: { value: "2026-11-22" } })
    await waitFor(() => expect(invocar).toHaveBeenCalledWith("leer-analitica", expect.objectContaining({
      body: expect.objectContaining({ p_kind: "hour", p_sesion_id: "sesion-1", p_desde: "2026-11-22" }),
    })))
  })

  it("rechaza resultados de distinto lote y vuelve a consultar", async () => {
    let primeraConsulta = true
    invocar.mockImplementation(async (_nombre: string, { body }: { body: { p_kind: string } }) => {
      if (body.p_kind === "session") return { data: { ...corte, filas: [sesion] }, error: null }
      if (body.p_kind === "song" && primeraConsulta) {
        primeraConsulta = false
        return { data: { ...corte, version: "otro-lote", filas: [] }, error: null }
      }
      return { data: { ...corte, filas: [] }, error: null }
    })
    mostrarTablero()

    expect(await screen.findByText("Participación por hora local", undefined, { timeout: 3000 })).toBeTruthy()
    expect(invocar.mock.calls.filter(([, params]) => params.body.p_kind === "session")).toHaveLength(2)
  })
})
