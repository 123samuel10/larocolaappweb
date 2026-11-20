import { type ReactNode } from "react"
import { ChartNoAxesColumn, Clock, LayoutDashboard, ListMusic, LogOut, PlayCircle } from "lucide-react"
import { useAuth } from "@/store/useAuth"
import { SidebarNavLink } from "./SidebarNavLink"

type AdminLayoutProps = { children: ReactNode }

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
          <SidebarNavLink to="/admin" icon={LayoutDashboard} exact>Panel</SidebarNavLink>
          <SidebarNavLink to="/admin/reproduccion" icon={PlayCircle}>Reproducción</SidebarNavLink>
          <SidebarNavLink to="/admin/lista-defecto" icon={ListMusic}>Lista por defecto</SidebarNavLink>
          <SidebarNavLink to="/admin/horarios" icon={Clock}>Horarios y mantenimiento</SidebarNavLink>
          <SidebarNavLink to="/admin/tablero" icon={ChartNoAxesColumn}>Tablero</SidebarNavLink>
        </nav>

        <div className="px-5 pb-6 space-y-2">
          <p className="text-xs text-white/50 truncate">{admin?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="inline-flex cursor-pointer items-center gap-2 text-xs text-white/70"
          >
            <LogOut aria-hidden="true" className="size-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="min-h-screen bg-[#f1f0ee]" style={{ marginLeft: 220, flex: 1 }}>
        {children}
      </main>
    </div>
  )
}
