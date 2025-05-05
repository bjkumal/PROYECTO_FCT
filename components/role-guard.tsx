"use client"

import { useAuth } from "@/context/auth-context"
import type { ReactNode } from "react"
import type { UserRole } from "@/types/auth-types"

interface RoleGuardProps {
  roles: UserRole[] | UserRole
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ roles = [], children, fallback = null }: RoleGuardProps) {
  const { userRole } = useAuth()

  // Convertir a array si es un string
  const allowedRoles = Array.isArray(roles) ? roles : [roles]

  if (userRole && allowedRoles.includes(userRole as UserRole)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
