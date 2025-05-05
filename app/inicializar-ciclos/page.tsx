"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where } from "firebase/firestore"

// Lista de ciclos formativos organizados por familia profesional
const ciclosFormativos = [
  {
    familia: "Administración y Gestión",
    ciclos: [
      { nombre: "Administración y Finanzas", nivel: "Superior", duracion: "2000" },
      { nombre: "Asistencia a la dirección", nivel: "Superior", duracion: "2000" },
      { nombre: "Gestión administrativa", nivel: "Medio", duracion: "2000" },
    ],
  },
  {
    familia: "Servicios Socioculturales y a la Comunidad",
    ciclos: [
      { nombre: "Integración social", nivel: "Superior", duracion: "2000" },
      { nombre: "Educación infantil", nivel: "Superior", duracion: "2000" },
      { nombre: "Atención a personas en Situación de Dependencia", nivel: "Medio", duracion: "2000" },
    ],
  },
  {
    familia: "Comercio y Marketing",
    ciclos: [
      { nombre: "Comercio internacional", nivel: "Superior", duracion: "2000" },
      { nombre: "Transporte y Logística", nivel: "Superior", duracion: "2000" },
      { nombre: "Marketing y Publicidad", nivel: "Superior", duracion: "2000" },
    ],
  },
  {
    familia: "Imagen y Sonido",
    ciclos: [{ nombre: "Animaciones 3D, Juegos y Entornos Interactivos", nivel: "Superior", duracion: "2000" }],
  },
  {
    familia: "Hostelería y Turismo",
    ciclos: [
      { nombre: "Gestión de alojamientos turísticos", nivel: "Superior", duracion: "2000" },
      { nombre: "Cocina y Gastronomía", nivel: "Medio", duracion: "2000" },
    ],
  },
  {
    familia: "Instalaciones y Mantenimiento",
    ciclos: [
      { nombre: "Instalaciones Frigoríficas y de Climatización", nivel: "Medio", duracion: "2000" },
      { nombre: "Mecánica de Vehículos Automóviles", nivel: "Medio", duracion: "2000" },
      { nombre: "Instalaciones Eléctricas y Automáticas", nivel: "Medio", duracion: "2000" },
      { nombre: "Mantenimiento y Servicios a la Producción", nivel: "Medio", duracion: "2000" },
    ],
  },
  {
    familia: "Sanidad",
    ciclos: [
      { nombre: "Anatomía Patológica y Citodiagnóstico", nivel: "Superior", duracion: "2000" },
      { nombre: "Dietética", nivel: "Superior", duracion: "2000" },
      { nombre: "Higiene Bucodental", nivel: "Superior", duracion: "2000" },
      { nombre: "Imagen para el Diagnóstico y Medicina Nuclear", nivel: "Superior", duracion: "2000" },
      { nombre: "Laboratorio Clínico y Biomédico", nivel: "Superior", duracion: "2000" },
      { nombre: "Prótesis Dentales", nivel: "Superior", duracion: "2000" },
      { nombre: "Radioterapia y Dosimetría", nivel: "Superior", duracion: "2000" },
      { nombre: "Documentación y Administración Sanitarias", nivel: "Superior", duracion: "2000" },
      { nombre: "Cuidados Auxiliares Enfermería", nivel: "Medio", duracion: "1400" },
      { nombre: "Emergencias Sanitarias", nivel: "Medio", duracion: "2000" },
      { nombre: "Farmacia y Parafarmacia", nivel: "Medio", duracion: "2000" },
    ],
  },
  {
    familia: "Informática y Comunicaciones",
    ciclos: [
      { nombre: "Administración de Sistemas Informáticos en Red (ASIR)", nivel: "Superior", duracion: "2000" },
      { nombre: "Desarrollo de Aplicaciones Multiplataforma", nivel: "Superior", duracion: "2000" },
      { nombre: "Desarrollo de Aplicaciones Web", nivel: "Superior", duracion: "2000" },
      { nombre: "Sistemas Microinformáticos y Redes (SMR)", nivel: "Medio", duracion: "2000" },
    ],
  },
]

export default function InicializarCiclosPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    status: "success" | "error" | null
    message: string
    details: string[]
  }>({
    status: null,
    message: "",
    details: [],
  })

  const inicializarCiclos = async () => {
    setIsLoading(true)
    setResult({
      status: null,
      message: "",
      details: [],
    })

    const details: string[] = []
    let totalAgregados = 0
    let totalExistentes = 0

    try {
      for (const familia of ciclosFormativos) {
        for (const ciclo of familia.ciclos) {
          // Verificar si el ciclo ya existe
          const ciclosRef = collection(db, "ciclosFormativos")
          const q = query(ciclosRef, where("nombre", "==", ciclo.nombre), where("familia", "==", familia.familia))

          const querySnapshot = await getDocs(q)

          if (querySnapshot.empty) {
            // Agregar el ciclo si no existe
            await addDoc(collection(db, "ciclosFormativos"), {
              nombre: ciclo.nombre,
              nivel: ciclo.nivel,
              familia: familia.familia,
              duracion: ciclo.duracion,
              createdAt: new Date().toISOString(),
            })

            details.push(`✅ Agregado: ${ciclo.nombre} (${familia.familia})`)
            totalAgregados++
          } else {
            details.push(`ℹ️ Ya existe: ${ciclo.nombre} (${familia.familia})`)
            totalExistentes++
          }
        }
      }

      setResult({
        status: "success",
        message: `Proceso completado. Se agregaron ${totalAgregados} ciclos formativos. ${totalExistentes} ya existían.`,
        details,
      })
    } catch (error: any) {
      console.error("Error al inicializar ciclos:", error)

      setResult({
        status: "error",
        message: `Error al inicializar ciclos: ${error.message || "Error desconocido"}`,
        details,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <Image src="/images/CEAC-FP-RGB-Azul.png" alt="Logo CEAC" width={200} height={80} className="dark:hidden" />
            <Image
              src="/images/CEAC-FP-RGB-Negro.png"
              alt="Logo CEAC"
              width={200}
              height={80}
              className="hidden dark:block invert"
            />
          </div>
          <CardTitle className="text-2xl">Inicializar Ciclos Formativos</CardTitle>
          <CardDescription>Esta página inicializa los ciclos formativos de CEAC en la base de datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Información</AlertTitle>
            <AlertDescription>
              Este proceso agregará todos los ciclos formativos de CEAC a la base de datos. Los ciclos que ya existan no
              se duplicarán.
            </AlertDescription>
          </Alert>

          {result.status === "success" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {result.status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button onClick={inicializarCiclos} disabled={isLoading} size="lg">
              {isLoading ? "Inicializando..." : "Inicializar Ciclos Formativos"}
            </Button>
          </div>

          {result.details.length > 0 && (
            <div className="mt-4 border rounded-md p-4 max-h-60 overflow-y-auto">
              <h3 className="font-medium mb-2">Detalles:</h3>
              <ul className="space-y-1 text-sm">
                {result.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/dashboard" className="text-primary hover:underline">
            Volver al dashboard
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
