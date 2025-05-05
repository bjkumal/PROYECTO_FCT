"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, MoreHorizontal } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { CicloEditDialog } from "./ciclo-edit-dialog"
import { Badge } from "@/components/ui/badge"
import { ConfirmPasswordDialog } from "./confirm-password-dialog"
import { PermissionGuard } from "./permission-guard"

interface CicloFormativo {
  id: string
  nombre: string
  nivel: string
  familia: string
  duracion: string
  modalidad?: string
}

export function CiclosTable() {
  const [ciclos, setCiclos] = useState<CicloFormativo[]>([])
  const [filteredCiclos, setFilteredCiclos] = useState<CicloFormativo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [cicloToEdit, setCicloToEdit] = useState<CicloFormativo | null>(null)
  const { toast } = useToast()

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [cicloToConfirm, setCicloToConfirm] = useState<CicloFormativo | null>(null)

  useEffect(() => {
    const fetchCiclos = async () => {
      try {
        const ciclosSnapshot = await getDocs(collection(db, "ciclosFormativos"))
        const ciclosData = ciclosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CicloFormativo, "id">),
        }))

        setCiclos(ciclosData)
        setFilteredCiclos(ciclosData)
      } catch (error) {
        console.error("Error fetching ciclos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los ciclos formativos.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCiclos()
  }, [toast])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCiclos(ciclos)
    } else {
      const filtered = ciclos.filter(
        (ciclo) =>
          ciclo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ciclo.familia.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ciclo.nivel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ciclo.modalidad && ciclo.modalidad.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredCiclos(filtered)
    }
  }, [searchTerm, ciclos])

  const handleCicloUpdated = (updatedCiclo: CicloFormativo) => {
    setCiclos((prev) => prev.map((ciclo) => (ciclo.id === updatedCiclo.id ? updatedCiclo : ciclo)))
    setCicloToEdit(null)
  }

  const getNivelBadgeVariant = (nivel: string) => {
    switch (nivel) {
      case "Básico":
        return "secondary"
      case "Medio":
        return "default"
      case "Superior":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <div>Cargando ciclos formativos...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          placeholder="Buscar ciclos formativos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Familia Profesional</TableHead>
              <TableHead>Modalidad</TableHead>
              <TableHead>Duración (horas)</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCiclos.length > 0 ? (
              filteredCiclos.map((ciclo) => (
                <TableRow key={ciclo.id}>
                  <TableCell className="font-medium">{ciclo.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={getNivelBadgeVariant(ciclo.nivel)}>{ciclo.nivel}</Badge>
                  </TableCell>
                  <TableCell>{ciclo.familia}</TableCell>
                  <TableCell>
                    <Badge variant={ciclo.modalidad === "online" ? "secondary" : "default"}>
                      {ciclo.modalidad === "online" ? "Online" : "Presencial"}
                    </Badge>
                  </TableCell>
                  <TableCell>{ciclo.duracion}</TableCell>
                  <TableCell className="text-right">
                    <PermissionGuard permission="canEdit">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setCicloToConfirm(ciclo)
                              setShowConfirmDialog(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </PermissionGuard>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No se encontraron ciclos formativos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {cicloToEdit && (
        <CicloEditDialog ciclo={cicloToEdit} onSave={handleCicloUpdated} onCancel={() => setCicloToEdit(null)} />
      )}
      {showConfirmDialog && cicloToConfirm && (
        <ConfirmPasswordDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false)
            setCicloToConfirm(null)
          }}
          onConfirm={() => {
            setCicloToEdit(cicloToConfirm)
            setShowConfirmDialog(false)
            setCicloToConfirm(null)
          }}
          title="Confirmar edición"
          description="¿Estás seguro de que quieres editar este ciclo formativo? Esta acción requiere confirmación."
        />
      )}
    </div>
  )
}
