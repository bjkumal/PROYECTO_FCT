"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { doc, updateDoc, collection, getDocs, getDoc } from "firebase/firestore"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Estudiante {
  id: string
  nombre: string
  apellidos: string
}

interface Empresa {
  id: string
  nombre: string
}

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
  }
}

interface AsignacionEditDialogProps {
  asignacion: Asignacion
  onSave: (asignacion: Asignacion) => void
  onCancel: () => void
}

export function AsignacionEditDialog({ asignacion, onSave, onCancel }: AsignacionEditDialogProps) {
  const [formData, setFormData] = useState<Asignacion>({
    ...asignacion,
    horas: asignacion.horas || 0,
  })
  const [loading, setLoading] = useState(false)
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(
    asignacion.fechaInicio ? new Date(asignacion.fechaInicio) : undefined,
  )
  const [fechaFin, setFechaFin] = useState<Date | undefined>(
    asignacion.fechaFin ? new Date(asignacion.fechaFin) : undefined,
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch estudiantes
        const estudiantesSnapshot = await getDocs(collection(db, "estudiantes"))
        const estudiantesData = estudiantesSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
          apellidos: doc.data().apellidos,
        }))

        // Fetch empresas
        const empresasSnapshot = await getDocs(collection(db, "empresas"))
        const empresasData = empresasSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
        }))

        setEstudiantes(estudiantesData)
        setEmpresas(empresasData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (fechaInicio) {
      setFormData((prev) => ({
        ...prev,
        fechaInicio: fechaInicio.toISOString().split("T")[0],
      }))
    }

    if (fechaFin) {
      setFormData((prev) => ({
        ...prev,
        fechaFin: fechaFin.toISOString().split("T")[0],
      }))
    }
  }, [fechaInicio, fechaFin])

  const handleSelectChange = async (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "estudianteId") {
      try {
        const estudianteDoc = await getDoc(doc(db, "estudiantes", value))
        if (estudianteDoc.exists()) {
          const data = estudianteDoc.data()
          setFormData((prev) => ({
            ...prev,
            estudiante: {
              nombre: data.nombre,
              apellidos: data.apellidos,
            },
          }))
        }
      } catch (error) {
        console.error("Error fetching estudiante:", error)
      }
    } else if (name === "empresaId") {
      try {
        const empresaDoc = await getDoc(doc(db, "empresas", value))
        if (empresaDoc.exists()) {
          const data = empresaDoc.data()
          setFormData((prev) => ({
            ...prev,
            empresa: {
              nombre: data.nombre,
            },
          }))
        }
      } catch (error) {
        console.error("Error fetching empresa:", error)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Validación para el campo de horas
    if (name === "horas") {
      // Permitir solo números positivos
      const numValue = Number.parseInt(value)
      if (isNaN(numValue) || numValue < 0) {
        setError("Las horas deben ser un número positivo")
        return
      } else {
        setError(null)
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "horas" ? Number.parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.estudianteId || !formData.empresaId || !formData.fechaInicio || !formData.fechaFin) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    // Validar que las horas sean un número positivo
    if (typeof formData.horas !== "number" || formData.horas < 0) {
      setError("Las horas deben ser un número positivo")
      return
    }

    setLoading(true)

    try {
      // Verificar que el estudiante existe
      const estudianteDoc = await getDoc(doc(db, "estudiantes", formData.estudianteId))
      if (!estudianteDoc.exists()) {
        throw new Error("El estudiante seleccionado no existe")
      }

      // Verificar que la empresa existe
      const empresaDoc = await getDoc(doc(db, "empresas", formData.empresaId))
      if (!empresaDoc.exists()) {
        throw new Error("La empresa seleccionada no existe")
      }

      const asignacionRef = doc(db, "asignaciones", asignacion.id)

      // Extraer estudiante y empresa para no guardarlos en Firestore
      const { estudiante, empresa, ...dataToUpdate } = formData

      await updateDoc(asignacionRef, {
        ...dataToUpdate,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Asignación actualizada",
        description: "La asignación se ha actualizado correctamente.",
      })

      onSave(formData)
    } catch (error) {
      console.error("Error al actualizar asignación:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la asignación. Inténtalo de nuevo.",
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
          <DialogTitle>Editar Asignación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estudianteId">Estudiante</Label>
              <Select
                value={formData.estudianteId}
                onValueChange={(value) => handleSelectChange("estudianteId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {estudiantes.map((estudiante) => (
                    <SelectItem key={estudiante.id} value={estudiante.id}>
                      {estudiante.nombre} {estudiante.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresaId">Empresa</Label>
              <Select value={formData.empresaId} onValueChange={(value) => handleSelectChange("empresaId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas">Horas a realizar</Label>
              <Input
                id="horas"
                name="horas"
                type="number"
                min="0"
                value={formData.horas}
                onChange={handleInputChange}
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
              <Label htmlFor="fechaInicio">Fecha de inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaInicio ? (
                      format(fechaInicio, "PP", { locale: es })
                    ) : (
                      <span>Selecciona la fecha de inicio</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={fechaInicio} onSelect={setFechaInicio} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaFin ? format(fechaFin, "PP", { locale: es }) : <span>Selecciona la fecha de fin</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaFin}
                    onSelect={setFechaFin}
                    initialFocus
                    disabled={(date) => (fechaInicio ? date < fechaInicio : false)}
                  />
                </PopoverContent>
              </Popover>
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

