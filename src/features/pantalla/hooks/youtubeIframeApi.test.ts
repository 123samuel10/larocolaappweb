import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("cargarYoutubeIframeApi", () => {
  beforeEach(() => {
    vi.resetModules()
    delete (window as { YT?: unknown }).YT
    delete (window as { onYouTubeIframeAPIReady?: unknown }).onYouTubeIframeAPIReady
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("inyecta el script de YouTube una sola vez aunque se pida varias veces", async () => {
    const appendChildSpy = vi.spyOn(document.head, "appendChild")
    const { cargarYoutubeIframeApi } = await import("./youtubeIframeApi")

    const promesa1 = cargarYoutubeIframeApi()
    const promesa2 = cargarYoutubeIframeApi()

    window.YT = { Player: vi.fn() } as unknown as typeof YT
    window.onYouTubeIframeAPIReady?.()

    const [api1, api2] = await Promise.all([promesa1, promesa2])

    const scriptsInyectados = appendChildSpy.mock.calls.filter(
      ([nodo]) => nodo instanceof HTMLScriptElement && nodo.src.includes("youtube.com/iframe_api"),
    )
    expect(scriptsInyectados).toHaveLength(1)
    expect(api1).toBe(window.YT)
    expect(api2).toBe(window.YT)
  })

  it("resuelve de inmediato sin inyectar script si window.YT ya existe", async () => {
    window.YT = { Player: vi.fn() } as unknown as typeof YT
    const appendChildSpy = vi.spyOn(document.head, "appendChild")
    const { cargarYoutubeIframeApi } = await import("./youtubeIframeApi")

    const resultado = await cargarYoutubeIframeApi()

    expect(resultado).toBe(window.YT)
    expect(appendChildSpy).not.toHaveBeenCalled()
  })
})
