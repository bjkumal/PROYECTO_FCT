"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { EmpresaEditDialog } from "./empresa-edit-dialog"
import { ConfirmPasswordDialog } from "./confirm-password-dialog"
import { Badge } from "@/components/ui/badge"

interface Empresa {
  id: string
  nombre: string
  cif: string
  direccion: string
  localidad: string
  contactoNombre: string
  contactoEmail: string
  contactoTelefono: string
  modalidad?: string
}

export function EmpresasTable() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null)
  const { toast } = useToast()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null)

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const empresasSnapshot = await getDocs(collection(db, "empresas"))
        const empresasData = empresasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Empresa, "id">),
        }))

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
      const filtered = empresas.filter(
        (empresa) =>
          empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          empresa.cif.toLowerCase().includes(searchTerm.toLowerCase()) ||
          empresa.localidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (empresa.modalidad && empresa.modalidad.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredEmpresas(filtered)
    }
  }, [searchTerm, empresas])

  const handleDelete = async (empresa: Empresa) => {
    setEmpresaToDelete(empresa)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!empresaToDelete) return

    try {
      await deleteDoc(doc(db, "empresas", empresaToDelete.id))
      setEmpresas((prev) => prev.filter((empresa) => empresa.id !== empresaToDelete.id))
      toast({
        title: "Empresa eliminada",
        description: "La empresa se ha eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error deleting empresa:", error)
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

  const handleEmpresaUpdated = (updatedEmpresa: Empresa) => {
    setEmpresas((prev) => prev.map((empresa) => (empresa.id === updatedEmpresa.id ? updatedEmpresa : empresa)))
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

      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">CIF</TableHead>
              <TableHead className="font-semibold">Localidad</TableHead>
              <TableHead className="font-semibold">Modalidad</TableHead>
              <TableHead className="font-semibold">Contacto</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmpresas.length > 0 ? (
              filteredEmpresas.map((empresa) => (
                <TableRow key={empresa.id} className="table-row-alt hover:bg-muted/30">
                  <TableCell className="important-field">{empresa.nombre}</TableCell>
                  <TableCell>{empresa.cif}</TableCell>
                  <TableCell>{empresa.localidad}</TableCell>
                  <TableCell>
                    <Badge variant={empresa.modalidad === "online" ? "secondary" : "default"}>
                      {empresa.modalidad === "online" ? "Online" : "Presencial"}
                    </Badge>
                  </TableCell>
                  <TableCell>{empresa.contactoNombre}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEmpresa(empresa)
                            setShowConfirmDialog(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4 text-blue-500" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(empresa)} className="text-red-500">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No se encontraron empresas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {empresaToEdit && (
        <EmpresaEditDialog
          empresa={empresaToEdit}
          onSave={handleEmpresaUpdated}
          onCancel={() => setEmpresaToEdit(null)}
        />
      )}
      {showConfirmDialog && selectedEmpresa && (
        <ConfirmPasswordDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={() => {
            setShowConfirmDialog(false)
            setEmpresaToEdit(selectedEmpresa)
          }}
          title="Confirmar edición"
          description="¿Estás seguro de que quieres editar esta empresa? Esta acción requiere confirmación."
        />
      )}
      {showDeleteConfirm && empresaToDelete && (
        <ConfirmPasswordDialog
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false)
            setEmpresaToDelete(null)
          }}
          onConfirm={confirmDelete}
          title="Confirmar eliminación"
          description={`¿Estás seguro de que quieres eliminar la empresa ${empresaToDelete.nombre}? Esta acción no se puede deshacer.`}
        />
      )}
    </div>
  )
}

