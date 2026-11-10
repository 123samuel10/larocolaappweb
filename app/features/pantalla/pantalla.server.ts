import qrcode from "qrcode-generator"
import { obtenerColaActiva, obtenerEstablecimientoActivo } from "./api/cola.server"
import type { DatosAccesoLocal, DatosPantallaCola } from "./types"

export async function cargarPantalla(slug: string, requestUrl: string): Promise<DatosAccesoLocal | DatosPantallaCola> {
  const establecimiento = await obtenerEstablecimientoActivo(slug)
  if (!establecimiento) throw new Response("Not Found", { status: 404 })

  const { id, nombre } = establecimiento
  const url = new URL(requestUrl)
  if (url.searchParams.get("unirse") === "1") {
    return { vista: "acceso", nombre, enlaceApp: `larocola://e/${encodeURIComponent(slug)}` }
  }

  url.search = "?unirse=1"
  const qr = qrcode(0, "M")
  qr.addData(url.href)
  qr.make()

  return {
    vista: "cola",
    nombre,
    rutaAcceso: url.pathname + url.search,
    qrAcceso: qr.createDataURL(4, 16),
    ...await obtenerColaActiva(id),
  }
}
