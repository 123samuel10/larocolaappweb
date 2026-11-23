import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/shared/supabase/client"

export function useColaEnVivo(establecimientoId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel("pantalla-cola")
      .on("postgres_changes", { event: "*", schema: "public", table: "solicitud" }, () => {
        queryClient.invalidateQueries({ queryKey: ["cola", establecimientoId] })
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "voto" }, () => {
        queryClient.invalidateQueries({ queryKey: ["cola", establecimientoId] })
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "lista_defecto_item" }, () => {
        queryClient.invalidateQueries({ queryKey: ["defecto-actual", establecimientoId] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, establecimientoId])
}
