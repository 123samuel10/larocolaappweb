import { useCallback, useEffect, useRef, useState } from "react"
import { cargarYoutubeIframeApi } from "./youtubeIframeApi"

type UseYoutubePlayerParams = {
  youtubeId: string | undefined
  onEnded?: () => void
  startSeconds?: number
  pausado?: boolean
}

export function useYoutubePlayer({ youtubeId, onEnded, startSeconds, pausado }: UseYoutubePlayerParams) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const isReadyRef = useRef(false)
  const [isMuted, setIsMuted] = useState(true)
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded
  const startSecondsRef = useRef(startSeconds)
  startSecondsRef.current = startSeconds
  const pausadoRef = useRef(pausado)
  pausadoRef.current = pausado

  useEffect(() => {
    if (!youtubeId || !containerRef.current) return

    let activo = true
    setIsMuted(true)
    isReadyRef.current = false

    cargarYoutubeIframeApi().then((api) => {
      if (!activo || !containerRef.current) return

      playerRef.current = new api.Player(containerRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: pausadoRef.current ? 0 : 1,
          mute: 1,
          controls: 0,
          playsinline: 1,
          rel: 0,
          start: Math.max(0, Math.floor(startSecondsRef.current ?? 0)),
        },
        events: {
          // La API no adjunta métodos como pauseVideo()/playVideo() hasta este evento;
          // llamarlos antes revienta con "no es una función". Si pausado ya cambió
          // mientras esperábamos, aplicalo recién acá.
          onReady: () => {
            isReadyRef.current = true
            if (pausadoRef.current) playerRef.current?.pauseVideo()
          },
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

  useEffect(() => {
    if (!playerRef.current || !isReadyRef.current) return
    if (pausado) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }, [pausado])

  const unmute = useCallback(() => {
    if (!playerRef.current || !isReadyRef.current) return
    playerRef.current.unMute()
    if (!pausadoRef.current) playerRef.current.playVideo()
    setIsMuted(false)
  }, [])

  return { containerRef, isMuted, unmute }
}
