"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Save } from "lucide-react"
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
import { collection, addDoc, getDocs } from "firebase/firestore"
import { usePendingTasks } from "@/context/pending-tasks-context"
import { useRouter } from "next/navigation"

interface CicloFormativo {
  id: string
  nombre: string
}

interface EstudianteCreateButtonProps {
  initialData?: any
  pendingTaskId?: string
}

export function EstudianteCreateButton({ initialData, pendingTaskId }: EstudianteCreateButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ciclos, setCiclos] = useState<CicloFormativo[]>([])
  const { toast } = useToast()
  const { addPendingTask, removePendingTask } = usePendingTasks()
  const router = useRouter()

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    dni: "",
    email: "",
    telefono: "",
    cicloFormativoId: "",
    curso: "",
  })

  // Inicializar con datos si se proporcionan
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addDoc(collection(db, "estudiantes"), {
        ...formData,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Estudiante creado",
        description: "El estudiante se ha creado correctamente.",
      })

      // Si hay un ID de tarea pendiente, eliminarla
      if (pendingTaskId) {
        await removePendingTask(pendingTaskId)
      }

      setOpen(false)
      setFormData({
        nombre: "",
        apellidos: "",
        dni: "",
        email: "",
        telefono: "",
        cicloFormativoId: "",
        curso: "",
      })

      // Si estamos en la página de pendientes, redirigir al dashboard
      if (pendingTaskId) {
        router.push("/dashboard/pendientes")
      }
    } catch (error) {
      console.error("Error al crear estudiante:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el estudiante. Inténtalo de nuevo.",
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
        type: "estudiante",
        title: `${formData.nombre} ${formData.apellidos}`,
        description: formData.dni || "Nuevo estudiante",
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
          Nuevo Estudiante
        </Button>
      )}

      <Dialog open={pendingTaskId ? true : open} onOpenChange={pendingTaskId ? undefined : setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{pendingTaskId ? "Continuar registro de estudiante" : "Crear Nuevo Estudiante"}</DialogTitle>
            <DialogDescription>
              {pendingTaskId
                ? "Completa el registro del estudiante que guardaste como pendiente."
                : "Añade un nuevo estudiante al sistema."}
            </DialogDescription>
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
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Estudiante"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
