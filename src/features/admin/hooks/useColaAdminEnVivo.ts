import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/shared/supabase/client"

export function useColaAdminEnVivo(sesionId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!sesionId) return

    const channel = supabase
      .channel(`admin-cola-${sesionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "solicitud" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "cola", sesionId] })
        queryClient.invalidateQueries({ queryKey: ["admin", "resumen", sesionId] })
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "voto" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "cola", sesionId] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, sesionId])
}
