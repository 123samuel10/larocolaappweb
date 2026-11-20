import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  obtenerEstablecimientos,
  crearEstablecimiento,
  toggleActivo,
} from "@/db/superadmin/establecimientos"

const ZONAS = [
  "America/Bogota",
  "America/Mexico_City",
  "America/Lima",
  "America/Santiago",
  "America/Buenos_Aires",
]

export default function Establecimientos() {
  const qc = useQueryClient()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState({ nombre: "", slug: "", zona_horaria: "America/Bogota" })
  const [formError, setFormError] = useState<string | null>(null)

  const { data: establecimientos = [], isLoading } = useQuery({
    queryKey: ["superadmin", "establecimientos"],
    queryFn: obtenerEstablecimientos,
  })

  const crear = useMutation({
    mutationFn: crearEstablecimiento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin", "establecimientos"] })
      setModalAbierto(false)
      setForm({ nombre: "", slug: "", zona_horaria: "America/Bogota" })
    },
    onError: (e: Error) => setFormError(e.message),
  })

  const toggle = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => toggleActivo(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["superadmin", "establecimientos"] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!form.nombre.trim() || !form.slug.trim()) {
      setFormError("Nombre y slug son requeridos.")
      return
    }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setFormError("El slug solo puede tener letras minúsculas, números y guiones.")
      return
    }
    crear.mutate(form)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="rocola-display text-3xl text-[#0c2944]">Establecimientos</h1>
          <p className="text-sm text-gray-500 mt-1">{establecimientos.length} registrados</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-[#133b62] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors"
        >
          Nuevo establecimiento
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-gray-400">Cargando…</p>
        ) : establecimientos.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No hay establecimientos aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="text-left px-6 py-4">Nombre</th>
                <th className="text-left px-6 py-4">Slug</th>
                <th className="text-left px-6 py-4">Admin</th>
                <th className="text-left px-6 py-4">Zona horaria</th>
                <th className="text-left px-6 py-4">Estado</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {establecimientos.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 font-medium text-[#0c2944]">{e.nombre}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{e.slug}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {e.admin_email ?? (
                      <span className="text-amber-600 font-medium">Sin admin</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{e.zona_horaria}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      e.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {e.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggle.mutate({ id: e.id, activo: !e.activo })}
                      className="text-xs text-gray-400 hover:text-[#0c2944] transition-colors"
                    >
                      {e.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 mx-4">
            <h2 className="font-bold text-xl text-[#0c2944] mb-6">Nuevo establecimiento</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0c2944] mb-1">Nombre</label>
                <input
                  className="rocola-input"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="La Esquina Bar"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0c2944] mb-1">Slug</label>
                <input
                  className="rocola-input font-mono"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
                  placeholder="la-esquina-bar"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  URL: /pantalla/{form.slug || "…"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0c2944] mb-1">Zona horaria</label>
                <select
                  className="rocola-input"
                  value={form.zona_horaria}
                  onChange={(e) => setForm((f) => ({ ...f, zona_horaria: e.target.value }))}
                >
                  {ZONAS.map((z) => <option key={z}>{z}</option>)}
                </select>
              </div>
              {formError && (
                <p className="text-sm text-red-700 bg-red-50 rounded-xl p-3">{formError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalAbierto(false); setFormError(null) }}
                  className="flex-1 border border-[#0c2944] text-[#0c2944] rounded-xl py-2 text-sm font-medium hover:bg-[#0c2944]/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={crear.isPending}
                  className="flex-1 bg-[#133b62] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors disabled:opacity-60"
                >
                  {crear.isPending ? "Creando…" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
