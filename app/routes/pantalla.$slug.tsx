import type { Route } from "./+types/pantalla.$slug"
import { useRevalidator } from "react-router"
import qrcode from "qrcode-generator"
import { useEffect } from "react"
import { supabase } from "~/lib/supabase"
import { formatearDuracion } from "~/lib/format"

const APK_URL =
  "https://dsopvxdfhimztngcxgdo.supabase.co/storage/v1/object/public/descargas/app-debug.apk"

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData ? `${loaderData.nombre} — ${loaderData.vista === "acceso" ? "La Rocola" : "Cola"}` : "La Rocola" },
]

type ItemCola = {
  solicitudId: string
  titulo: string
  artista: string
  miniaturaUrl: string | null
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

  const nombre = est.nombre as string
  const url = new URL(request.url)
  if (url.searchParams.get("unirse") === "1") {
    return { vista: "acceso" as const, nombre, enlaceApp: `larocola://e/${encodeURIComponent(slug)}` }
  }

  url.search = "?unirse=1"
  const rutaAcceso = url.pathname + url.search
  const qr = qrcode(0, "M")
  qr.addData(url.href)
  qr.make()
  const pantalla = { vista: "cola" as const, nombre, rutaAcceso, qrAcceso: qr.createDataURL(4, 16) }

  const { data: sesion } = await supabase
    .from("sesion")
    .select("id")
    .eq("establecimiento_id", est.id)
    .eq("estado", "activa")
    .maybeSingle()

  if (!sesion) return { ...pantalla, cola: [] as ItemCola[], sesionActiva: false }

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
      miniaturaUrl: s.cancion.miniatura_url as string | null,
      duracionSeg: s.cancion.duracion_seg as number,
      estado: s.estado as string,
      votos: (s.voto as { id: string }[]).length,
    }))
    .sort((a: ItemCola, b: ItemCola) => {
      if (a.estado === "reproduciendo") return -1
      if (b.estado === "reproduciendo") return 1
      return b.votos - a.votos
    })

  return { ...pantalla, cola, sesionActiva: true }
}

export default function PantallaEstablecimiento({ loaderData }: Route.ComponentProps) {
  if (loaderData.vista === "cola") return <PantallaCola {...loaderData} />

  const { nombre, enlaceApp } = loaderData
  return (
    <main className="rocola-page grid min-h-dvh place-items-center px-5 py-10">
      <section className="rocola-paper w-full max-w-sm rounded-3xl p-6 text-center sm:p-8">
        <p className="rocola-paper-kicker text-xs font-bold tracking-[.15em] uppercase">La Rocola</p>
        <h1 className="rocola-display mt-2 text-4xl leading-tight">{nombre}</h1>
        <p className="mt-3 text-sm text-slate-700">Pide canciones y vota desde la app de Android.</p>
        <div className="mt-6 grid gap-3">
          <a href={enlaceApp} className="rocola-button block">Abrir en La Rocola</a>
          <a href={APK_URL} className="block rounded-xl border border-current px-4 py-3 font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2">Descargar APK</a>
        </div>
        <p className="mt-4 text-sm text-slate-700">Si acabas de instalar la app, vuelve aquí y toca «Abrir en La Rocola».</p>
      </section>
    </main>
  )
}

function PantallaCola({ nombre, cola, sesionActiva, rutaAcceso, qrAcceso }: Extract<Route.ComponentProps["loaderData"], { vista: "cola" }>) {
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
  const destacada = reproduciendo ?? enCola[0]

  return (
    <main className="rocola-page min-h-dvh px-5 py-6 sm:px-8 sm:py-8 xl:px-11 xl:py-10">
      <div className="mx-auto grid max-w-[112rem] gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(18rem,1fr)] xl:gap-10">
        <section aria-labelledby="now-playing-heading" className="min-w-0">
          <div className="rocola-media relative isolate grid aspect-video place-items-center overflow-hidden rounded-[1.25rem]">
            {destacada?.miniaturaUrl ? (
              <img
                src={destacada.miniaturaUrl}
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
            <p className="rocola-kicker mb-1 text-xs font-bold tracking-[.14em] uppercase sm:text-sm">
              {reproduciendo ? "Sonando ahora" : destacada ? "Próxima canción" : "Reproducción"}
            </p>
            <h1 id="now-playing-heading" className="rocola-display text-4xl leading-tight sm:text-5xl xl:text-6xl">
              {destacada?.titulo ?? (sesionActiva ? "Sin reproducción" : "No hay sesión activa")}
            </h1>
            {destacada && (
              <div className="rocola-muted mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-base sm:text-xl">
                <p>{destacada.artista} · {destacada.votos} {destacada.votos === 1 ? "voto" : "votos"}</p>
                <p className="font-bold tabular-nums">{formatearDuracion(destacada.duracionSeg)}</p>
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

          <a href={rutaAcceso} className="rocola-paper mt-auto flex items-center gap-4 rounded-2xl p-3 sm:p-4">
            <img src={qrAcceso} alt="" width={112} height={112} className="size-24 shrink-0 rounded-lg sm:size-28" />
            <div>
              <p className="text-lg leading-tight font-bold xl:text-xl">Entra a La Rocola</p>
              <p className="mt-1 text-sm text-slate-700">Escanea el QR para abrir este local en tu celular.</p>
            </div>
          </a>
        </aside>
      </div>
    </main>
  )
}
