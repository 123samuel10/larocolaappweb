import { useCallback, useEffect, useRef, useState } from "react"
import { cargarYoutubeIframeApi } from "./youtubeIframeApi"

type UseYoutubePlayerParams = {
  youtubeId: string | undefined
  onEnded?: () => void
  startSeconds?: number
}

export function useYoutubePlayer({ youtubeId, onEnded, startSeconds }: UseYoutubePlayerParams) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded
  const startSecondsRef = useRef(startSeconds)
  startSecondsRef.current = startSeconds

  useEffect(() => {
    if (!youtubeId || !containerRef.current) return

    let activo = true
    setIsMuted(true)

    cargarYoutubeIframeApi().then((api) => {
      if (!activo || !containerRef.current) return

      playerRef.current = new api.Player(containerRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          playsinline: 1,
          rel: 0,
          start: Math.max(0, Math.floor(startSecondsRef.current ?? 0)),
        },
        events: {
          onStateChange: (event) => {
            if (event.data === api.PlayerState.ENDED) onEndedRef.current?.()
          },
        },
      })
    })

    return () => {
      activo = false
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [youtubeId])

  const unmute = useCallback(() => {
    playerRef.current?.unMute()
    playerRef.current?.playVideo()
    setIsMuted(false)
  }, [])

  return { containerRef, isMuted, unmute }
}
