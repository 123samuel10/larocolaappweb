import { useEffect } from "react"
import { supabase } from "@/shared/supabase/client"

/**
 * Avisa al servidor cuando la canción actual debería haber terminado, para
 * que avance la cola. Es seguro llamarlo de más o antes de tiempo: el
 * servidor solo actúa si `inicio_reproduccion + duracionSeg` ya pasó de verdad.
 */
export function useAutoAvanzarCola(
  establecimientoId: string | null | undefined,
  inicioReproduccion: string | null | undefined,
  duracionSeg: number | undefined,
) {
  const avanzarAhora = () => {
    if (!establecimientoId) return
    supabase.functions.invoke("avanzar-cola-automatico", {
      body: { establecimiento_id: establecimientoId },
    })
  }

  useEffect(() => {
    if (!establecimientoId || !inicioReproduccion || !duracionSeg) return

    const finMs = new Date(inicioReproduccion).getTime() + duracionSeg * 1000
    const restanteMs = finMs - Date.now()

    const timeoutId = setTimeout(avanzarAhora, Math.max(0, restanteMs) + 500)
    // Red de seguridad por si el timeout no dispara a tiempo (pestaña en segundo plano).
    const intervalId = setInterval(avanzarAhora, 15000)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [establecimientoId, inicioReproduccion, duracionSeg])

  // Permite disparar el avance de inmediato ante un evento real (fin de video),
  // en vez de esperar el timer de arriba, que sigue activo como red de seguridad.
  return avanzarAhora
}
