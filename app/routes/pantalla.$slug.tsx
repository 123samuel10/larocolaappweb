import type { Route } from "./+types/pantalla.$slug"
import { useLoaderData, useRevalidator } from "react-router"
import { useEffect } from "react"
import { supabase } from "~/lib/supabase"
import { formatearDuracion } from "~/lib/format"

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData?.nombre ? `${loaderData.nombre} — Cola` : "La Rocola" },
]

type ItemCola = {
  solicitudId: string
  titulo: string
  artista: string
  miniaturaUrl: string
  duracionSeg: number
  estado: string
  votos: number
}

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug

  const { data: est } = await supabase
    .from("establecimiento")
    .select("id, nombre")
    .eq("slug", slug)
    .eq("activo", true)
    .single()

  if (!est) throw new Response("Not Found", { status: 404 })

  const { data: sesion } = await supabase
    .from("sesion")
    .select("id")
    .eq("establecimiento_id", est.id)
    .eq("estado", "activa")
    .maybeSingle()

  if (!sesion) return { nombre: est.nombre as string, cola: [] as ItemCola[], sesionActiva: false }

  const { data: solicitudes } = await supabase
    .from("solicitud")
    .select(`
      id,
      estado,
      cancion!inner(titulo, artista, miniatura_url, duracion_seg),
      voto(id)
    `)
    .eq("sesion_id", sesion.id)
    .in("estado", ["pendiente", "reproduciendo"])

  const cola: ItemCola[] = (solicitudes ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((s: any) => ({
      solicitudId: s.id as string,
      titulo: s.cancion.titulo as string,
      artista: s.cancion.artista as string,
      miniaturaUrl: s.cancion.miniatura_url as string,
      duracionSeg: s.cancion.duracion_seg as number,
      estado: s.estado as string,
      votos: (s.voto as { id: string }[]).length,
    }))
    .sort((a: ItemCola, b: ItemCola) => {
      if (a.estado === "reproduciendo") return -1
      if (b.estado === "reproduciendo") return 1
      return b.votos - a.votos
    })

  return { nombre: est.nombre as string, cola, sesionActiva: true }
}

export default function PantallaEstablecimiento() {
  const { nombre, cola, sesionActiva } = useLoaderData<typeof loader>()
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

  const reproduciendo = cola.find((i) => i.estado === "reproduciendo")
  const enCola = cola.filter((i) => i.estado === "pendiente")

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-widest">La Rocola</p>
            <h1 className="text-2xl font-bold">{nombre}</h1>
          </div>
          <div
            className={`text-sm px-3 py-1 rounded-full ${
              sesionActiva ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"
            }`}
          >
            {sesionActiva ? "Sesión activa" : "Sin sesión"}
          </div>
        </header>

        {reproduciendo && (
          <section>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Reproduciendo</p>
            <div className="flex items-center gap-4 bg-blue-900/30 border border-blue-700/40 rounded-2xl p-4">
              <img
                src={reproduciendo.miniaturaUrl}
                alt={reproduciendo.titulo}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold truncate">{reproduciendo.titulo}</p>
                <p className="text-gray-400 truncate">{reproduciendo.artista}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatearDuracion(reproduciendo.duracionSeg)}
                </p>
              </div>
            </div>
          </section>
        )}

        {!sesionActiva && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No hay sesión activa</p>
            <p className="text-sm mt-2">La rocola abrirá en el próximo horario</p>
          </div>
        )}

        {sesionActiva && enCola.length === 0 && !reproduciendo && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">La cola está vacía</p>
            <p className="text-sm mt-2">Escanea el código QR para pedir canciones</p>
          </div>
        )}

        {enCola.length > 0 && (
          <section>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Cola</p>
            <ul className="space-y-3">
              {enCola.map((item, idx) => (
                <li
                  key={item.solicitudId}
                  className="flex items-center gap-4 bg-gray-900 rounded-2xl p-4"
                >
                  <span className="text-2xl font-bold text-gray-600 w-8 text-center shrink-0">
                    {idx + 1}
                  </span>
                  <img
                    src={item.miniaturaUrl}
                    alt={item.titulo}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold truncate">{item.titulo}</p>
                    <p className="text-gray-400 text-sm truncate">{item.artista}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold">{item.votos}</p>
                    <p className="text-xs text-gray-500">votos</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
