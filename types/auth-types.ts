export type UserRole = "admin" | "coordinador" | "registrador" | null

export interface UserPermissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canManageUsers: boolean
  canViewPendingTasks: boolean // Añadido para asegurar que todos los roles tengan acceso
}

export const ROLE_PERMISSIONS: Record<string, UserPermissions> = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canViewPendingTasks: true,
  },
  coordinador: {
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canViewPendingTasks: true,
  },
  registrador: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canViewPendingTasks: true,
  },
}

export const ROLE_NAMES: Record<string, string> = {
  admin: "Administrador",
  coordinador: "Coordinador",
  registrador: "Registrador",
}
