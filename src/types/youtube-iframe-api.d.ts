export {}

declare global {
  namespace YT {
    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }

    interface PlayerVars {
      autoplay?: 0 | 1
      mute?: 0 | 1
      controls?: 0 | 1
      playsinline?: 0 | 1
      rel?: 0 | 1
      start?: number
    }

    interface PlayerEvent {
      target: Player
    }

    interface OnStateChangeEvent extends PlayerEvent {
      data: PlayerState
    }

    interface OnErrorEvent extends PlayerEvent {
      data: number
    }

    interface PlayerOptions {
      videoId?: string
      playerVars?: PlayerVars
      events?: {
        onReady?: (event: PlayerEvent) => void
        onStateChange?: (event: OnStateChangeEvent) => void
        onError?: (event: OnErrorEvent) => void
      }
    }

    class Player {
      constructor(elementId: string | HTMLElement, options: PlayerOptions)
      mute(): void
      unMute(): void
      isMuted(): boolean
      playVideo(): void
      pauseVideo(): void
      destroy(): void
    }
  }

  interface Window {
    YT?: typeof YT
    onYouTubeIframeAPIReady?: () => void
  }
}
