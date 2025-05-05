"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { EstudianteEditDialog } from "./estudiante-edit-dialog"
import { ConfirmPasswordDialog } from "./confirm-password-dialog"
import { PermissionGuard } from "./permission-guard"

interface Estudiante {
  id: string
  nombre: string
  apellidos: string
  dni: string
  email: string
  telefono: string
  cicloFormativoId: string
  curso: string
  cicloFormativoNombre?: string
}

export function EstudiantesTable() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [filteredEstudiantes, setFilteredEstudiantes] = useState<Estudiante[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [estudianteToEdit, setEstudianteToEdit] = useState<Estudiante | null>(null)
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [estudianteToConfirm, setEstudianteToConfirm] = useState<Estudiante | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [estudianteToDelete, setEstudianteToDelete] = useState<Estudiante | null>(null)

  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        const estudiantesSnapshot = await getDocs(collection(db, "estudiantes"))
        const estudiantesData = []

        for (const docSnapshot of estudiantesSnapshot.docs) {
          const data = docSnapshot.data() as Omit<Estudiante, "id" | "cicloFormativoNombre">
          let cicloFormativoNombre = "No asignado"

          if (data.cicloFormativoId) {
            try {
              const cicloDoc = await getDoc(doc(db, "ciclosFormativos", data.cicloFormativoId))
              if (cicloDoc.exists()) {
                cicloFormativoNombre = cicloDoc.data().nombre
              }
            } catch (error) {
              console.error("Error fetching ciclo:", error)
            }
          }

          estudiantesData.push({
            id: docSnapshot.id,
            ...data,
            cicloFormativoNombre,
          })
        }

        setEstudiantes(estudiantesData)
        setFilteredEstudiantes(estudiantesData)
      } catch (error) {
        console.error("Error fetching estudiantes:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los estudiantes.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEstudiantes()
  }, [toast])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEstudiantes(estudiantes)
    } else {
      const filtered = estudiantes.filter(
        (estudiante) =>
          estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          estudiante.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
          estudiante.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
          estudiante.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (estudiante.cicloFormativoNombre &&
            estudiante.cicloFormativoNombre.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredEstudiantes(filtered)
    }
  }, [searchTerm, estudiantes])

  const handleDelete = async (estudiante: Estudiante) => {
    setEstudianteToDelete(estudiante)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!estudianteToDelete) return

    try {
      await deleteDoc(doc(db, "estudiantes", estudianteToDelete.id))

      setEstudiantes((prev) => prev.filter((estudiante) => estudiante.id !== estudianteToDelete.id))

      toast({
        title: "Estudiante eliminado",
        description: "El estudiante se ha eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error deleting estudiante:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el estudiante.",
        variant: "destructive",
      })
    } finally {
      setEstudianteToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  const handleEstudianteUpdated = (updatedEstudiante: Estudiante) => {
    setEstudiantes((prev) =>
      prev.map((estudiante) => (estudiante.id === updatedEstudiante.id ? updatedEstudiante : estudiante)),
    )
    setEstudianteToEdit(null)
  }

  if (loading) {
    return <div>Cargando estudiantes...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          placeholder="Buscar estudiantes..."
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
              <TableHead>DNI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ciclo Formativo</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEstudiantes.length > 0 ? (
              filteredEstudiantes.map((estudiante) => (
                <TableRow key={estudiante.id}>
                  <TableCell className="font-medium">
                    {estudiante.nombre} {estudiante.apellidos}
                  </TableCell>
                  <TableCell>{estudiante.dni}</TableCell>
                  <TableCell>{estudiante.email}</TableCell>
                  <TableCell>{estudiante.cicloFormativoNombre}</TableCell>
                  <TableCell>
                    {estudiante.curso === "1" ? "Primero" : estudiante.curso === "2" ? "Segundo" : estudiante.curso}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <PermissionGuard permission="canEdit">
                          <DropdownMenuItem
                            onClick={() => {
                              setEstudianteToConfirm(estudiante)
                              setShowConfirmDialog(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </PermissionGuard>

                        <PermissionGuard permission="canDelete">
                          <DropdownMenuItem onClick={() => handleDelete(estudiante)} className="text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </PermissionGuard>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No se encontraron estudiantes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {estudianteToEdit && (
        <EstudianteEditDialog
          estudiante={estudianteToEdit}
          onSave={handleEstudianteUpdated}
          onCancel={() => setEstudianteToEdit(null)}
        />
      )}
      {showConfirmDialog && estudianteToConfirm && (
        <ConfirmPasswordDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false)
            setEstudianteToConfirm(null)
          }}
          onConfirm={() => {
            setEstudianteToEdit(estudianteToConfirm)
            setShowConfirmDialog(false)
            setEstudianteToConfirm(null)
          }}
          title="Confirmar edición"
          description="¿Estás seguro de que quieres editar este estudiante? Esta acción requiere confirmación."
        />
      )}
      {showDeleteConfirm && estudianteToDelete && (
        <ConfirmPasswordDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setEstudianteToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Confirmar eliminación"
          description={`¿Estás seguro de que quieres eliminar al estudiante ${estudianteToDelete.nombre} ${estudianteToDelete.apellidos}? Esta acción no se puede deshacer.`}
        />
      )}
    </div>
  )
}
