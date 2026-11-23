import { act, render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useYoutubePlayer } from "./useYoutubePlayer"

type EventosCapturados = {
  onStateChange?: (event: YT.OnStateChangeEvent) => void
}

let eventosCapturados: EventosCapturados
let playerInstance: {
  unMute: ReturnType<typeof vi.fn>
  playVideo: ReturnType<typeof vi.fn>
  destroy: ReturnType<typeof vi.fn>
}

function Host({
  youtubeId,
  onEnded,
  startSeconds,
}: {
  youtubeId: string
  onEnded: () => void
  startSeconds?: number
}) {
  const { containerRef, isMuted, unmute } = useYoutubePlayer({ youtubeId, onEnded, startSeconds })
  return (
    <div>
      <div ref={containerRef} data-testid="contenedor" />
      <span data-testid="muted">{String(isMuted)}</span>
      <button type="button" onClick={unmute}>
        activar sonido
      </button>
    </div>
  )
}

describe("useYoutubePlayer", () => {
  beforeEach(() => {
    eventosCapturados = {}
    playerInstance = { unMute: vi.fn(), playVideo: vi.fn(), destroy: vi.fn() }

    const PlayerMock = vi.fn().mockImplementation((_el: HTMLElement, options: YT.PlayerOptions) => {
      eventosCapturados = options.events ?? {}
      return playerInstance
    })

    window.YT = {
      Player: PlayerMock,
      PlayerState: {
        UNSTARTED: -1,
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3,
        CUED: 5,
      },
    } as unknown as typeof YT
  })

  it("arranca en estado muted y unmute() lo cambia a false llamando al player", async () => {
    const { getByTestId, getByRole } = render(<Host youtubeId="abc123" onEnded={vi.fn()} />)

    expect(getByTestId("muted").textContent).toBe("true")
    await waitFor(() => expect(window.YT!.Player).toHaveBeenCalled())

    act(() => {
      getByRole("button").click()
    })

    expect(playerInstance.unMute).toHaveBeenCalledTimes(1)
    expect(playerInstance.playVideo).toHaveBeenCalledTimes(1)
    expect(getByTestId("muted").textContent).toBe("false")
  })

  it("invoca onEnded cuando el player reporta PlayerState.ENDED", async () => {
    const onEnded = vi.fn()
    render(<Host youtubeId="abc123" onEnded={onEnded} />)

    await waitFor(() => expect(eventosCapturados.onStateChange).toBeDefined())

    act(() => {
      eventosCapturados.onStateChange?.({
        data: window.YT!.PlayerState.ENDED,
        target: playerInstance as unknown as YT.Player,
      })
    })

    expect(onEnded).toHaveBeenCalledTimes(1)
  })

  it("deshabilita los controles nativos para que no se pueda pausar manualmente", async () => {
    render(<Host youtubeId="abc123" onEnded={vi.fn()} />)

    await waitFor(() => expect(window.YT!.Player).toHaveBeenCalled())

    const [, opciones] = vi.mocked(window.YT!.Player).mock.calls[0]
    expect(opciones.playerVars?.controls).toBe(0)
  })

  it("arranca el video en el segundo indicado por startSeconds, redondeando hacia abajo", async () => {
    render(<Host youtubeId="abc123" onEnded={vi.fn()} startSeconds={183.9} />)

    await waitFor(() => expect(window.YT!.Player).toHaveBeenCalled())

    const [, opciones] = vi.mocked(window.YT!.Player).mock.calls[0]
    expect(opciones.playerVars?.start).toBe(183)
  })

  it("no invoca onEnded para otros estados del player", async () => {
    const onEnded = vi.fn()
    render(<Host youtubeId="abc123" onEnded={onEnded} />)

    await waitFor(() => expect(eventosCapturados.onStateChange).toBeDefined())

    act(() => {
      eventosCapturados.onStateChange?.({
        data: window.YT!.PlayerState.PLAYING,
        target: playerInstance as unknown as YT.Player,
      })
    })

    expect(onEnded).not.toHaveBeenCalled()
  })
})
