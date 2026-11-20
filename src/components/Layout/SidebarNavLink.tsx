import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Link, useLocation } from "wouter"

type SidebarNavLinkProps = {
  to: string
  icon: LucideIcon
  exact?: boolean
  children: ReactNode
}

export function SidebarNavLink({ to, icon: Icon, exact, children }: SidebarNavLinkProps) {
  const [location] = useLocation()
  const isActive = exact ? location === to : location.startsWith(to)

  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm text-white transition-colors ${
        isActive ? "bg-[#133b62]" : "hover:bg-[#133b62]/60"
      }`}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span>{children}</span>
    </Link>
  )
}
