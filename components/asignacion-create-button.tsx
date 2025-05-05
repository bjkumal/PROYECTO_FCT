"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Save, Building, User, Calendar, Clock } from "lucide-react"
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { usePendingTasks } from "@/context/pending-tasks-context"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

interface Estudiante {
  id: string
  nombre: string
  apellidos: string
  cicloFormativoId: string
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

interface AsignacionCreateButtonProps {
  initialData?: any
  pendingTaskId?: string
}

export function AsignacionCreateButton({ initialData, pendingTaskId }: AsignacionCreateButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [ciclos, setCiclos] = useState<CicloFormativo[]>([])
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [cicloSeleccionado, setCicloSeleccionado] = useState<CicloFormativo | null>(null)
  const { addPendingTask, removePendingTask } = usePendingTasks()
  const router = useRouter()
  const [dataLoaded, setDataLoaded] = useState(false)
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null)
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null)

  const [formData, setFormData] = useState({
    estudianteId: "",
    empresaId: "",
    fechaInicio: "",
    fechaFin: "",
    horas: "0",
  })

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined)
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined)

  // Inicializar con datos si se proporcionan
  useEffect(() => {
    if (initialData) {
      try {
        // Asegurarse de que formData existe
        const formDataToUse = initialData.formData || initialData

        setFormData({
          estudianteId: formDataToUse.estudianteId || "",
          empresaId: formDataToUse.empresaId || "",
          fechaInicio: formDataToUse.fechaInicio || "",
          fechaFin: formDataToUse.fechaFin || "",
          horas: formDataToUse.horas || "0",
        })

        if (initialData.fechaInicio) {
          setFechaInicio(new Date(initialData.fechaInicio))
        }

        if (initialData.fechaFin) {
          setFechaFin(new Date(initialData.fechaFin))
        }

        if (initialData.cicloSeleccionado) {
          setCicloSeleccionado(initialData.cicloSeleccionado)
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos iniciales correctamente.",
          variant: "destructive",
        })
      }
    }
  }, [initialData, toast])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
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
          nombre: doc.data().entidad || doc.data().nombre || "Empresa sin nombre",
          ...(doc.data() as Omit<Empresa, "id" | "nombre">),
        }))

        // Fetch ciclos formativos
        const ciclosSnapshot = await getDocs(collection(db, "ciclosFormativos"))
        const ciclosData = ciclosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CicloFormativo, "id">),
        }))

        setEstudiantes(estudiantesData)
        setEmpresas(empresasData) // Mostramos todas las empresas sin filtrar
        setCiclos(ciclosData)
        setDataLoaded(true)

        // Si hay datos iniciales, cargar estudiante y empresa seleccionados
        if (initialData?.formData) {
          // Cargar estudiante seleccionado
          if (initialData.formData.estudianteId) {
            const estudiante = estudiantesData.find((e) => e.id === initialData.formData.estudianteId)
            if (estudiante) {
              setEstudianteSeleccionado(estudiante)

              // Cargar ciclo formativo
              if (estudiante.cicloFormativoId) {
                await loadCicloFormativo(estudiante.cicloFormativoId)
              }
            }
          }

          // Cargar empresa seleccionada
          if (initialData.formData.empresaId) {
            const empresa = empresasData.find((e) => e.id === initialData.formData.empresaId)
            if (empresa) {
              setEmpresaSeleccionada(empresa)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios. Inténtalo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [initialData, toast])

  // Función para cargar ciclo formativo sin filtrar empresas
  const loadCicloFormativo = async (cicloId: string) => {
    try {
      const cicloDoc = await getDoc(doc(db, "ciclosFormativos", cicloId))

      if (cicloDoc.exists()) {
        const cicloData = cicloDoc.data() as CicloFormativo
        setCicloSeleccionado({
          id: cicloDoc.id,
          ...cicloData,
        })
        setError(null)
      }
    } catch (error) {
      console.error("Error al obtener ciclo formativo:", error)
    }
  }

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

    // Si se selecciona un estudiante, obtener su ciclo formativo
    if (name === "estudianteId") {
      try {
        const estudiante = estudiantes.find((e) => e.id === value)

        if (estudiante) {
          setEstudianteSeleccionado(estudiante)

          if (estudiante.cicloFormativoId) {
            await loadCicloFormativo(estudiante.cicloFormativoId)
          }
        }
      } catch (error) {
        console.error("Error al obtener ciclo formativo:", error)
        toast({
          title: "Error",
          description: "No se pudo obtener información del ciclo formativo.",
          variant: "destructive",
        })
      }
    } else if (name === "empresaId") {
      // Actualizar empresa seleccionada
      const empresa = empresas.find((e) => e.id === value)
      if (empresa) {
        setEmpresaSeleccionada(empresa)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Validación para el campo de horas
    if (name === "horas") {
      // Permitir solo números positivos
      const numValue = Number.parseInt(value, 10)
      if (isNaN(numValue) || numValue < 0) {
        setError("Las horas deben ser un número positivo")
        return
      } else {
        setError(null)
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.estudianteId) {
      toast({
        title: "Error",
        description: "Debes seleccionar un estudiante.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.empresaId) {
      toast({
        title: "Error",
        description: "Debes seleccionar una empresa.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.fechaInicio) {
      toast({
        title: "Error",
        description: "Debes seleccionar una fecha de inicio.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.fechaFin) {
      toast({
        title: "Error",
        description: "Debes seleccionar una fecha de fin.",
        variant: "destructive",
      })
      return false
    }

    // Validar que las horas sean un número positivo
    const horas = Number.parseInt(formData.horas, 10)
    if (isNaN(horas) || horas < 0) {
      setError("Las horas deben ser un número positivo")
      return false
    }

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
      toast({
        title: "Error",
        description: "La fecha de fin debe ser posterior a la fecha de inicio.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
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

      await addDoc(collection(db, "asignaciones"), {
        estudianteId: formData.estudianteId,
        empresaId: formData.empresaId,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        horas: Number.parseInt(formData.horas, 10), // Guardar como número
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Asignación creada",
        description: "La asignación se ha creado correctamente.",
      })

      // Si hay un ID de tarea pendiente, eliminarla
      if (pendingTaskId) {
        await removePendingTask(pendingTaskId)
      }

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
      setEmpresaSeleccionada(null)
      setEstudianteSeleccionado(null)

      // Si estamos en la página de pendientes, redirigir al dashboard
      if (pendingTaskId) {
        router.push("/dashboard/pendientes")
      }
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

  const handleSavePending = async () => {
    try {
      // Obtener nombres para el título y descripción
      let title = "Nueva asignación"
      let description = ""

      if (formData.estudianteId) {
        const estudiante = estudiantes.find((e) => e.id === formData.estudianteId)
        if (estudiante) {
          title = `${estudiante.nombre} ${estudiante.apellidos}`
        }
      }

      if (formData.empresaId) {
        const empresa = empresas.find((e) => e.id === formData.empresaId)
        if (empresa) {
          description = empresa.nombre
        }
      }

      // Guardar como tarea pendiente
      await addPendingTask({
        type: "asignacion",
        title,
        description,
        formData: {
          formData,
          fechaInicio: fechaInicio?.toISOString(),
          fechaFin: fechaFin?.toISOString(),
          cicloSeleccionado,
        },
      })

      toast({
        title: "Guardado como pendiente",
        description: "La asignación se ha guardado como tarea pendiente.",
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
          Nueva Asignación
        </Button>
      )}

      <Dialog open={pendingTaskId ? true : open} onOpenChange={pendingTaskId ? undefined : setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{pendingTaskId ? "Continuar registro de asignación" : "Crear Nueva Asignación"}</DialogTitle>
            <DialogDescription>
              {pendingTaskId
                ? "Completa el registro de la asignación que guardaste como pendiente."
                : "Asigna un estudiante a una empresa para realizar las prácticas."}
            </DialogDescription>
          </DialogHeader>

          {loading && !dataLoaded ? (
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
                  <Select
                    value={formData.empresaId}
                    onValueChange={(value) => handleSelectChange("empresaId", value)}
                    disabled={empresas.length === 0}
                  >
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
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
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
                        <CalendarComponent
                          mode="single"
                          selected={fechaInicio}
                          onSelect={setFechaInicio}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
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
                        <CalendarComponent
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
                  {loading ? "Creando..." : "Crear Asignación"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
