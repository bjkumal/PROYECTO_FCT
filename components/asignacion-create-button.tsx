"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface Estudiante {
  id: string
  nombre: string
  apellidos: string
  cicloFormativoId: string
}

interface Empresa {
  id: string
  nombre: string
  modalidad?: string
}

interface CicloFormativo {
  id: string
  nombre: string
  modalidad?: string
}

export function AsignacionCreateButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [allEmpresas, setAllEmpresas] = useState<Empresa[]>([])
  const [ciclos, setCiclos] = useState<CicloFormativo[]>([])
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [cicloSeleccionado, setCicloSeleccionado] = useState<CicloFormativo | null>(null)

  const [formData, setFormData] = useState({
    estudianteId: "",
    empresaId: "",
    fechaInicio: "",
    fechaFin: "",
    horas: "0",
  })

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined)
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined)

  useEffect(() => {
    const fetchData = async () => {
      try {
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
          ...(doc.data() as Omit<Empresa, "id">),
        }))

        // Fetch ciclos formativos
        const ciclosSnapshot = await getDocs(collection(db, "ciclosFormativos"))
        const ciclosData = ciclosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CicloFormativo, "id">),
        }))

        setEstudiantes(estudiantesData)
        setAllEmpresas(empresasData)
        setEmpresas(empresasData) // Inicialmente mostramos todas las empresas
        setCiclos(ciclosData)
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

    // Si se selecciona un estudiante, obtener su ciclo formativo y filtrar empresas
    if (name === "estudianteId") {
      try {
        const estudiante = estudiantes.find((e) => e.id === value)

        if (estudiante && estudiante.cicloFormativoId) {
          const cicloDoc = await getDoc(doc(db, "ciclosFormativos", estudiante.cicloFormativoId))

          if (cicloDoc.exists()) {
            const cicloData = cicloDoc.data() as CicloFormativo
            setCicloSeleccionado({
              id: cicloDoc.id,
              ...cicloData,
            })

            // Filtrar empresas según la modalidad del ciclo
            if (cicloData.modalidad === "online") {
              // Para ciclos online, solo mostrar empresas online
              const empresasFiltradas = allEmpresas.filter((empresa) => empresa.modalidad === "online")
              setEmpresas(empresasFiltradas)

              // Si hay pocas o ninguna empresa disponible, mostrar una alerta
              if (empresasFiltradas.length === 0) {
                setError("No hay empresas online disponibles para este ciclo formativo")
              } else {
                setError(null)
              }
            } else {
              // Para ciclos presenciales, mostrar todas las empresas
              setEmpresas(allEmpresas)
              setError(null)
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener ciclo formativo:", error)
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

    setFormData((prev) => ({ ...prev, [name]: value }))
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
    const horas = Number.parseInt(formData.horas)
    if (isNaN(horas) || horas < 0) {
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

      // Verificar compatibilidad de modalidades
      const empresaData = empresaDoc.data()

      if (cicloSeleccionado && cicloSeleccionado.modalidad === "online" && empresaData.modalidad !== "online") {
        throw new Error("No se puede asignar una empresa presencial a un ciclo online")
      }

      await addDoc(collection(db, "asignaciones"), {
        ...formData,
        horas: Number.parseInt(formData.horas), // Guardar como número
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Asignación creada",
        description: "La asignación se ha creado correctamente.",
      })

      setOpen(false)
      setFormData({
        estudianteId: "",
        empresaId: "",
        fechaInicio: "",
        fechaFin: "",
        horas: "0",
      })
      setFechaInicio(undefined)
      setFechaFin(undefined)
      setError(null)
      setCicloSeleccionado(null)
    } catch (error: any) {
      console.error("Error al crear asignación:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la asignación. Inténtalo de nuevo.",
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
        Nueva Asignación
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nueva Asignación</DialogTitle>
            <DialogDescription>Asigna un estudiante a una empresa para realizar las prácticas.</DialogDescription>
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

              {cicloSeleccionado && (
                <Alert className="py-2">
                  <AlertDescription>
                    Ciclo formativo: <strong>{cicloSeleccionado.nombre}</strong> - Modalidad:{" "}
                    <strong>{cicloSeleccionado.modalidad === "online" ? "Online" : "Presencial"}</strong>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="empresaId">Empresa</Label>
                <Select
                  value={formData.empresaId}
                  onValueChange={(value) => handleSelectChange("empresaId", value)}
                  disabled={empresas.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nombre}{" "}
                        {empresa.modalidad ? `(${empresa.modalidad === "online" ? "Online" : "Presencial"})` : ""}
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !!error}>
                {loading ? "Creando..." : "Crear Asignación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

