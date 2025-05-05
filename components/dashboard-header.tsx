"use client"

import { useAuth } from "@/context/auth-context"

export function DashboardHeader() {
  const { user } = useAuth()

  // Obtener hora del día para personalizar el saludo
  const hours = new Date().getHours()
  let greeting = "Buenos días"

  if (hours >= 12 && hours < 18) {
    greeting = "Buenas tardes"
  } else if (hours >= 18 || hours < 5) {
    greeting = "Buenas noches"
  }

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Usuario"

  return (
    <div className="space-y-2 bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-lg">
      <h1 className="text-3xl font-bold tracking-tight text-primary">
        {greeting}, <span className="text-foreground">{displayName}</span>
      </h1>
      <p className="text-muted-foreground">Bienvenido al sistema de gestión de Formación en Centros de Trabajo.</p>
    </div>
  )
}
