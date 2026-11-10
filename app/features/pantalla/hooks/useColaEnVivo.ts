import { useEffect } from "react"
import { useRevalidator } from "react-router"
import { supabase } from "~/shared/supabase/client"

export function useColaEnVivo() {
  const { revalidate } = useRevalidator()

  useEffect(() => {
    const channel = supabase
      .channel("pantalla-cola")
      .on("postgres_changes", { event: "*", schema: "public", table: "solicitud" }, () =>
        revalidate()
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "voto" }, () =>
        revalidate()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [revalidate])
}
