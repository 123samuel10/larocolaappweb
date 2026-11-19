export type ItemCola = {
  solicitudId: string
  titulo: string
  artista: string
  miniaturaUrl: string | null
  duracionSeg: number
  estado: string
  votos: number
}

export type DatosAccesoLocal = {
  vista: "acceso"
  nombre: string
  enlaceApp: string
}

export type DatosPantallaCola = {
  vista: "cola"
  nombre: string
  rutaAcceso: string
  qrAcceso: string
  cola: ItemCola[]
  sesionActiva: boolean
}
