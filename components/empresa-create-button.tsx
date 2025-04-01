"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

export function EmpresaCreateButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nombre: "",
    cif: "",
    direccion: "",
    localidad: "",
    contactoNombre: "",
    contactoEmail: "",
    contactoTelefono: "",
    descripcion: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addDoc(collection(db, "empresas"), {
        ...formData,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Empresa creada",
        description: "La empresa se ha creado correctamente.",
      })

      setOpen(false)
      setFormData({
        nombre: "",
        cif: "",
        direccion: "",
        localidad: "",
        contactoNombre: "",
        contactoEmail: "",
        contactoTelefono: "",
        descripcion: "",
      })
    } catch (error) {
      console.error("Error al crear empresa:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la empresa. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Nueva Empresa
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Nueva Empresa</DialogTitle>
            <DialogDescription>Añade una nueva empresa colaboradora al sistema.</DialogDescription>
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
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Empresa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

