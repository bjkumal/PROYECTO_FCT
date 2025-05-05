"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, GraduationCap, Link2, BookOpen, Settings, Menu, X, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { PermissionGuard } from "./permission-guard"
import { Badge } from "@/components/ui/badge"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Empresas",
    href: "/dashboard/empresas",
    icon: Building2,
  },
  {
    title: "Estudiantes",
    href: "/dashboard/estudiantes",
    icon: GraduationCap,
  },
  {
    title: "Asignaciones",
    href: "/dashboard/asignaciones",
    icon: Link2,
  },
  {
    title: "Ciclos Formativos",
    href: "/dashboard/ciclos",
    icon: BookOpen,
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
  },
]

export function SideNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { userRole } = useAuth()

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-300"
      case "coordinador":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "registrador":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return ""
    }
  }

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "coordinador":
        return "Coordinador"
      case "registrador":
        return "Registrador"
      default:
        return "Usuario"
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-40 flex transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <aside className="bg-muted/40 backdrop-blur-xl w-64 border-r min-h-screen flex flex-col soft-bg">
          <div className="h-16 flex items-center justify-center px-6 border-b">
            <Image src="/images/CEAC-FP-RGB-Azul.png" alt="Logo CEAC" width={120} height={40} className="dark:hidden" />
            <Image
              src="/images/CEAC-FP-RGB-Negro.png"
              alt="Logo CEAC"
              width={120}
              height={40}
              className="hidden dark:block invert"
            />
          </div>

          <div className="px-4 py-2 border-b">
            <Badge variant="outline" className={`w-full justify-center py-1 ${getRoleBadgeColor(userRole)}`}>
              {getRoleDisplayName(userRole)}
            </Badge>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all",
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-muted hover:text-primary",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        pathname === item.href || pathname.startsWith(`${item.href}/`)
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-primary",
                      )}
                    />
                    {item.title}
                  </Link>
                </li>
              ))}

              <PermissionGuard permission="canManageUsers">
                <li>
                  <Link
                    href="/dashboard/usuarios"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all",
                      pathname === "/dashboard/usuarios" || pathname.startsWith("/dashboard/usuarios/")
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-muted hover:text-primary",
                    )}
                  >
                    <Users
                      className={cn(
                        "h-5 w-5",
                        pathname === "/dashboard/usuarios" || pathname.startsWith("/dashboard/usuarios/")
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-primary",
                      )}
                    />
                    Gestión de Usuarios
                  </Link>
                </li>
              </PermissionGuard>
            </ul>
          </nav>
          <div className="p-4 border-t text-center text-xs text-muted-foreground">
            <p>CEAC - Gestión FCT</p>
            <p>v1.0.0</p>
          </div>
        </aside>
        <div className="flex-1 md:hidden bg-black/20" onClick={() => setIsOpen(false)} />
      </div>
    </>
  )
}
