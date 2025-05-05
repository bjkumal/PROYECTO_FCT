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
import { CalendarIcon, AlertCircle, Building, User, CalendarPlus2Icon as CalendarIcon2, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"

interface Estudiante {
  id: string
  nombre: string
  apellidos: string
  cicloFormativoId?: string
}

interface Empresa {
  id: string
  nombre: string
  entidad?: string
}

interface CicloFormativo {
  id: string
  nombre: string
  modalidad?: string
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
  const [cicloSeleccionado, setCicloSeleccionado] = useState<CicloFormativo | null>(null)
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null)

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(
    asignacion.fechaInicio ? new Date(asignacion.fechaInicio) : undefined,
  )
  const [fechaFin, setFechaFin] = useState<Date | undefined>(
    asignacion.fechaFin ? new Date(asignacion.fechaFin) : undefined,
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch estudiantes
        const estudiantesSnapshot = await getDocs(collection(db, "estudiantes"))
        const estudiantesData = estudiantesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Estudiante, "id">),
        }))

        // Fetch empresas
        const empresasSnapshot = await getDocs(collection(db, "empresas"))
        const empresasData = empresasSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().entidad || doc.data().nombre || "Empresa sin nombre",
          ...(doc.data() as Omit<Empresa, "id" | "nombre">),
        }))

        setEstudiantes(estudiantesData)
        setEmpresas(empresasData) // Mostramos todas las empresas sin filtrar

        // Cargar estudiante seleccionado
        if (asignacion.estudianteId) {
          const estudiante = estudiantesData.find((e) => e.id === asignacion.estudianteId)
          if (estudiante) {
            setEstudianteSeleccionado(estudiante)

            // Cargar ciclo formativo si existe
            if (estudiante.cicloFormativoId) {
              try {
                const cicloDoc = await getDoc(doc(db, "ciclosFormativos", estudiante.cicloFormativoId))
                if (cicloDoc.exists()) {
                  setCicloSeleccionado({
                    id: cicloDoc.id,
                    ...(cicloDoc.data() as Omit<CicloFormativo, "id">),
                  })
                }
              } catch (error) {
                console.error("Error al cargar ciclo formativo:", error)
              }
            }
          }
        }

        // Cargar empresa seleccionada
        if (asignacion.empresaId) {
          const empresa = empresasData.find((e) => e.id === asignacion.empresaId)
          if (empresa) {
            setEmpresaSeleccionada(empresa)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [asignacion.estudianteId, asignacion.empresaId])

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
        const estudiante = estudiantes.find((e) => e.id === value)
        if (estudiante) {
          setEstudianteSeleccionado(estudiante)

          // Cargar ciclo formativo si existe
          if (estudiante.cicloFormativoId) {
            try {
              const cicloDoc = await getDoc(doc(db, "ciclosFormativos", estudiante.cicloFormativoId))
              if (cicloDoc.exists()) {
                setCicloSeleccionado({
                  id: cicloDoc.id,
                  ...(cicloDoc.data() as Omit<CicloFormativo, "id">),
                })
              }
            } catch (error) {
              console.error("Error al cargar ciclo formativo:", error)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching estudiante:", error)
      }
    } else if (name === "empresaId") {
      try {
        const empresa = empresas.find((e) => e.id === value)
        if (empresa) {
          setEmpresaSeleccionada(empresa)
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Asignación</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="space-y-5">
              {/* Sección de Estudiante */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="estudianteId" className="text-base font-medium">
                    Estudiante
                  </Label>
                </div>
                <Select
                  value={formData.estudianteId}
                  onValueChange={(value) => handleSelectChange("estudianteId", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un estudiante">
                      {estudianteSeleccionado
                        ? `${estudianteSeleccionado.nombre} ${estudianteSeleccionado.apellidos}`
                        : "Selecciona un estudiante"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {estudiantes.map((estudiante) => (
                      <SelectItem key={estudiante.id} value={estudiante.id}>
                        {estudiante.nombre} {estudiante.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {estudianteSeleccionado && (
                  <div className="text-sm text-muted-foreground">
                    Estudiante seleccionado:{" "}
                    <span className="font-medium">
                      {estudianteSeleccionado.nombre} {estudianteSeleccionado.apellidos}
                    </span>
                  </div>
                )}
              </div>

              {/* Información del Ciclo */}
              {cicloSeleccionado && (
                <Card className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Ciclo formativo</h4>
                        <p className="text-sm text-muted-foreground">{cicloSeleccionado.nombre}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sección de Empresa */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="empresaId" className="text-base font-medium">
                    Empresa
                  </Label>
                </div>
                <Select value={formData.empresaId} onValueChange={(value) => handleSelectChange("empresaId", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una empresa">
                      {empresaSeleccionada ? empresaSeleccionada.nombre : "Selecciona una empresa"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {empresaSeleccionada && (
                  <div className="text-sm text-muted-foreground">
                    Empresa seleccionada: <span className="font-medium">{empresaSeleccionada.nombre}</span>
                  </div>
                )}
              </div>

              {/* Sección de Horas */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="horas" className="text-base font-medium">
                    Horas a realizar
                  </Label>
                </div>
                <Input
                  id="horas"
                  name="horas"
                  type="number"
                  min="0"
                  value={formData.horas}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Sección de Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CalendarIcon2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="fechaInicio" className="text-base font-medium">
                      Fecha de inicio
                    </Label>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaInicio ? format(fechaInicio, "PP", { locale: es }) : <span>Selecciona la fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={fechaInicio} onSelect={setFechaInicio} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <CalendarIcon2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="fechaFin" className="text-base font-medium">
                      Fecha de fin
                    </Label>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaFin ? format(fechaFin, "PP", { locale: es }) : <span>Selecciona la fecha</span>}
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
        )}
      </DialogContent>
    </Dialog>
  )
}
