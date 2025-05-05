"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { ConfirmPasswordDialog } from "./confirm-password-dialog"
import { PermissionGuard } from "./permission-guard"
import { EmpresaEditDialog } from "./empresa-edit-dialog"

interface Empresa {
  id: string
  nombre?: string
  entidad?: string
  cif?: string
  email?: string
  telefono?: string
  direccion?: string
  contacto?: string
  modalidad?: string
  emailContacto?: string
  telefonoContacto?: string
}

export function EmpresasTable() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null)
  const { toast } = useToast()

  // Para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null)

  // Para confirmación de edición
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [empresaToConfirm, setEmpresaToConfirm] = useState<Empresa | null>(null)

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const empresasSnapshot = await getDocs(collection(db, "empresas"))
        const empresasData = empresasSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            nombre: data.entidad || data.nombre || "",
            entidad: data.entidad || data.nombre || "",
            cif: data.cif || "",
            email: data.emailContacto || data.email || "",
            telefono: data.telefonoContacto || data.telefono || "",
            direccion: data.direccionSedeCentral || data.direccion || "",
            contacto: data.nombreContacto || data.contacto || "",
            modalidad: data.modalidad || "presencial",
            emailContacto: data.emailContacto || "",
            telefonoContacto: data.telefonoContacto || "",
            ...data,
          }
        })

        setEmpresas(empresasData)
        setFilteredEmpresas(empresasData)
      } catch (error) {
        console.error("Error fetching empresas:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las empresas.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEmpresas()
  }, [toast])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmpresas(empresas)
    } else {
      const searchTermLower = searchTerm.toLowerCase()
      const filtered = empresas.filter(
        (empresa) =>
          (empresa.nombre && empresa.nombre.toLowerCase().includes(searchTermLower)) ||
          (empresa.entidad && empresa.entidad.toLowerCase().includes(searchTermLower)) ||
          (empresa.contacto && empresa.contacto.toLowerCase().includes(searchTermLower)) ||
          (empresa.email && empresa.email.toLowerCase().includes(searchTermLower)) ||
          (empresa.telefono && empresa.telefono.includes(searchTerm)) ||
          (empresa.modalidad && empresa.modalidad.toLowerCase().includes(searchTermLower)),
      )
      setFilteredEmpresas(filtered)
    }
  }, [searchTerm, empresas])

  const handleDelete = (empresa: Empresa) => {
    setEmpresaToDelete(empresa)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!empresaToDelete) return

    try {
      await deleteDoc(doc(db, "empresas", empresaToDelete.id))

      setEmpresas((prev) => prev.filter((empresa) => empresa.id !== empresaToDelete.id))
      setFilteredEmpresas((prev) => prev.filter((empresa) => empresa.id !== empresaToDelete.id))

      toast({
        title: "Empresa eliminada",
        description: "La empresa se ha eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error al eliminar empresa:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la empresa.",
        variant: "destructive",
      })
    } finally {
      setEmpresaToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  const handleEdit = (empresa: Empresa) => {
    setEmpresaToConfirm(empresa)
    setShowEditConfirm(true)
  }

  const handleEmpresaUpdated = (updatedEmpresa: Empresa) => {
    setEmpresas((prev) =>
      prev.map((empresa) => {
        if (empresa.id === updatedEmpresa.id) {
          return {
            ...updatedEmpresa,
            nombre: updatedEmpresa.entidad || updatedEmpresa.nombre || "",
            email: updatedEmpresa.emailContacto || updatedEmpresa.email || "",
            telefono: updatedEmpresa.telefonoContacto || updatedEmpresa.telefono || "",
            direccion: updatedEmpresa.direccionSedeCentral || updatedEmpresa.direccion || "",
            contacto: updatedEmpresa.nombreContacto || updatedEmpresa.contacto || "",
          }
        }
        return empresa
      }),
    )
    setEmpresaToEdit(null)
  }

  if (loading) {
    return <div>Cargando empresas...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          placeholder="Buscar empresas..."
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
              <TableHead>Contacto</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Modalidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmpresas.length > 0 ? (
              filteredEmpresas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell className="font-medium">{empresa.nombre || empresa.entidad}</TableCell>
                  <TableCell>{empresa.contacto || "-"}</TableCell>
                  <TableCell>{empresa.email || empresa.emailContacto || "-"}</TableCell>
                  <TableCell>{empresa.telefono || empresa.telefonoContacto || "-"}</TableCell>
                  <TableCell>
                    {empresa.modalidad && (
                      <Badge
                        variant={
                          empresa.modalidad === "online" || empresa.modalidad === "distancia" ? "secondary" : "default"
                        }
                      >
                        {empresa.modalidad === "online" || empresa.modalidad === "distancia" ? "Online" : "Presencial"}
                      </Badge>
                    )}
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
                          <DropdownMenuItem onClick={() => handleEdit(empresa)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </PermissionGuard>

                        <PermissionGuard permission="canDelete">
                          <DropdownMenuItem onClick={() => handleDelete(empresa)} className="text-red-500">
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
                  No se encontraron empresas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de edición */}
      {empresaToEdit && (
        <EmpresaEditDialog
          empresa={empresaToEdit}
          onSave={handleEmpresaUpdated}
          onCancel={() => setEmpresaToEdit(null)}
        />
      )}

      {/* Diálogo de confirmación para editar */}
      {showEditConfirm && empresaToConfirm && (
        <ConfirmPasswordDialog
          isOpen={showEditConfirm}
          onClose={() => {
            setShowEditConfirm(false)
            setEmpresaToConfirm(null)
          }}
          onConfirm={() => {
            setEmpresaToEdit(empresaToConfirm)
            setShowEditConfirm(false)
            setEmpresaToConfirm(null)
          }}
          title="Confirmar edición"
          description="¿Estás seguro de que quieres editar esta empresa? Esta acción requiere confirmación."
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      {showDeleteConfirm && empresaToDelete && (
        <ConfirmPasswordDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setEmpresaToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Confirmar eliminación"
          description={`¿Estás seguro de que quieres eliminar la empresa "${
            empresaToDelete.nombre || empresaToDelete.entidad
          }"? Esta acción no se puede deshacer.`}
        />
      )}
    </div>
  )
}
