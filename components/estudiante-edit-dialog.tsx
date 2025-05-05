"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { doc, updateDoc, collection, getDocs } from "firebase/firestore"

interface CicloFormativo {
  id: string
  nombre: string
}

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

interface EstudianteEditDialogProps {
  estudiante: Estudiante
  onSave: (estudiante: Estudiante) => void
  onCancel: () => void
}

export function EstudianteEditDialog({ estudiante, onSave, onCancel }: EstudianteEditDialogProps) {
  const [formData, setFormData] = useState<Estudiante>(estudiante)
  const [loading, setLoading] = useState(false)
  const [ciclos, setCiclos] = useState<CicloFormativo[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchCiclos = async () => {
      try {
        const ciclosSnapshot = await getDocs(collection(db, "ciclosFormativos"))
        const ciclosData = ciclosSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
        }))

        setCiclos(ciclosData)
      } catch (error) {
        console.error("Error fetching ciclos:", error)
      }
    }

    fetchCiclos()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "cicloFormativoId") {
      const selectedCiclo = ciclos.find((ciclo) => ciclo.id === value)
      if (selectedCiclo) {
        setFormData((prev) => ({
          ...prev,
          cicloFormativoNombre: selectedCiclo.nombre,
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const estudianteRef = doc(db, "estudiantes", estudiante.id)

      // Extraer cicloFormativoNombre para no guardarlo en Firestore
      const { cicloFormativoNombre, ...dataToUpdate } = formData

      await updateDoc(estudianteRef, {
        ...dataToUpdate,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Estudiante actualizado",
        description: "El estudiante se ha actualizado correctamente.",
      })

      onSave(formData)
    } catch (error) {
      console.error("Error al actualizar estudiante:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estudiante. Inténtalo de nuevo.",
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
          <DialogTitle>Editar Estudiante</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" name="dni" value={formData.dni} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cicloFormativoId">Ciclo Formativo</Label>
              <Select
                value={formData.cicloFormativoId}
                onValueChange={(value) => handleSelectChange("cicloFormativoId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un ciclo" />
                </SelectTrigger>
                <SelectContent>
                  {ciclos.map((ciclo) => (
                    <SelectItem key={ciclo.id} value={ciclo.id}>
                      {ciclo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select value={formData.curso} onValueChange={(value) => handleSelectChange("curso", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Primero</SelectItem>
                  <SelectItem value="2">Segundo</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
