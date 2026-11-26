import { type ReactNode } from "react"
import { ChartNoAxesColumn, Clock, LayoutDashboard, ListMusic, LogOut, PlayCircle } from "lucide-react"
import { useAuth } from "@/store/useAuth"
import { SidebarNavLink } from "./SidebarNavLink"

type AdminLayoutProps = { children: ReactNode }

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside
        className="flex flex-col bg-[#0c2944] md:fixed md:inset-y-0 md:left-0 md:w-[220px]"
      >
        <div className="px-4 pt-4 pb-2 md:px-5 md:pt-6 md:pb-4">
          <span className="text-white text-xs font-bold tracking-widest uppercase">LA ROCOLA</span>
        </div>

        <nav className="flex flex-wrap gap-1 px-2 md:block md:flex-1 md:space-y-1 md:px-3">
          <SidebarNavLink to="/admin" icon={LayoutDashboard} exact>Panel</SidebarNavLink>
          <SidebarNavLink to="/admin/reproduccion" icon={PlayCircle}>Reproducción</SidebarNavLink>
          <SidebarNavLink to="/admin/lista-defecto" icon={ListMusic}>Lista por defecto</SidebarNavLink>
          <SidebarNavLink to="/admin/horarios" icon={Clock}>Horarios y mantenimiento</SidebarNavLink>
          <SidebarNavLink to="/admin/tablero" icon={ChartNoAxesColumn}>Tablero</SidebarNavLink>
        </nav>

        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:space-y-2 md:px-5 md:pb-6">
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

      <main className="min-w-0 flex-1 bg-[#f1f0ee] md:ml-[220px] md:min-h-screen">
        {children}
      </main>
    </div>
  )
}
