"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ExternalLink } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showAuthHelp, setShowAuthHelp] = useState(false)
  const [showUserHelp, setShowUserHelp] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setShowAuthHelp(false)
    setShowUserHelp(false)

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error de autenticación:", error)

      // Manejar diferentes tipos de errores de Firebase
      let message = "No se ha podido iniciar sesión. Verifica tus credenciales."

      if (error.code) {
        switch (error.code) {
          case "auth/user-not-found":
            message = "No existe ningún usuario con este correo electrónico."
            setShowUserHelp(true)
            break
          case "auth/wrong-password":
            message = "Contraseña incorrecta."
            break
          case "auth/invalid-email":
            message = "El formato del correo electrónico no es válido."
            break
          case "auth/invalid-credential":
            message = "Credenciales inválidas. El usuario no existe o la contraseña es incorrecta."
            setShowUserHelp(true)
            break
          case "auth/configuration-not-found":
            message = "Error de configuración de Firebase. Por favor, verifica la configuración."
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
            <Image src="/images/CEAC-FP-RGB-Azul.png" alt="Logo CEAC" width={180} height={70} className="dark:hidden" />
            <Image
              src="/images/CEAC-FP-RGB-Negro.png"
              alt="Logo CEAC"
              width={180}
              height={70}
              className="hidden dark:block invert"
            />
          </div>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>Accede a la plataforma de gestión de FCT</CardDescription>
        </CardHeader>
        <CardContent>
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

          {showUserHelp && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Usuario no encontrado</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>No se encontró ningún usuario con estas credenciales. Puedes crear un usuario administrador:</p>
                <div className="mt-2">
                  <Link href="/crear-admin" className="text-primary hover:underline">
                    Crear usuario administrador
                  </Link>
                </div>
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
            ¿Olvidaste tu contraseña?{" "}
            <Link href="/forgot-password" className="text-primary hover:underline">
              Recuperar acceso
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
