type SongStatus = "Ya sonó" | "Siguiente" | "En espera"

const songs: { pos: number; title: string; artist: string; status: SongStatus }[] = [
  { pos: 1, title: "La Tierra del Olvido", artist: "Carlos Vives", status: "Ya sonó" },
  { pos: 2, title: "Tabaco y Chanel", artist: "Bacilos", status: "Ya sonó" },
  { pos: 5, title: "Fruta Fresca", artist: "", status: "Siguiente" },
  { pos: 6, title: "Mi Gente", artist: "J Balvin, Willy William", status: "En espera" },
  { pos: 7, title: "Robarte un Beso", artist: "Carlos Vives, Sebastian Yatra", status: "En espera" },
]

export default function ListaDefecto() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="rocola-display text-3xl text-[#0c2944]">Lista por defecto</h1>
          <p className="text-sm text-gray-500 mt-1">Canciones que suenan cuando no hay solicitudes pendientes</p>
        </div>
        <div className="flex gap-3 items-center mt-1">
          <input type="search" placeholder="Buscar cancion..." className="rocola-input text-sm" style={{ width: 220 }} />
          <button className="bg-[#133b62] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors whitespace-nowrap">
            Agregar cancion
          </button>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-[#0c2944]">12 canciones — 48 min</span>
            <span className="text-sm text-gray-400">Posicion 5 de 12</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="text-left pb-3 w-8">#</th>
                <th className="text-left pb-3">Canción</th>
                <th className="text-left pb-3">Artista</th>
                <th className="text-left pb-3">Estado</th>
                <th className="pb-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => {
                const isNext = song.status === "Siguiente"
                return (
                  <tr key={song.pos} className={`border-b border-gray-50 ${isNext ? "bg-red-50" : ""}`}>
                    <td className="py-3 text-gray-400">{song.pos}</td>
                    <td className="py-3 font-medium text-[#0c2944]">{song.title}</td>
                    <td className="py-3 text-gray-500">{song.artist || "—"}</td>
                    <td className={`py-3 ${isNext ? "text-[#ba1929] font-bold" : song.status === "Ya sonó" ? "text-gray-400" : "text-gray-600"}`}>
                      {song.status}
                    </td>
                    <td className="py-3 text-right">
                      {song.status === "En espera" && (
                        <button className="text-xs text-gray-400 hover:text-[#ba1929] transition-colors">Quitar</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl p-6 flex flex-col">
          <p className="text-sm font-bold text-[#0c2944] mb-2">Cumplimiento de la noche</p>
          <p className="text-5xl font-bold text-[#0c2944] mb-2">64%</p>
          <p className="text-xs text-gray-500 mb-6">Porcentaje de canciones de la lista por defecto que sonaron según lo planificado.</p>
          <div className="flex justify-between text-sm py-2 border-b border-gray-100">
            <span className="text-gray-600">Cambios entre lista y solicitudes</span>
            <span className="font-medium text-[#0c2944]">9</span>
          </div>
          <div className="text-sm py-2 text-gray-500 mb-auto">Ultima rotacion: hace 42 min</div>
          <button className="mt-6 w-full border border-[#133b62] text-[#133b62] rounded-xl py-2 text-sm font-medium hover:bg-[#133b62]/5 transition-colors">
            Reordenar lista ahora
          </button>
        </div>
      </div>
    </div>
  )
}
