"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase-config"
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  startAfter,
  endBefore,
  limitToLast,
} from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Asignacion {
  id: string
  estudianteId: string
  empresaId: string
  fechaInicio: string
  fechaFin: string
  estudiante?: {
    nombre: string
    apellidos: string
  }
  empresa?: {
    nombre: string
    entidad?: string
  }
}

export function RecentAssignments() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [firstVisible, setFirstVisible] = useState<any>(null)
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 5

  const fetchAsignaciones = async (pageType: "first" | "next" | "prev" = "first") => {
    try {
      setLoading(true)
      let asignacionesQuery

      if (pageType === "first") {
        asignacionesQuery = query(collection(db, "asignaciones"), orderBy("fechaInicio", "desc"), limit(itemsPerPage))
      } else if (pageType === "next" && lastVisible) {
        asignacionesQuery = query(
          collection(db, "asignaciones"),
          orderBy("fechaInicio", "desc"),
          startAfter(lastVisible),
          limit(itemsPerPage),
        )
      } else if (pageType === "prev" && firstVisible) {
        asignacionesQuery = query(
          collection(db, "asignaciones"),
          orderBy("fechaInicio", "desc"),
          endBefore(firstVisible),
          limitToLast(itemsPerPage),
        )
      } else {
        return
      }

      const asignacionesSnapshot = await getDocs(asignacionesQuery)

      if (asignacionesSnapshot.empty) {
        if (pageType === "next") {
          setCurrentPage(currentPage)
          return
        } else if (pageType === "prev") {
          setCurrentPage(currentPage)
          return
        }
      }

      // Obtener el total de documentos para calcular las páginas
      if (pageType === "first") {
        const countQuery = await getDocs(collection(db, "asignaciones"))
        setTotalCount(countQuery.size)
        setTotalPages(Math.ceil(countQuery.size / itemsPerPage))
      }

      // Guardar el primer y último documento visible para la paginación
      if (asignacionesSnapshot.docs.length > 0) {
        setFirstVisible(asignacionesSnapshot.docs[0])
        setLastVisible(asignacionesSnapshot.docs[asignacionesSnapshot.docs.length - 1])
      }

      const asignacionesData: Asignacion[] = []

      for (const docSnapshot of asignacionesSnapshot.docs) {
        const data = docSnapshot.data() as Omit<Asignacion, "id" | "estudiante" | "empresa">

        // Obtener datos del estudiante
        const estudianteDoc = await getDoc(doc(db, "estudiantes", data.estudianteId))
        const estudianteData = estudianteDoc.data()

        // Obtener datos de la empresa
        const empresaDoc = await getDoc(doc(db, "empresas", data.empresaId))
        const empresaData = empresaDoc.data()

        asignacionesData.push({
          id: docSnapshot.id,
          ...data,
          estudiante: {
            nombre: estudianteData?.nombre || "",
            apellidos: estudianteData?.apellidos || "",
          },
          empresa: {
            nombre: empresaData?.nombre || empresaData?.entidad || "Desconocida",
            entidad: empresaData?.entidad || "",
          },
        })
      }

      setAsignaciones(asignacionesData)

      if (pageType === "next") {
        setCurrentPage((prev) => prev + 1)
      } else if (pageType === "prev") {
        setCurrentPage((prev) => prev - 1)
      } else {
        setCurrentPage(1)
      }
    } catch (error: any) {
      console.error("Error fetching asignaciones:", error)
      setError(error.message || "Error al cargar asignaciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAsignaciones("first")
  }, [])

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchAsignaciones("next")
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchAsignaciones("prev")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (error) {
    return (
      <Card className="card-hover w-full h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary">Asignaciones recientes</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <p className="font-medium">Error al cargar asignaciones</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary">Asignaciones recientes</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        ) : asignaciones.length > 0 ? (
          <div className="space-y-4">
            {asignaciones.map((asignacion) => (
              <div
                key={asignacion.id}
                className="flex flex-col space-y-1 p-2 rounded-md hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="important-field">
                    {asignacion.estudiante?.nombre} {asignacion.estudiante?.apellidos}
                  </span>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full text-xs">
                    {formatDate(asignacion.fechaInicio)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Asignado a:{" "}
                  <span className="font-medium">
                    {asignacion.empresa?.nombre || asignacion.empresa?.entidad || "Desconocida"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No hay asignaciones recientes</p>
        )}
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex justify-between items-center pt-2 pb-4 mt-auto">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1 || loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
