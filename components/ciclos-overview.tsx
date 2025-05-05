"use client"

import { useEffect, useState } from "react"
import { useFirebase } from "@/hooks/use-firebase"
import { collection, getDocs } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CicloFormativo {
  id: string
  nombre: string
  nivel: string
  familia: string
}

export function CiclosOverview() {
  const { db, error: firebaseError, loading: firebaseLoading } = useFirebase()
  const [ciclos, setCiclos] = useState<CicloFormativo[]>([])
  const [allCiclos, setAllCiclos] = useState<CicloFormativo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    if (firebaseLoading) return

    if (firebaseError) {
      setError(firebaseError.message)
      setLoading(false)
      return
    }

    if (!db) {
      setError("No se pudo inicializar Firebase")
      setLoading(false)
      return
    }

    const fetchCiclos = async () => {
      try {
        const ciclosSnapshot = await getDocs(collection(db, "ciclosFormativos"))
        const ciclosData = ciclosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CicloFormativo, "id">),
        }))

        setAllCiclos(ciclosData)
        setTotalPages(Math.ceil(ciclosData.length / itemsPerPage))

        // Mostrar solo los primeros 5 elementos (o menos si hay menos)
        setCiclos(ciclosData.slice(0, itemsPerPage))
      } catch (err: any) {
        console.error("Error fetching ciclos:", err)
        setError(err.message || "Error al cargar ciclos formativos")
      } finally {
        setLoading(false)
      }
    }

    fetchCiclos()
  }, [db, firebaseError, firebaseLoading])

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      const startIndex = (nextPage - 1) * itemsPerPage
      setCiclos(allCiclos.slice(startIndex, startIndex + itemsPerPage))
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      const startIndex = (prevPage - 1) * itemsPerPage
      setCiclos(allCiclos.slice(startIndex, startIndex + itemsPerPage))
    }
  }

  if (error) {
    return (
      <Card className="card-hover w-full h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-primary">Ciclos Formativos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Error al cargar ciclos formativos</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary">Ciclos Formativos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        ) : ciclos.length > 0 ? (
          <div className="space-y-3">
            {ciclos.map((ciclo) => (
              <div
                key={ciclo.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium">{ciclo.nombre}</span>
                <span
                  className={`text-sm rounded-full px-2 py-1 text-xs ${
                    ciclo.nivel === "Superior"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : ciclo.nivel === "Medio"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  }`}
                >
                  {ciclo.nivel}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No hay ciclos formativos registrados</p>
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
