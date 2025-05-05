"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Info, Building2, Users, BookOpen, Settings, Save } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePendingTasks } from "@/context/pending-tasks-context"
import { useRouter } from "next/navigation"

interface EmpresaCreateButtonProps {
  initialData?: any
  pendingTaskId?: string
}

export function EmpresaCreateButton({ initialData, pendingTaskId }: EmpresaCreateButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { addPendingTask, removePendingTask } = usePendingTasks()
  const router = useRouter()

  const [formData, setFormData] = useState({
    // Datos básicos
    entidad: "",
    cif: "",

    // Sede central
    direccionSedeCentral: "",
    codigoPostalSede: "",
    municipioSede: "",
    poblacionSede: "",

    // Centro de trabajo
    direccionCentroTrabajo: "",
    codigoPostalCentro: "",
    municipioCentro: "",
    poblacionCentro: "",

    // Responsable convenio
    nombreResponsable: "",
    dniResponsable: "",
    emailResponsable: "",
    telefonoResponsable: "",

    // Tutor empresa
    nombreTutor: "",
    dniTutor: "",
    emailTutor: "",
    telefonoTutor: "",

    // Persona de contacto
    nombreContacto: "",
    emailContacto: "",
    telefonoContacto: "",

    // Datos FCT
    familiasProfesionales: [],
    ciclosFormativos: [],
    cursoAcademico: "",
    plazasAsignadas: "0",
    periodoConvocatoria: "",
    horario: "",

    // Configuración
    colaboracion: "Empresa colaboradora",
    gestion: "P-Pdte respuesta",
    modalidad: "presencial", // Opciones: presencial, distancia, blearning, semipresencial, mixta
    ofertaFCT: "LABORAL",
    convenioMarco: "Convenio qBID",
    usoLogos: "NO",
    tecnicoGestion: "Registradores",
    observaciones: "",
  })

  // Inicializar con datos si se proporcionan
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
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

      // Si hay un ID de tarea pendiente, eliminarla
      if (pendingTaskId) {
        await removePendingTask(pendingTaskId)
      }

      setOpen(false)
      setFormData({
        // Datos básicos
        entidad: "",
        cif: "",

        // Sede central
        direccionSedeCentral: "",
        codigoPostalSede: "",
        municipioSede: "",
        poblacionSede: "",

        // Centro de trabajo
        direccionCentroTrabajo: "",
        codigoPostalCentro: "",
        municipioCentro: "",
        poblacionCentro: "",

        // Responsable convenio
        nombreResponsable: "",
        dniResponsable: "",
        emailResponsable: "",
        telefonoResponsable: "",

        // Tutor empresa
        nombreTutor: "",
        dniTutor: "",
        emailTutor: "",
        telefonoTutor: "",

        // Persona de contacto
        nombreContacto: "",
        emailContacto: "",
        telefonoContacto: "",

        // Datos FCT
        familiasProfesionales: [],
        ciclosFormativos: [],
        cursoAcademico: "",
        plazasAsignadas: "0",
        periodoConvocatoria: "",
        horario: "",

        // Configuración
        colaboracion: "Empresa colaboradora",
        gestion: "P-Pdte respuesta",
        modalidad: "presencial",
        ofertaFCT: "LABORAL",
        convenioMarco: "Convenio qBID",
        usoLogos: "NO",
        tecnicoGestion: "Registradores",
        observaciones: "",
      })

      // Si estamos en la página de pendientes, redirigir al dashboard
      if (pendingTaskId) {
        router.push("/dashboard/pendientes")
      }
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

  const handleSavePending = async () => {
    try {
      // Guardar como tarea pendiente
      await addPendingTask({
        type: "empresa",
        title: formData.entidad || "Nueva empresa",
        description: `${formData.cif || ""} - ${formData.poblacionSede || ""}`,
        formData: {
          ...formData,
        },
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

  const getModalidadBadge = (modalidad: string) => {
    switch (modalidad) {
      case "presencial":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">Presencial</Badge>
      case "distancia":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">Distancia</Badge>
      case "blearning":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300">B-Learning</Badge>
      case "semipresencial":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">Semipresencial</Badge>
      case "mixta":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-300">
            Mixta (Online y Presencial)
          </Badge>
        )
      default:
        return <Badge>Presencial</Badge>
    }
  }

  return (
    <>
      {!pendingTaskId && (
        <Button onClick={() => setOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Empresa
        </Button>
      )}

      <Dialog open={pendingTaskId ? true : open} onOpenChange={pendingTaskId ? undefined : setOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {pendingTaskId ? "Continuar registro de empresa" : "Crear Nueva Empresa"}
            </DialogTitle>
            <DialogDescription>
              {pendingTaskId
                ? "Completa el registro de la empresa que guardaste como pendiente."
                : "Añade una nueva empresa colaboradora al sistema."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex items-center space-x-2 mb-4">
              <Label className="text-base font-semibold">Modalidad de la empresa:</Label>
              <div className="flex-1"></div>
              {getModalidadBadge(formData.modalidad)}
            </div>

            <Tabs defaultValue="datos-basicos" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="datos-basicos" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Datos Básicos</span>
                </TabsTrigger>
                <TabsTrigger value="contactos" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Contactos</span>
                </TabsTrigger>
                <TabsTrigger value="fct" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Datos FCT</span>
                </TabsTrigger>
                <TabsTrigger value="configuracion" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Configuración</span>
                </TabsTrigger>
              </TabsList>

              {/* Pestaña de Datos Básicos */}
              <TabsContent value="datos-basicos" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="entidad" className="text-base">
                          Entidad/Nombre de la empresa
                        </Label>
                        <Input
                          id="entidad"
                          name="entidad"
                          value={formData.entidad}
                          onChange={handleChange}
                          required
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cif" className="text-base">
                          CIF
                        </Label>
                        <Input
                          id="cif"
                          name="cif"
                          value={formData.cif}
                          onChange={handleChange}
                          required
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-primary">
                      <Building2 className="h-5 w-5" />
                      Sede Central
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="direccionSedeCentral" className="text-base">
                          Dirección Sede Central
                        </Label>
                        <Input
                          id="direccionSedeCentral"
                          name="direccionSedeCentral"
                          value={formData.direccionSedeCentral}
                          onChange={handleChange}
                          required
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="codigoPostalSede" className="text-base">
                          Código Postal
                        </Label>
                        <Input
                          id="codigoPostalSede"
                          name="codigoPostalSede"
                          value={formData.codigoPostalSede}
                          onChange={handleChange}
                          required
                          maxLength={5}
                          pattern="[0-9]{5}"
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="municipioSede" className="text-base">
                          Municipio
                        </Label>
                        <Input
                          id="municipioSede"
                          name="municipioSede"
                          value={formData.municipioSede}
                          onChange={handleChange}
                          required
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="poblacionSede" className="text-base">
                          Población
                        </Label>
                        <Input
                          id="poblacionSede"
                          name="poblacionSede"
                          value={formData.poblacionSede}
                          onChange={handleChange}
                          required
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-primary">
                      <Building2 className="h-5 w-5" />
                      Centro de Trabajo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="direccionCentroTrabajo" className="text-base">
                          Dirección Centro Trabajo
                        </Label>
                        <Input
                          id="direccionCentroTrabajo"
                          name="direccionCentroTrabajo"
                          value={formData.direccionCentroTrabajo}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="codigoPostalCentro" className="text-base">
                          Código Postal
                        </Label>
                        <Input
                          id="codigoPostalCentro"
                          name="codigoPostalCentro"
                          value={formData.codigoPostalCentro}
                          onChange={handleChange}
                          maxLength={5}
                          pattern="[0-9]{5}"
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="municipioCentro" className="text-base">
                          Municipio
                        </Label>
                        <Input
                          id="municipioCentro"
                          name="municipioCentro"
                          value={formData.municipioCentro}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="poblacionCentro" className="text-base">
                          Población
                        </Label>
                        <Input
                          id="poblacionCentro"
                          name="poblacionCentro"
                          value={formData.poblacionCentro}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Contactos */}
              <TabsContent value="contactos" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-primary">
                      <Users className="h-5 w-5" />
                      Responsable del Convenio
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombreResponsable" className="text-base">
                          Nombre y Apellidos
                        </Label>
                        <Input
                          id="nombreResponsable"
                          name="nombreResponsable"
                          value={formData.nombreResponsable}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dniResponsable" className="text-base">
                          DNI
                        </Label>
                        <Input
                          id="dniResponsable"
                          name="dniResponsable"
                          value={formData.dniResponsable}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emailResponsable" className="text-base">
                          Correo Electrónico
                        </Label>
                        <Input
                          id="emailResponsable"
                          name="emailResponsable"
                          type="email"
                          value={formData.emailResponsable}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefonoResponsable" className="text-base">
                          Teléfono
                        </Label>
                        <Input
                          id="telefonoResponsable"
                          name="telefonoResponsable"
                          value={formData.telefonoResponsable}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-primary">
                      <Users className="h-5 w-5" />
                      Tutor de Empresa
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombreTutor" className="text-base">
                          Nombre y Apellidos
                        </Label>
                        <Input
                          id="nombreTutor"
                          name="nombreTutor"
                          value={formData.nombreTutor}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dniTutor" className="text-base">
                          DNI
                        </Label>
                        <Input
                          id="dniTutor"
                          name="dniTutor"
                          value={formData.dniTutor}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emailTutor" className="text-base">
                          Correo Electrónico
                        </Label>
                        <Input
                          id="emailTutor"
                          name="emailTutor"
                          type="email"
                          value={formData.emailTutor}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefonoTutor" className="text-base">
                          Teléfono
                        </Label>
                        <Input
                          id="telefonoTutor"
                          name="telefonoTutor"
                          value={formData.telefonoTutor}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-primary">
                      <Users className="h-5 w-5" />
                      Persona de Contacto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombreContacto" className="text-base">
                          Nombre y Apellidos
                        </Label>
                        <Input
                          id="nombreContacto"
                          name="nombreContacto"
                          value={formData.nombreContacto}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emailContacto" className="text-base">
                          Correo Electrónico
                        </Label>
                        <Input
                          id="emailContacto"
                          name="emailContacto"
                          type="email"
                          value={formData.emailContacto}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefonoContacto" className="text-base">
                          Teléfono
                        </Label>
                        <Input
                          id="telefonoContacto"
                          name="telefonoContacto"
                          value={formData.telefonoContacto}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Datos FCT */}
              <TabsContent value="fct" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="familiasProfesionales" className="text-base">
                          Familia Profesional
                        </Label>
                        <Input
                          id="familiasProfesionales"
                          name="familiasProfesionales"
                          value={formData.familiasProfesionales}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cursoAcademico" className="text-base">
                          Curso Académico
                        </Label>
                        <Input
                          id="cursoAcademico"
                          name="cursoAcademico"
                          value={formData.cursoAcademico}
                          onChange={handleChange}
                          placeholder="Ej: 2024/25"
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="plazasAsignadas" className="text-base">
                          Número de Plazas Asignadas
                        </Label>
                        <Input
                          id="plazasAsignadas"
                          name="plazasAsignadas"
                          type="number"
                          min="0"
                          value={formData.plazasAsignadas}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="periodoConvocatoria" className="text-base">
                          Periodo/Convocatoria
                        </Label>
                        <Input
                          id="periodoConvocatoria"
                          name="periodoConvocatoria"
                          value={formData.periodoConvocatoria}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="horario" className="text-base">
                          Horario
                        </Label>
                        <Input
                          id="horario"
                          name="horario"
                          value={formData.horario}
                          onChange={handleChange}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Configuración */}
              <TabsContent value="configuracion" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="colaboracion" className="text-base">
                          Colaboración
                        </Label>
                        <Select
                          value={formData.colaboracion}
                          onValueChange={(value) => handleSelectChange("colaboracion", value)}
                        >
                          <SelectTrigger className="border-primary/20 focus:border-primary">
                            <SelectValue placeholder="Selecciona tipo de colaboración" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Prospección">Prospección</SelectItem>
                            <SelectItem value="Empresa colaboradora">Empresa colaboradora</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gestion" className="text-base">
                          Gestiones
                        </Label>
                        <Select
                          value={formData.gestion}
                          onValueChange={(value) => handleSelectChange("gestion", value)}
                        >
                          <SelectTrigger className="border-primary/20 focus:border-primary">
                            <SelectValue placeholder="Selecciona estado de gestión" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="P-Primer contacto">P-Primer contacto</SelectItem>
                            <SelectItem value="P-Pdte respuesta">P-Pdte respuesta</SelectItem>
                            <SelectItem value="P-Volver a contactar">P-Volver a contactar</SelectItem>
                            <SelectItem value="P-No acogen alumnado">P-No acogen alumnado</SelectItem>
                            <SelectItem value="E-Pte firma Convenio">E-Pte firma Convenio</SelectItem>
                            <SelectItem value="E-Plazas conseguidas">E-Plazas conseguidas</SelectItem>
                            <SelectItem value="E-Solicitud plazas">E-Solicitud plazas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <Label className="text-lg font-medium text-primary">Modalidad de la empresa</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/20 cursor-pointer transition-colors border-primary/20">
                          <RadioGroup
                            value={formData.modalidad}
                            onValueChange={handleModalidadChange}
                            className="flex flex-col gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="presencial" id="presencial" />
                              <Label htmlFor="presencial" className="cursor-pointer font-medium">
                                Presencial
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="distancia" id="distancia" />
                              <Label htmlFor="distancia" className="cursor-pointer font-medium">
                                Distancia
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="blearning" id="blearning" />
                              <Label htmlFor="blearning" className="cursor-pointer font-medium">
                                B-Learning
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="semipresencial" id="semipresencial" />
                              <Label htmlFor="semipresencial" className="cursor-pointer font-medium">
                                Semipresencial
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="mixta" id="mixta" />
                              <Label htmlFor="mixta" className="cursor-pointer font-medium">
                                Mixta (Online y Presencial)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="md:col-span-2 bg-muted/20 p-4 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Información sobre modalidades</h3>
                          </div>
                          <ul className="space-y-2 text-sm">
                            <li>
                              <strong>Presencial:</strong> Las prácticas se realizan físicamente en la empresa.
                            </li>
                            <li>
                              <strong>Distancia:</strong> Las prácticas se realizan completamente en remoto.
                            </li>
                            <li>
                              <strong>B-Learning:</strong> Combina formación online con sesiones presenciales.
                            </li>
                            <li>
                              <strong>Semipresencial:</strong> Parte del tiempo en la empresa y parte en remoto.
                            </li>
                            <li>
                              <strong>Mixta:</strong> La empresa ofrece tanto plazas presenciales como online.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ofertaFCT" className="text-base">
                          Oferta FCT/Laboral
                        </Label>
                        <Select
                          value={formData.ofertaFCT}
                          onValueChange={(value) => handleSelectChange("ofertaFCT", value)}
                        >
                          <SelectTrigger className="border-primary/20 focus:border-primary">
                            <SelectValue placeholder="Selecciona tipo de oferta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FCT (prácticas)">FCT (prácticas)</SelectItem>
                            <SelectItem value="LABORAL">LABORAL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="convenioMarco" className="text-base">
                          Convenio Marco
                        </Label>
                        <Select
                          value={formData.convenioMarco}
                          onValueChange={(value) => handleSelectChange("convenioMarco", value)}
                        >
                          <SelectTrigger className="border-primary/20 focus:border-primary">
                            <SelectValue placeholder="Selecciona tipo de convenio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Convenio Marco CEAC">Convenio Marco CEAC</SelectItem>
                            <SelectItem value="Convenio qBID">Convenio qBID</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="usoLogos" className="text-base">
                          Uso Logos
                        </Label>
                        <Select
                          value={formData.usoLogos}
                          onValueChange={(value) => handleSelectChange("usoLogos", value)}
                        >
                          <SelectTrigger className="border-primary/20 focus:border-primary">
                            <SelectValue placeholder="Selecciona uso de logos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SI">SI</SelectItem>
                            <SelectItem value="NO">NO</SelectItem>
                            <SelectItem value="Autorización previa">Autorización previa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tecnicoGestion" className="text-base">
                          Técnico Gestión
                        </Label>
                        <Select
                          value={formData.tecnicoGestion}
                          onValueChange={(value) => handleSelectChange("tecnicoGestion", value)}
                        >
                          <SelectTrigger className="border-primary/20 focus:border-primary">
                            <SelectValue placeholder="Selecciona técnico" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Registradores">Registradores</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="observaciones" className="text-base">
                        Observaciones
                      </Label>
                      <Textarea
                        id="observaciones"
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows={3}
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

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
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? "Creando..." : "Crear Empresa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
