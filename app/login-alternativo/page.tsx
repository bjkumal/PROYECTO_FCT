"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info, ExternalLink } from "lucide-react"
import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

export default function LoginAlternativoPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showAuthHelp, setShowAuthHelp] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setShowAuthHelp(false)

    try {
      // IMPORTANTE: Estos valores son solo para pruebas y deben ser reemplazados
      // con tus propios valores de Firebase
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }

      // Inicializar Firebase directamente en este componente
      const app = initializeApp(firebaseConfig, "login-alternativo")
      const auth = getAuth(app)

      // Iniciar sesión
      await signInWithEmailAndPassword(auth, email, password)

      toast({
        title: "Inicio de sesión exitoso",
        description: "Redirigiendo al dashboard...",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error de autenticación:", error)

      // Manejar diferentes tipos de errores de Firebase
      let message = "No se ha podido iniciar sesión. Verifica tus credenciales."

      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
            message = "No existe ningún usuario con este correo electrónico."
            break
          case "auth/wrong-password":
            message = "Contraseña incorrecta."
            break
          case "auth/invalid-email":
            message = "El formato del correo electrónico no es válido."
            break
          case "auth/configuration-not-found":
            message = "Error de configuración de Firebase. Por favor, verifica tus variables de entorno."
            break
          case "auth/operation-not-allowed":
            message = "La autenticación por email/password no está habilitada en Firebase."
            setShowAuthHelp(true)
            break
          case "auth/too-many-requests":
            message = "Demasiados intentos fallidos. Por favor, inténtalo más tarde."
            break
          default:
            message = `Error: ${error.message || error.code}`
        }
      }

      setErrorMessage(message)

      toast({
        title: "Error de autenticación",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <School className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Iniciar sesión (Alternativo)</CardTitle>
          <CardDescription>Método alternativo de inicio de sesión</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Página de login alternativa</AlertTitle>
            <AlertDescription>
              Esta página inicializa Firebase directamente, sin usar el contexto de autenticación.
            </AlertDescription>
          </Alert>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {showAuthHelp && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuración necesaria</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Necesitas habilitar la autenticación por email/password en la consola de Firebase:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Ve a la{" "}
                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center"
                    >
                      Consola de Firebase <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                  <li>Selecciona tu proyecto</li>
                  <li>Ve a "Authentication" en el menú lateral</li>
                  <li>Haz clic en la pestaña "Sign-in method"</li>
                  <li>Habilita el proveedor "Email/Password"</li>
                  <li>Guarda los cambios</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ceac.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/firebase-diagnostico" className="text-primary hover:underline">
              Ir a la página de diagnóstico de Firebase
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Volver al login normal
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
