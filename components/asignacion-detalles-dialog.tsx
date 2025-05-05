"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Separator } from "@/components/ui/separator"

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

interface AsignacionDetallesDialogProps {
  asignacion: Asignacion
  onClose: () => void
}

export function AsignacionDetallesDialog({ asignacion, onClose }: AsignacionDetallesDialogProps) {
  const [estudianteDetalles, setEstudianteDetalles] = useState<any>(null)
  const [empresaDetalles, setEmpresaDetalles] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetalles = async () => {
      try {
        // Obtener detalles del estudiante
        const estudianteDoc = await getDoc(doc(db, "estudiantes", asignacion.estudianteId))
        if (estudianteDoc.exists()) {
          setEstudianteDetalles(estudianteDoc.data())
        }

        // Obtener detalles de la empresa
        const empresaDoc = await getDoc(doc(db, "empresas", asignacion.empresaId))
        if (empresaDoc.exists()) {
          setEmpresaDetalles(empresaDoc.data())
        }
      } catch (error) {
        console.error("Error fetching detalles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetalles()
  }, [asignacion.estudianteId, asignacion.empresaId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles de la Asignación</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-4 text-center">Cargando detalles...</div>
        ) : (
          <div className="py-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Información de la Asignación</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Fecha de inicio:</div>
                <div>{formatDate(asignacion.fechaInicio)}</div>
                <div className="text-sm text-muted-foreground">Fecha de fin:</div>
                <div>{formatDate(asignacion.fechaFin)}</div>
                <div className="text-sm text-muted-foreground">Horas a realizar:</div>
                <div className="font-medium">{asignacion.horas || 0} horas</div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Información del Estudiante</h3>
              {estudianteDetalles ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Nombre:</div>
                  <div>
                    {estudianteDetalles.nombre} {estudianteDetalles.apellidos}
                  </div>
                  <div className="text-sm text-muted-foreground">DNI:</div>
                  <div>{estudianteDetalles.dni}</div>
                  <div className="text-sm text-muted-foreground">Email:</div>
                  <div>{estudianteDetalles.email}</div>
                  <div className="text-sm text-muted-foreground">Teléfono:</div>
                  <div>{estudianteDetalles.telefono}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No se encontraron detalles del estudiante</div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Información de la Empresa</h3>
              {empresaDetalles ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Nombre:</div>
                  <div>{empresaDetalles.nombre}</div>
                  <div className="text-sm text-muted-foreground">CIF:</div>
                  <div>{empresaDetalles.cif}</div>
                  <div className="text-sm text-muted-foreground">Dirección:</div>
                  <div>
                    {empresaDetalles.direccion}, {empresaDetalles.localidad}
                  </div>
                  <div className="text-sm text-muted-foreground">Contacto:</div>
                  <div>{empresaDetalles.contactoNombre}</div>
                  <div className="text-sm text-muted-foreground">Email de contacto:</div>
                  <div>{empresaDetalles.contactoEmail}</div>
                  <div className="text-sm text-muted-foreground">Teléfono de contacto:</div>
                  <div>{empresaDetalles.contactoTelefono}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No se encontraron detalles de la empresa</div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
