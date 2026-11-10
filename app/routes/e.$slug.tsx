import type { Route } from "./+types/e.$slug"
import { useLoaderData } from "react-router"
import { useEffect, useRef, useState } from "react"
import { supabase } from "~/lib/supabase"

const APK_URL =
  "https://dsopvxdfhimztngcxgdo.supabase.co/storage/v1/object/public/descargas/app-debug.apk"

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData ? `La Rocola — ${loaderData.nombre}` : "La Rocola" },
]

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug

  const { data: est } = await supabase
    .from("establecimiento")
    .select("id, nombre, slug")
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

  return { nombre: est.nombre as string, slug: est.slug as string, sesionActiva: !!sesion }
}

export default function LandingEstablecimiento() {
  const { nombre, slug, sesionActiva } = useLoaderData<typeof loader>()
  const deepLink = `larocola://e/${slug}`

  const [isAndroid, setIsAndroid] = useState(true)
  const [highlightDownload, setHighlightDownload] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsAndroid(/Android/i.test(navigator.userAgent))
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleOpenApp(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const start = Date.now()
    window.location.href = deepLink
    timerRef.current = setTimeout(() => {
      if (Date.now() - start < 2500) setHighlightDownload(true)
    }, 1500)
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 text-white"
      style={{ background: "#14406B" }}
    >
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-1">
          <p className="text-2xl font-black tracking-widest">
            LA <span style={{ color: "#BC1F2D" }}>ROCOLA</span>
          </p>
          <h1 className="text-lg" style={{ color: "#b0c8e8" }}>
            {nombre}
          </h1>
        </div>

        <p className="text-lg leading-relaxed">
          Pide canciones y vota por las que quieres escuchar.
        </p>

        {sesionActiva ? (
          <div className="space-y-3">
            <a
              href={deepLink}
              onClick={handleOpenApp}
              className="block w-full font-bold py-4 px-6 rounded-xl text-lg transition-colors"
              style={{ background: "#BC1F2D", color: "#fff" }}
            >
              Abrir en La Rocola
            </a>

            {isAndroid && (
              <a
                href={APK_URL}
                className="block w-full font-bold py-3 px-6 rounded-xl text-base transition-colors border-2"
                style={
                  highlightDownload
                    ? { background: "#BC1F2D", color: "#fff", borderColor: "#BC1F2D" }
                    : {
                        background: "transparent",
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.4)",
                      }
                }
              >
                Descargar la app
              </a>
            )}

            {isAndroid && (
              <p className="text-xs" style={{ color: "#b0c8e8" }}>
                Android: puede que debas permitir la instalación desde esta fuente.
              </p>
            )}

            {!isAndroid && (
              <p className="text-sm" style={{ color: "#FF6B7A" }}>
                La Rocola está disponible solo para Android por ahora.
              </p>
            )}
          </div>
        ) : (
          <p style={{ color: "#b0c8e8" }}>
            No hay sesión activa en este momento. Vuelve más tarde.
          </p>
        )}
      </div>
    </main>
  )
}
