import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { obtenerAdmins, crearAdmin } from "@/db/superadmin/admins"
import { obtenerEstablecimientos } from "@/db/superadmin/establecimientos"
import { Dropdown } from "@/shared/ui/Dropdown"

export default function Admins() {
  const qc = useQueryClient()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState({ email: "", password: "", establecimiento_id: "" })
  const [formError, setFormError] = useState<string | null>(null)

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["superadmin", "admins"],
    queryFn: obtenerAdmins,
  })

  const { data: establecimientos = [] } = useQuery({
    queryKey: ["superadmin", "establecimientos"],
    queryFn: obtenerEstablecimientos,
  })

  const sinAdmin = establecimientos.filter((e) => !e.admin_email)

  const crear = useMutation({
    mutationFn: crearAdmin,
    onSuccess: ({ error }) => {
      if (error) { setFormError(error); return }
      qc.invalidateQueries({ queryKey: ["superadmin", "admins"] })
      qc.invalidateQueries({ queryKey: ["superadmin", "establecimientos"] })
      setModalAbierto(false)
      setForm({ email: "", password: "", establecimiento_id: "" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!form.email || !form.password || !form.establecimiento_id) {
      setFormError("Todos los campos son requeridos.")
      return
    }
    if (!sinAdmin.some((e) => e.id === form.establecimiento_id)) {
      setFormError("Selecciona un establecimiento disponible.")
      return
    }
    if (form.password.length < 8) {
      setFormError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    crear.mutate(form)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="rocola-display text-xl text-[#0c2944]">Administradores</h1>
          <p className="text-sm text-gray-500 mt-1">{admins.length} registrados</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-[#133b62] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors"
        >
          Nuevo administrador
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-gray-400">Cargando…</p>
        ) : admins.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No hay administradores aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="text-left px-6 py-4">Email</th>
                <th className="text-left px-6 py-4">Establecimiento</th>
                <th className="text-left px-6 py-4">Creado</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4 font-medium text-[#0c2944]">{a.email}</td>
                  <td className="px-6 py-4 text-gray-500">{a.establecimiento_nombre}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(a.created_at).toLocaleDateString("es-CO")}
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
            <h2 className="font-bold text-xl text-[#0c2944] mb-6">Nuevo administrador</h2>

            {sinAdmin.length === 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3 mb-4">
                Todos los establecimientos ya tienen administrador. Crea uno nuevo primero.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  id="establecimiento-admin-label"
                  htmlFor="establecimiento-admin"
                  className="block text-sm font-medium text-[#0c2944] mb-1"
                >
                  Establecimiento
                </label>
                <Dropdown
                  id="establecimiento-admin"
                  value={form.establecimiento_id}
                  options={sinAdmin.map((e) => ({ value: e.id, label: e.nombre }))}
                  onChange={(establecimiento_id) => setForm((f) => ({ ...f, establecimiento_id }))}
                  placeholder="Selecciona un establecimiento…"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0c2944] mb-1">
                  Correo electrónico
                </label>
                <input
                  className="rocola-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@bar.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0c2944] mb-1">
                  Contraseña temporal
                </label>
                <input
                  className="rocola-input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
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
                  disabled={crear.isPending || sinAdmin.length === 0}
                  className="flex-1 bg-[#133b62] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#0c2944] transition-colors disabled:opacity-60"
                >
                  {crear.isPending ? "Creando…" : "Crear admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
