"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, Users, BookOpen, Settings, Info } from "lucide-react"

interface Empresa {
  id: string
  entidad?: string
  cif?: string
  direccionSedeCentral?: string
  codigoPostalSede?: string
  municipioSede?: string
  poblacionSede?: string
  direccionCentroTrabajo?: string
  codigoPostalCentro?: string
  municipioCentro?: string
  poblacionCentro?: string
  nombreResponsable?: string
  dniResponsable?: string
  emailResponsable?: string
  telefonoResponsable?: string
  nombreTutor?: string
  dniTutor?: string
  emailTutor?: string
  telefonoTutor?: string
  nombreContacto?: string
  emailContacto?: string
  telefonoContacto?: string
  familiasProfesionales?: any
  ciclosFormativos?: any
  cursoAcademico?: string
  plazasAsignadas?: string
  periodoConvocatoria?: string
  horario?: string
  colaboracion?: string
  gestion?: string
  modalidad?: string
  ofertaFCT?: string
  convenioMarco?: string
  usoLogos?: string
  tecnicoGestion?: string
  observaciones?: string

  // Campos antiguos para compatibilidad
  nombre?: string
  direccion?: string
  localidad?: string
  contactoNombre?: string
  contactoEmail?: string
  contactoTelefono?: string
  descripcion?: string
}

interface EmpresaEditDialogProps {
  empresa: Empresa | null
  onSave: (empresa: Empresa) => void
  onCancel: () => void
}

export function EmpresaEditDialog({ empresa, onSave, onCancel }: EmpresaEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Estado inicial para formData
  const [formData, setFormData] = useState<Empresa>({
    id: "",
    entidad: "",
    cif: "",
    direccionSedeCentral: "",
    codigoPostalSede: "",
    municipioSede: "",
    poblacionSede: "",
    direccionCentroTrabajo: "",
    codigoPostalCentro: "",
    municipioCentro: "",
    poblacionCentro: "",
    nombreResponsable: "",
    dniResponsable: "",
    emailResponsable: "",
    telefonoResponsable: "",
    nombreTutor: "",
    dniTutor: "",
    emailTutor: "",
    telefonoTutor: "",
    nombreContacto: "",
    emailContacto: "",
    telefonoContacto: "",
    familiasProfesionales: [],
    ciclosFormativos: [],
    cursoAcademico: "",
    plazasAsignadas: "0",
    periodoConvocatoria: "",
    horario: "",
    colaboracion: "Empresa colaboradora",
    gestion: "P-Pdte respuesta",
    modalidad: "presencial",
    ofertaFCT: "LABORAL",
    convenioMarco: "Convenio qBID",
    usoLogos: "NO",
    tecnicoGestion: "Registradores",
    observaciones: "",
  })

  // Actualizar formData cuando cambia la empresa
  useEffect(() => {
    if (empresa) {
      setFormData({
        ...empresa,
        entidad: empresa.entidad || empresa.nombre || "",
        cif: empresa.cif || "",
        direccionSedeCentral: empresa.direccionSedeCentral || empresa.direccion || "",
        codigoPostalSede: empresa.codigoPostalSede || "",
        municipioSede: empresa.municipioSede || "",
        poblacionSede: empresa.poblacionSede || empresa.localidad || "",
        direccionCentroTrabajo: empresa.direccionCentroTrabajo || "",
        codigoPostalCentro: empresa.codigoPostalCentro || "",
        municipioCentro: empresa.municipioCentro || "",
        poblacionCentro: empresa.poblacionCentro || "",
        nombreResponsable: empresa.nombreResponsable || "",
        dniResponsable: empresa.dniResponsable || "",
        emailResponsable: empresa.emailResponsable || "",
        telefonoResponsable: empresa.telefonoResponsable || "",
        nombreTutor: empresa.nombreTutor || "",
        dniTutor: empresa.dniTutor || "",
        emailTutor: empresa.emailTutor || "",
        telefonoTutor: empresa.telefonoTutor || "",
        nombreContacto: empresa.nombreContacto || empresa.contactoNombre || "",
        emailContacto: empresa.emailContacto || empresa.contactoEmail || "",
        telefonoContacto: empresa.telefonoContacto || empresa.contactoTelefono || "",
        familiasProfesionales: empresa.familiasProfesionales || [],
        ciclosFormativos: empresa.ciclosFormativos || [],
        cursoAcademico: empresa.cursoAcademico || "",
        plazasAsignadas: empresa.plazasAsignadas || "0",
        periodoConvocatoria: empresa.periodoConvocatoria || "",
        horario: empresa.horario || "",
        colaboracion: empresa.colaboracion || "Empresa colaboradora",
        gestion: empresa.gestion || "P-Pdte respuesta",
        modalidad: empresa.modalidad || "presencial",
        ofertaFCT: empresa.ofertaFCT || "LABORAL",
        convenioMarco: empresa.convenioMarco || "Convenio qBID",
        usoLogos: empresa.usoLogos || "NO",
        tecnicoGestion: empresa.tecnicoGestion || "Registradores",
        observaciones: empresa.observaciones || empresa.descripcion || "",
      })
    }
  }, [empresa])

  // Si no hay empresa, no renderizar nada
  if (!empresa) {
    return null
  }

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
      const empresaRef = doc(db, "empresas", empresa.id)
      const updatedData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      await updateDoc(empresaRef, updatedData)

      toast({
        title: "Empresa actualizada",
        description: "La empresa se ha actualizado correctamente.",
      })

      onSave(updatedData as Empresa)
    } catch (error) {
      console.error("Error al actualizar empresa:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la empresa. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
      case "online":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">Online</Badge>
      default:
        return <Badge>Presencial</Badge>
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Editar Empresa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex items-center space-x-2 mb-4">
            <Label className="text-base font-semibold">Modalidad de la empresa:</Label>
            <div className="flex-1"></div>
            {getModalidadBadge(formData.modalidad || "presencial")}
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
                      <Select value={formData.gestion} onValueChange={(value) => handleSelectChange("gestion", value)}>
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
                            <RadioGroupItem value="presencial" id="edit-presencial" />
                            <Label htmlFor="edit-presencial" className="cursor-pointer font-medium">
                              Presencial
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="distancia" id="edit-distancia" />
                            <Label htmlFor="edit-distancia" className="cursor-pointer font-medium">
                              Distancia
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="blearning" id="edit-blearning" />
                            <Label htmlFor="edit-blearning" className="cursor-pointer font-medium">
                              B-Learning
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="semipresencial" id="edit-semipresencial" />
                            <Label htmlFor="edit-semipresencial" className="cursor-pointer font-medium">
                              Semipresencial
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mixta" id="edit-mixta" />
                            <Label htmlFor="edit-mixta" className="cursor-pointer font-medium">
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

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
