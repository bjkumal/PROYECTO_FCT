"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

interface Empresa {
  id: string
  nombre: string
  cif: string
  direccion: string
  localidad: string
  contactoNombre: string
  contactoEmail: string
  contactoTelefono: string
  descripcion?: string
}

interface EmpresaEditDialogProps {
  empresa: Empresa
  onSave: (empresa: Empresa) => void
  onCancel: () => void
}

export function EmpresaEditDialog({ empresa, onSave, onCancel }: EmpresaEditDialogProps) {
  const [formData, setFormData] = useState<Empresa>(empresa)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const empresaRef = doc(db, "empresas", empresa.id)
      await updateDoc(empresaRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Empresa actualizada",
        description: "La empresa se ha actualizado correctamente.",
      })

      onSave(formData)
    } catch (error) {
      console.error("Error al actualizar empresa:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la empresa. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la empresa</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cif">CIF</Label>
              <Input id="cif" name="cif" value={formData.cif} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localidad">Localidad</Label>
              <Input id="localidad" name="localidad" value={formData.localidad} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactoNombre">Nombre de contacto</Label>
              <Input
                id="contactoNombre"
                name="contactoNombre"
                value={formData.contactoNombre}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactoEmail">Email de contacto</Label>
              <Input
                id="contactoEmail"
                name="contactoEmail"
                type="email"
                value={formData.contactoEmail}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactoTelefono">Teléfono de contacto</Label>
              <Input
                id="contactoTelefono"
                name="contactoTelefono"
                value={formData.contactoTelefono}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

