import type { Route } from "./+types/pantalla.$slug"
import { Link, useLoaderData, useRevalidator } from "react-router"
import qrcode from "qrcode-generator"
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

export async function loader({ params, request }: Route.LoaderArgs) {
  const slug = params.slug

  const { data: est } = await supabase
    .from("establecimiento")
    .select("id, nombre")
    .eq("slug", slug)
    .eq("activo", true)
    .single()

  if (!est) throw new Response("Not Found", { status: 404 })

  const rutaLocal = `/${encodeURIComponent(slug)}`
  const qr = qrcode(0, "M")
  qr.addData(new URL(rutaLocal, request.url).href)
  qr.make()
  const acceso = { rutaLocal, qr: qr.createDataURL(4, 16) }

  const { data: sesion } = await supabase
    .from("sesion")
    .select("id")
    .eq("establecimiento_id", est.id)
    .eq("estado", "activa")
    .maybeSingle()

  if (!sesion) return { ...acceso, nombre: est.nombre as string, cola: [] as ItemCola[], sesionActiva: false }

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

  return { ...acceso, nombre: est.nombre as string, cola, sesionActiva: true }
}

export default function PantallaEstablecimiento() {
  const { nombre, cola, sesionActiva, rutaLocal, qr } = useLoaderData<typeof loader>()
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
    <main className="rocola-page min-h-dvh px-5 py-6 sm:px-8 sm:py-8 xl:px-11 xl:py-10">
      <div className="mx-auto grid max-w-[112rem] gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(18rem,1fr)] xl:gap-10">
        <section aria-labelledby="now-playing-heading" className="min-w-0">
          <div className="rocola-media relative isolate grid aspect-video place-items-center overflow-hidden rounded-[1.25rem]">
            {reproduciendo?.miniaturaUrl ? (
              <img
                src={reproduciendo.miniaturaUrl}
                alt=""
                className="absolute inset-0 -z-10 size-full object-cover"
              />
            ) : (
              <>
                <div aria-hidden="true" className="rocola-ring -z-10 -bottom-[26%] -left-[9%] h-[105%] aspect-square" />
                <div aria-hidden="true" className="rocola-mark absolute top-[11%] right-[7.5%] size-[9%] rounded-full" />
                <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-white/15 text-3xl sm:size-24 sm:text-5xl">♫</span>
              </>
            )}
            <p className="rocola-media-label absolute top-4 left-4 max-w-[85%] truncate rounded-lg px-3 py-1.5 text-sm font-semibold sm:top-5 sm:left-5">
              {nombre}
            </p>
          </div>
          <div className="mt-5">
            <p className="rocola-kicker mb-1 text-xs font-bold tracking-[.14em] uppercase sm:text-sm">Sonando ahora</p>
            <h1 id="now-playing-heading" className="rocola-display text-4xl leading-tight sm:text-5xl xl:text-6xl">
              {reproduciendo?.titulo ?? (sesionActiva ? "Sin reproducción" : "No hay sesión activa")}
            </h1>
            {reproduciendo && (
              <div className="rocola-muted mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-base sm:text-xl">
                <p>{reproduciendo.artista} · {reproduciendo.votos} {reproduciendo.votos === 1 ? "voto" : "votos"}</p>
                <p className="font-bold tabular-nums">{formatearDuracion(reproduciendo.duracionSeg)}</p>
              </div>
            )}
          </div>
        </section>

        <aside className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="queue-heading">
            <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="queue-heading" className="rocola-display text-3xl xl:text-4xl">Lo que viene</h2>
              <span className="rocola-muted flex items-center gap-2 text-sm font-semibold">
                <span aria-hidden="true" className={`size-2.5 rounded-full ${sesionActiva ? "bg-green-400" : "bg-slate-400"}`} />
                {sesionActiva ? "En vivo" : "Sin sesión"}
              </span>
            </header>

            {enCola.length ? (
              <ol className="space-y-2">
                {enCola.map((item, idx) => (
                  <li key={item.solicitudId} className="rocola-queue-item grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl px-3 py-3 sm:px-4">
                    <span aria-hidden="true" className="rocola-rank text-center text-xl font-bold tabular-nums">{idx + 1}</span>
                    <div>
                      <p className="font-bold break-words xl:text-lg">{item.titulo}</p>
                      <p className="rocola-muted text-sm break-words">{item.artista}</p>
                    </div>
                    <p className="min-w-11 text-center leading-none">
                      <strong className="block text-2xl tabular-nums">{item.votos}</strong>
                      <span className="rocola-muted text-xs">{item.votos === 1 ? "voto" : "votos"}</span>
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rocola-media rocola-muted rounded-2xl p-4 text-sm">
                {sesionActiva ? "Todavía no hay canciones en la cola." : "La cola se abre cuando haya una sesión activa."}
              </p>
            )}
          </section>

          <Link to={rutaLocal} className="rocola-paper mt-auto flex items-center gap-4 rounded-2xl p-3 sm:p-4">
            <img src={qr} alt="" width={92} height={92} className="size-[5.25rem] shrink-0 rounded-lg sm:size-[5.75rem]" />
            <div>
              <p className="text-lg leading-tight font-bold xl:text-xl">¡Pide tu canción!</p>
              <p className="mt-1 text-sm text-slate-700">Escanea el QR para abrir La Rocola en tu celular.</p>
            </div>
          </Link>
        </aside>
      </div>
    </main>
  )
}
