"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CicloFormativo {
  id: string
  nombre: string
  nivel: string
  familia: string
  duracion: string
}

interface CicloEditDialogProps {
  ciclo: CicloFormativo
  onSave: (ciclo: CicloFormativo) => void
  onCancel: () => void
}

export function CicloEditDialog({ ciclo, onSave, onCancel }: CicloEditDialogProps) {
  const [formData, setFormData] = useState<CicloFormativo>(ciclo)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Validación para el campo de duración
    if (name === "duracion") {
      const numValue = Number.parseInt(value)
      if (value && (isNaN(numValue) || numValue < 0)) {
        setError("La duración debe ser un número positivo")
        return
      } else {
        setError(null)
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que la duración sea un número positivo
    const duracion = Number.parseInt(formData.duracion)
    if (isNaN(duracion) || duracion < 0) {
      setError("La duración debe ser un número positivo")
      return
    }

    setLoading(true)

    try {
      const cicloRef = doc(db, "ciclosFormativos", ciclo.id)
      await updateDoc(cicloRef, {
        ...formData,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Ciclo formativo actualizado",
        description: "El ciclo formativo se ha actualizado correctamente.",
      })

      onSave(formData)
    } catch (error) {
      console.error("Error al actualizar ciclo formativo:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el ciclo formativo. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Ciclo Formativo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del ciclo</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel</Label>
              <Select value={formData.nivel} onValueChange={(value) => handleSelectChange("nivel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Básico">Formación Profesional Básica</SelectItem>
                  <SelectItem value="Medio">Grado Medio</SelectItem>
                  <SelectItem value="Superior">Grado Superior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="familia">Familia profesional</Label>
              <Input id="familia" name="familia" value={formData.familia} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracion">Duración (horas)</Label>
              <Input
                id="duracion"
                name="duracion"
                type="number"
                min="0"
                value={formData.duracion}
                onChange={handleChange}
                required
              />
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !!error}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

