import { Link, useLocation } from "wouter"
import { type ReactNode } from "react"
import { useAuth } from "@/store/useAuth"

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const [location] = useLocation()
  const isActive = to === "/super-admin"
    ? location === "/super-admin"
    : location.startsWith(to)
  return (
    <Link
      to={to}
      className={`block px-4 py-2 rounded-lg text-sm text-white transition-colors ${
        isActive ? "bg-[#133b62]" : "hover:bg-[#133b62]/60"
      }`}
    >
      {children}
    </Link>
  )
}

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { admin, logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside
        className="fixed left-0 top-0 h-full flex flex-col"
        style={{ width: 220, background: "#0c2944" }}
      >
        <div className="px-5 pt-6 pb-2">
          <span className="text-white text-xs font-bold tracking-widest uppercase">LA ROCOLA</span>
          <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">Super Admin</p>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          <NavLink to="/super-admin">Panel</NavLink>
          <NavLink to="/super-admin/establecimientos">Establecimientos</NavLink>
          <NavLink to="/super-admin/admins">Administradores</NavLink>
        </nav>

        <div className="px-5 pb-6 space-y-2">
          <p className="text-xs text-white/50 truncate">{admin?.email}</p>
          <button
            onClick={logout}
            className="text-xs text-white/70 underline cursor-pointer"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="min-h-screen bg-[#f1f0ee]" style={{ marginLeft: 220, flex: 1 }}>
        {children}
      </main>
    </div>
  )
}
