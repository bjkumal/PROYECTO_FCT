"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, GraduationCap, Link2, BookOpen } from "lucide-react"
import { useEffect, useState } from "react"
import { db, collection, getDocs } from "@/lib/imports"

interface StatsData {
  empresas: number
  estudiantes: number
  asignaciones: number
  ciclos: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    empresas: 0,
    estudiantes: 0,
    asignaciones: 0,
    ciclos: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const empresasSnapshot = await getDocs(collection(db, "empresas"))
        const estudiantesSnapshot = await getDocs(collection(db, "estudiantes"))
        const asignacionesSnapshot = await getDocs(collection(db, "asignaciones"))
        const ciclosSnapshot = await getDocs(collection(db, "ciclosFormativos"))

        setStats({
          empresas: empresasSnapshot.size,
          estudiantes: estudiantesSnapshot.size,
          asignaciones: asignacionesSnapshot.size,
          ciclos: ciclosSnapshot.size,
        })
      } catch (error: any) {
        console.error("Error fetching stats:", error)
        setError(error.message || "Error al cargar estadísticas")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
        <p className="font-medium">Error al cargar estadísticas</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="card-hover border-l-4 border-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empresas</CardTitle>
          <Building2 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="data-highlight text-2xl font-bold">{loading ? "..." : stats.empresas}</div>
          <p className="text-xs text-muted-foreground">Empresas colaboradoras activas</p>
        </CardContent>
      </Card>

      <Card className="card-hover border-l-4 border-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
          <GraduationCap className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="data-highlight text-2xl font-bold">{loading ? "..." : stats.estudiantes}</div>
          <p className="text-xs text-muted-foreground">Estudiantes registrados en FCT</p>
        </CardContent>
      </Card>

      <Card className="card-hover border-l-4 border-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Asignaciones</CardTitle>
          <Link2 className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="data-highlight text-2xl font-bold">{loading ? "..." : stats.asignaciones}</div>
          <p className="text-xs text-muted-foreground">Asignaciones activas</p>
        </CardContent>
      </Card>

      <Card className="card-hover border-l-4 border-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ciclos Formativos</CardTitle>
          <BookOpen className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="data-highlight text-2xl font-bold">{loading ? "..." : stats.ciclos}</div>
          <p className="text-xs text-muted-foreground">Ciclos formativos disponibles</p>
        </CardContent>
      </Card>
    </div>
  )
}
