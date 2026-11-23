import { useYoutubePlayer } from "../hooks/useYoutubePlayer"

type YoutubePlayerProps = {
  youtubeId: string
  onEnded: () => void
  startSeconds?: number
}

export function YoutubePlayer({ youtubeId, onEnded, startSeconds }: YoutubePlayerProps) {
  const { containerRef, isMuted, unmute } = useYoutubePlayer({ youtubeId, onEnded, startSeconds })

  return (
    <div className="absolute inset-0 -z-10 size-full overflow-hidden">
      <div ref={containerRef} data-testid="youtube-contenedor" className="pointer-events-none size-full" />
      {isMuted && (
        <button
          type="button"
          onClick={unmute}
          className="absolute inset-0 grid place-items-center bg-black/60 text-lg font-bold text-white"
        >
          Activar sonido
        </button>
      )}
    </div>
  )
}
