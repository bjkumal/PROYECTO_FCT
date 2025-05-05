"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, MoreHorizontal, FileText, Trash2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { AsignacionEditDialog } from "./asignacion-edit-dialog"
import { AsignacionDetallesDialog } from "./asignacion-detalles-dialog"
import { ConfirmPasswordDialog } from "./confirm-password-dialog"
import { Badge } from "@/components/ui/badge"
import { PermissionGuard } from "./permission-guard"

interface Asignacion {
  id: string
  estudianteId: string
  empresaId: string
  fechaInicio: string
  fechaFin: string
  horas?: number
  estudiante?: {
    nombre: string
    apellidos: string
  }
  empresa?: {
    nombre: string
    entidad?: string
  }
}

export function AsignacionesTable() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [filteredAsignaciones, setFilteredAsignaciones] = useState<Asignacion[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [asignacionToEdit, setAsignacionToEdit] = useState<Asignacion | null>(null)
  const [asignacionToView, setAsignacionToView] = useState<Asignacion | null>(null)
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [asignacionToConfirm, setAsignacionToConfirm] = useState<Asignacion | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [asignacionToDelete, setAsignacionToDelete] = useState<Asignacion | null>(null)

  useEffect(() => {
    const fetchAsignaciones = async () => {
      try {
        const asignacionesSnapshot = await getDocs(collection(db, "asignaciones"))
        const asignacionesData = []

        for (const docSnapshot of asignacionesSnapshot.docs) {
          const data = docSnapshot.data() as Omit<Asignacion, "id" | "estudiante" | "empresa">

          // Obtener datos del estudiante
          let estudiante = { nombre: "Desconocido", apellidos: "" }
          try {
            const estudianteDoc = await getDoc(doc(db, "estudiantes", data.estudianteId))
            if (estudianteDoc.exists()) {
              const estudianteData = estudianteDoc.data()
              estudiante = {
                nombre: estudianteData.nombre || "Desconocido",
                apellidos: estudianteData.apellidos || "",
              }
            }
          } catch (error) {
            console.error("Error fetching estudiante:", error)
          }

          // Obtener datos de la empresa
          let empresa = { nombre: "Desconocida", entidad: "" }
          try {
            const empresaDoc = await getDoc(doc(db, "empresas", data.empresaId))
            if (empresaDoc.exists()) {
              const empresaData = empresaDoc.data()
              empresa = {
                nombre: empresaData.nombre || empresaData.entidad || "Desconocida",
                entidad: empresaData.entidad || "",
              }
            }
          } catch (error) {
            console.error("Error fetching empresa:", error)
          }

          asignacionesData.push({
            id: docSnapshot.id,
            ...data,
            estudiante,
            empresa,
          })
        }

        setAsignaciones(asignacionesData)
        setFilteredAsignaciones(asignacionesData)
      } catch (error) {
        console.error("Error fetching asignaciones:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las asignaciones.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAsignaciones()
  }, [toast])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAsignaciones(asignaciones)
    } else {
      const filtered = asignaciones.filter(
        (asignacion) =>
          (asignacion.estudiante?.nombre &&
            asignacion.estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (asignacion.estudiante?.apellidos &&
            asignacion.estudiante.apellidos.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (asignacion.empresa?.nombre && asignacion.empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (asignacion.empresa?.entidad &&
            asignacion.empresa.entidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
          asignacion.fechaInicio.includes(searchTerm) ||
          asignacion.fechaFin.includes(searchTerm),
      )
      setFilteredAsignaciones(filtered)
    }
  }, [searchTerm, asignaciones])

  const handleAsignacionUpdated = (updatedAsignacion: Asignacion) => {
    setAsignaciones((prev) =>
      prev.map((asignacion) => (asignacion.id === updatedAsignacion.id ? updatedAsignacion : asignacion)),
    )
    setAsignacionToEdit(null)
  }

  const handleDelete = async (asignacion: Asignacion) => {
    setAsignacionToDelete(asignacion)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!asignacionToDelete) return

    try {
      await deleteDoc(doc(db, "asignaciones", asignacionToDelete.id))

      setAsignaciones((prev) => prev.filter((asignacion) => asignacion.id !== asignacionToDelete.id))

      toast({
        title: "Asignación eliminada",
        description: "La asignación se ha eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error deleting asignacion:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la asignación.",
        variant: "destructive",
      })
    } finally {
      setAsignacionToDelete(null)
      setShowDeleteConfirm(false)
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

  if (loading) {
    return <div>Cargando asignaciones...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          placeholder="Buscar asignaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAsignaciones.length > 0 ? (
              filteredAsignaciones.map((asignacion) => (
                <TableRow key={asignacion.id}>
                  <TableCell className="font-medium">
                    {asignacion.estudiante?.nombre} {asignacion.estudiante?.apellidos}
                  </TableCell>
                  <TableCell>{asignacion.empresa?.nombre || asignacion.empresa?.entidad || "Desconocida"}</TableCell>
                  <TableCell>{formatDate(asignacion.fechaInicio)}</TableCell>
                  <TableCell>{formatDate(asignacion.fechaFin)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {asignacion.horas || 0} h
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setAsignacionToView(asignacion)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>

                        <PermissionGuard permission="canEdit">
                          <DropdownMenuItem
                            onClick={() => {
                              setAsignacionToConfirm(asignacion)
                              setShowConfirmDialog(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </PermissionGuard>

                        <PermissionGuard permission="canDelete">
                          <DropdownMenuItem onClick={() => handleDelete(asignacion)} className="text-red-500">
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
                  No se encontraron asignaciones
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {asignacionToEdit && (
        <AsignacionEditDialog
          asignacion={asignacionToEdit}
          onSave={handleAsignacionUpdated}
          onCancel={() => setAsignacionToEdit(null)}
        />
      )}

      {asignacionToView && (
        <AsignacionDetallesDialog asignacion={asignacionToView} onClose={() => setAsignacionToView(null)} />
      )}
      {showConfirmDialog && asignacionToConfirm && (
        <ConfirmPasswordDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false)
            setAsignacionToConfirm(null)
          }}
          onConfirm={() => {
            setAsignacionToEdit(asignacionToConfirm)
            setShowConfirmDialog(false)
            setAsignacionToConfirm(null)
          }}
          title="Confirmar edición"
          description="¿Estás seguro de que quieres editar esta asignación? Esta acción requiere confirmación."
        />
      )}
      {showDeleteConfirm && asignacionToDelete && (
        <ConfirmPasswordDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setAsignacionToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Confirmar eliminación"
          description={`¿Estás seguro de que quieres eliminar esta asignación? Esta acción no se puede deshacer.`}
        />
      )}
    </div>
  )
}
