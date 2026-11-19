import type { ItemCola } from "../types"

type ListaColaProps = {
  enCola: ItemCola[]
  sesionActiva: boolean
}

export function ListaCola({ enCola, sesionActiva }: ListaColaProps) {
  return (
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
  )
}
