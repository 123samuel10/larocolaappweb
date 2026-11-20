import { useQuery } from "@tanstack/react-query"
import { Link } from "wouter"
import { obtenerEstablecimientos } from "@/db/superadmin/establecimientos"
import { obtenerAdmins } from "@/db/superadmin/admins"

export default function Panel() {
  const { data: establecimientos = [] } = useQuery({
    queryKey: ["superadmin", "establecimientos"],
    queryFn: obtenerEstablecimientos,
  })

  const { data: admins = [] } = useQuery({
    queryKey: ["superadmin", "admins"],
    queryFn: obtenerAdmins,
  })

  const activos = establecimientos.filter((e) => e.activo).length
  const sinAdmin = establecimientos.filter((e) => !e.admin_email).length

  return (
    <div className="p-8">
      <h1 className="rocola-display text-xl text-[#0c2944] mb-6">Panel</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Establecimientos</p>
          <p className="text-xl font-bold text-[#0c2944]">{establecimientos.length}</p>
          <p className="text-xs text-gray-400 mt-1">{activos} activos</p>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Administradores</p>
          <p className="text-xl font-bold text-[#0c2944]">{admins.length}</p>
        </div>
        <div className={`rounded-2xl p-5 ${sinAdmin > 0 ? "bg-amber-50" : "bg-white"}`}>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Sin administrador</p>
          <p className={`text-xl font-bold ${sinAdmin > 0 ? "text-amber-600" : "text-[#0c2944]"}`}>
            {sinAdmin}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="font-bold text-[#0c2944]">Establecimientos recientes</p>
            <Link to="/super-admin/establecimientos" className="text-xs text-[#133b62] underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {establecimientos.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-[#0c2944]">{e.nombre}</p>
                  <p className="text-xs text-gray-400">{e.slug}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  e.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {e.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
            ))}
            {establecimientos.length === 0 && (
              <p className="text-sm text-gray-400">No hay establecimientos aún.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="font-bold text-[#0c2944]">Administradores recientes</p>
            <Link to="/super-admin/admins" className="text-xs text-[#133b62] underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {admins.slice(0, 5).map((a) => (
              <div key={a.id} className="text-sm">
                <p className="font-medium text-[#0c2944] truncate">{a.email}</p>
                <p className="text-xs text-gray-400">{a.establecimiento_nombre}</p>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-sm text-gray-400">No hay administradores aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
