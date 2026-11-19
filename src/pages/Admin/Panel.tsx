const queue = [
  { pos: 1, title: "Tusa", artist: "Karol G, Nicki Minaj", votes: 15 },
  { pos: 2, title: "Vivir Mi Vida", artist: "Marc Anthony", votes: 11 },
  { pos: 3, title: "Rayando el Sol", artist: "Maná", votes: 7 },
  { pos: 4, title: "Felices los 4", artist: "Maluma", votes: 4 },
  { pos: 5, title: "La Gota Fria", artist: "Carlos Vives", votes: 2 },
]

export default function Panel() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-500">La Esquina Bar — Viernes 20 de noviembre</p>
          <h1 className="rocola-display text-3xl text-[#0c2944]">Panel</h1>
        </div>
        <div className="flex gap-3">
          <button className="border border-[#133b62] text-[#133b62] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#133b62]/5 transition-colors">
            Pausar servicio
          </button>
          <button className="bg-[#ba1929] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#a01522] transition-colors">
            Ir a reproduccion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="rounded-2xl p-5" style={{ background: "#133b62" }}>
          <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Estado del servicio</p>
          <p className="text-white font-bold text-lg leading-tight">Activo — pedidos abiertos</p>
          <p className="text-xs text-white/50 mt-1">Cierra a las 2:00 a.m.</p>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Solicitudes</p>
          <p className="text-5xl font-bold text-[#0c2944]">46</p>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Usuarios únicos</p>
          <p className="text-5xl font-bold text-[#0c2944]">31</p>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">En cola</p>
          <p className="text-5xl font-bold text-[#0c2944]">5</p>
        </div>
      </div>

      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: "1fr 380px" }}>
        <div className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-[#0c2944]">Cola — 5 canciones</span>
            <span className="text-sm text-gray-400">~19 min</span>
          </div>
          <div className="space-y-3">
            {queue.map((song) => (
              <div key={song.pos} className="flex items-center gap-3">
                <span className="text-xs font-bold text-white bg-[#0c2944] rounded px-2 py-0.5 min-w-[24px] text-center">
                  {song.pos}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#0c2944] truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
                <span className="text-sm text-gray-500 shrink-0">{song.votes}v</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Sonando ahora</p>
          <p className="font-bold text-xl text-[#0c2944]">La Bicicleta</p>
          <p className="text-sm text-gray-500 mt-1">Carlos Vives, Shakira — pedida con 18 votos</p>
          <div className="mt-4 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-[#ba1929] h-full rounded-full" style={{ width: "60%" }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2:16</span>
            <span>3:48</span>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 border border-[#0c2944] text-[#0c2944] rounded-xl py-2 text-sm font-medium hover:bg-[#0c2944]/5 transition-colors">
              Pausar
            </button>
            <button className="flex-1 bg-[#133b62] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors">
              Saltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
