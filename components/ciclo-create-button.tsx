"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, AlertCircle, Save } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { usePendingTasks } from "@/context/pending-tasks-context"
import { useRouter } from "next/navigation"

interface CicloCreateButtonProps {
  initialData?: any
  pendingTaskId?: string
}

export function CicloCreateButton({ initialData, pendingTaskId }: CicloCreateButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const { addPendingTask, removePendingTask } = usePendingTasks()
  const router = useRouter()

  const [formData, setFormData] = useState({
    nombre: "",
    nivel: "",
    familia: "",
    duracion: "",
    modalidad: "presencial", // Valor por defecto: presencial
  })

  // Inicializar con datos si se proporcionan
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

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

  const handleModalidadChange = (value: string) => {
    setFormData((prev) => ({ ...prev, modalidad: value }))
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
      await addDoc(collection(db, "ciclosFormativos"), {
        ...formData,
        duracion: duracion.toString(), // Asegurar que se guarda como string
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Ciclo formativo creado",
        description: "El ciclo formativo se ha creado correctamente.",
      })

      // Si hay un ID de tarea pendiente, eliminarla
      if (pendingTaskId) {
        await removePendingTask(pendingTaskId)
      }

      setOpen(false)
      setFormData({
        nombre: "",
        nivel: "",
        familia: "",
        duracion: "",
        modalidad: "presencial",
      })
      setError(null)

      // Si estamos en la página de pendientes, redirigir al dashboard
      if (pendingTaskId) {
        router.push("/dashboard/pendientes")
      }
    } catch (error) {
      console.error("Error al crear ciclo formativo:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el ciclo formativo. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePending = async () => {
    try {
      // Guardar como tarea pendiente
      await addPendingTask({
        type: "ciclo",
        title: formData.nombre || "Nuevo ciclo formativo",
        description: `${formData.nivel} - ${formData.familia}`,
        formData,
      })

      setOpen(false)
      // No resetear el formulario para que se pueda recuperar más tarde
    } catch (error) {
      console.error("Error al guardar tarea pendiente:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la tarea pendiente.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      {!pendingTaskId && (
        <Button onClick={() => setOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Ciclo Formativo
        </Button>
      )}

      <Dialog open={pendingTaskId ? true : open} onOpenChange={pendingTaskId ? undefined : setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {pendingTaskId ? "Continuar registro de ciclo formativo" : "Crear Nuevo Ciclo Formativo"}
            </DialogTitle>
            <DialogDescription>
              {pendingTaskId
                ? "Completa el registro del ciclo formativo que guardaste como pendiente."
                : "Añade un nuevo ciclo formativo al sistema."}
            </DialogDescription>
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

              <div className="space-y-2">
                <Label>Modalidad del ciclo</Label>
                <RadioGroup value={formData.modalidad} onValueChange={handleModalidadChange} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="presencial" id="ciclo-presencial" />
                    <Label htmlFor="ciclo-presencial" className="cursor-pointer">
                      Presencial
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="ciclo-online" />
                    <Label htmlFor="ciclo-online" className="cursor-pointer">
                      Online
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => (pendingTaskId ? router.push("/dashboard/pendientes") : setOpen(false))}
              >
                Cancelar
              </Button>
              <Button type="button" variant="secondary" onClick={handleSavePending} className="gap-2">
                <Save className="h-4 w-4" />
                Guardar como pendiente
              </Button>
              <Button type="submit" disabled={loading || !!error}>
                {loading ? "Creando..." : "Crear Ciclo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
