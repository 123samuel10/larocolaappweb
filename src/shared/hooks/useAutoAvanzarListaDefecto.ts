import { useEffect } from "react"
import { supabase } from "@/shared/supabase/client"

/**
 * Avisa al servidor cuando la canción actual de la lista por defecto debería
 * haber terminado (o cuando todavía no arrancó ninguna), para que la avance.
 * Solo debe estar activo cuando la cola en vivo está vacía: el servidor igual
 * se protege solo y no hace nada si hay una solicitud en vivo activa.
 */
export function useAutoAvanzarListaDefecto(
  establecimientoId: string | null | undefined,
  activo: boolean,
  inicioReproduccion: string | null | undefined,
  duracionSeg: number | undefined,
) {
  const avanzarAhora = () => {
    if (!establecimientoId) return
    supabase.functions.invoke("avanzar-lista-defecto-automatico", {
      body: { establecimiento_id: establecimientoId },
    })
  }

  useEffect(() => {
    if (!establecimientoId || !activo) return

    if (!inicioReproduccion || !duracionSeg) {
      // No hay ninguna canción de la lista por defecto arrancada todavía: pedí que arranque ya.
      avanzarAhora()
      const intervalId = setInterval(avanzarAhora, 15000)
      return () => clearInterval(intervalId)
    }

    const finMs = new Date(inicioReproduccion).getTime() + duracionSeg * 1000
    const restanteMs = finMs - Date.now()

    const timeoutId = setTimeout(avanzarAhora, Math.max(0, restanteMs) + 500)
    // Red de seguridad por si el timeout no dispara a tiempo (pestaña en segundo plano).
    const intervalId = setInterval(avanzarAhora, 15000)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [establecimientoId, activo, inicioReproduccion, duracionSeg])

  // Permite disparar el avance de inmediato ante un evento real (fin de video),
  // en vez de esperar el timer de arriba, que sigue activo como red de seguridad.
  return avanzarAhora
}
