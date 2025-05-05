"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import type { UserPermissions } from "@/types/auth-types"

interface PermissionGuardProps {
  children: ReactNode
  permission: keyof UserPermissions
  fallback?: ReactNode
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  const { hasPermission, loading } = useAuth()

  // Mientras carga, no mostramos nada para evitar parpadeos en la UI
  if (loading) {
    return null
  }

  // Si el usuario tiene el permiso, mostramos el contenido
  if (hasPermission(permission)) {
    return <>{children}</>
  }

  // Si no tiene el permiso, mostramos el fallback o nada
  return <>{fallback}</>
}
