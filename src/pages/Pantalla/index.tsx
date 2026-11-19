import { useParams } from "wouter"
import { usePantalla } from "@/features/pantalla/hooks/usePantalla"
import { AccesoLocal } from "@/features/pantalla/components/AccesoLocal"
import { PantallaCola } from "@/features/pantalla/components/PantallaCola"

export default function PantallaPage() {
  const { slug } = useParams<{ slug: string }>()
  const result = usePantalla(slug, window.location.href)

  if (result.estado === "cargando") {
    return (
      <main className="rocola-page grid min-h-dvh place-items-center">
        <span className="text-white/50 text-sm">Cargando…</span>
      </main>
    )
  }

  if (result.estado === "noEncontrado") {
    return (
      <main className="rocola-page grid min-h-dvh place-items-center">
        <p className="text-white text-lg">Este local no existe o no está activo.</p>
      </main>
    )
  }

  const { datos, establecimientoId } = result

  if (datos.vista === "acceso") return <AccesoLocal {...datos} />

  return <PantallaCola {...datos} establecimientoId={establecimientoId} />
}
