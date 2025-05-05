"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { isFirebaseConfigured } from "@/lib/firebase"

interface FirebaseErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FirebaseErrorBoundary({ children, fallback }: FirebaseErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Verificar si Firebase está correctamente configurado
    if (!isFirebaseConfigured()) {
      setHasError(true)
    }
  }, [])

  if (hasError) {
    return (
      fallback || (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de configuración de Firebase</AlertTitle>
          <AlertDescription>
            No se ha podido conectar con Firebase. Por favor, verifica que las variables de entorno estén correctamente
            configuradas.
            <div className="mt-2">
              <a href="/firebase-diagnostico" className="text-primary underline">
                Ir a la página de diagnóstico
              </a>
            </div>
          </AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
