let promesaApi: Promise<typeof YT> | null = null

/**
 * Carga window.YT de forma perezosa e inyecta el script oficial de YouTube
 * una sola vez, sin importar cuántos players se monten en paralelo.
 */
export function cargarYoutubeIframeApi(): Promise<typeof YT> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  if (!promesaApi) {
    promesaApi = new Promise((resolve) => {
      const callbackPrevio = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        callbackPrevio?.()
        resolve(window.YT as typeof YT)
      }

      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      document.head.appendChild(script)
    })
  }

  return promesaApi
}
