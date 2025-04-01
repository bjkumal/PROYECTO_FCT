"use client"

import type React from "react"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { useEffect } from "react"

interface CicloFormativo {
  id: string
  nombre: string
}

export function EstudianteCreateButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ciclos, setCiclos] = useState<CicloFormativo[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    dni: "",
    email: "",
    telefono: "",
    cicloFormativoId: "",
    curso: "",
  })

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

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Nuevo Estudiante
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Estudiante</DialogTitle>
            <DialogDescription>Añade un nuevo estudiante al sistema.</DialogDescription>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
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

