import { Link, useLocation } from "wouter"
import { type ReactNode } from "react"
import { useAuth } from "@/store/AuthContext"

type AdminLayoutProps = { children: ReactNode }

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const [location] = useLocation()
  const isActive = to === "/admin" ? location === "/admin" : location.startsWith(to)
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

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside
        className="fixed left-0 top-0 h-full flex flex-col"
        style={{ width: 220, background: "#0c2944" }}
      >
        <div className="px-5 pt-6 pb-4">
          <span className="text-white text-xs font-bold tracking-widest uppercase">LA ROCOLA</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavLink to="/admin">Panel</NavLink>
          <NavLink to="/admin/reproduccion">Reproduccion</NavLink>
          <NavLink to="/admin/lista-defecto">Lista por defecto</NavLink>
          <NavLink to="/admin/horarios">Horarios y mantenimiento</NavLink>
          <NavLink to="/admin/tablero">Tablero</NavLink>
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
