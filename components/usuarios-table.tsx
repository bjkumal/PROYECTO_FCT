"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { TableSkeleton } from "@/components/table-skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { PermissionGuard } from "./permission-guard"

interface Usuario {
  id: string
  email: string
  role: string
  displayName?: string
  nombre?: string
  apellido?: string
}

export function UsuariosTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [newRole, setNewRole] = useState<string>("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"))
        const usuariosData: Usuario[] = []
        querySnapshot.forEach((doc) => {
          usuariosData.push({
            id: doc.id,
            email: doc.data().email,
            role: doc.data().role || "registrador",
            displayName: doc.data().displayName,
            nombre: doc.data().nombre,
            apellido: doc.data().apellido,
          })
        })
        setUsuarios(usuariosData)
        setLoading(false)
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los usuarios. Inténtalo de nuevo.",
        })
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [toast])

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.uid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No puedes eliminar tu propio usuario.",
      })
      return
    }

    try {
      await deleteDoc(doc(db, "users", userId))
      setUsuarios(usuarios.filter((usuario) => usuario.id !== userId))
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el usuario. Inténtalo de nuevo.",
      })
    }
  }

  const handleEditUser = (usuario: Usuario) => {
    setEditingUser(usuario)
    setNewRole(usuario.role)
    setIsEditDialogOpen(true)
  }

  const handleSaveRole = async () => {
    if (!editingUser || !newRole) return

    try {
      const userRef = doc(db, "users", editingUser.id)
      await updateDoc(userRef, {
        role: newRole,
      })

      setUsuarios(usuarios.map((u) => (u.id === editingUser.id ? { ...u, role: newRole } : u)))

      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado correctamente.",
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error al actualizar rol:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el rol. Inténtalo de nuevo.",
      })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "coordinador":
        return "outline"
      case "registrador":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getNombreCompleto = (usuario: Usuario) => {
    if (usuario.nombre && usuario.apellido) {
      return `${usuario.nombre} ${usuario.apellido}`
    } else if (usuario.nombre) {
      return usuario.nombre
    } else if (usuario.displayName) {
      return usuario.displayName
    } else {
      return "—"
    }
  }

  if (loading) {
    return <TableSkeleton columns={4} rows={5} />
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{getNombreCompleto(usuario)}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(usuario.role)}>{usuario.role}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <PermissionGuard permission="canEdit">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(usuario)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </PermissionGuard>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar rol de usuario</DialogTitle>
            <DialogDescription>Cambia el rol del usuario {editingUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="coordinador">Coordinador</SelectItem>
                  <SelectItem value="registrador">Registrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRole}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
