import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/store/useAuth"
import { obtenerSesionActiva } from "@/db/admin/sesion"

export function useSesionActiva() {
  const { admin } = useAuth()
  const establecimientoId = admin?.establecimientoId ?? null
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["admin", "sesion-activa", establecimientoId],
    queryFn: () => obtenerSesionActiva(establecimientoId!),
    enabled: !!establecimientoId,
  })

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "sesion-activa", establecimientoId] })

  return {
    establecimientoId,
    sesion: query.data ?? null,
    isLoading: query.isLoading,
    invalidar,
  }
}
