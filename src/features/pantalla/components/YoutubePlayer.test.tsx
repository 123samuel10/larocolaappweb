import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useYoutubePlayer } from "../hooks/useYoutubePlayer"
import { YoutubePlayer } from "./YoutubePlayer"

vi.mock("../hooks/useYoutubePlayer")

describe("YoutubePlayer", () => {
  it("bloquea los clics sobre el iframe para que no se pueda pausar manualmente", () => {
    vi.mocked(useYoutubePlayer).mockReturnValue({
      containerRef: { current: null },
      isMuted: false,
      unmute: vi.fn(),
    })

    const { getByTestId } = render(<YoutubePlayer youtubeId="abc123" onEnded={vi.fn()} />)

    expect(getByTestId("youtube-contenedor").className).toContain("pointer-events-none")
  })
})
