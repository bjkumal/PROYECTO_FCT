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
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info, CheckCircle } from "lucide-react"
import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"

export default function CrearAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccess(false)

    try {
      // Configuración de Firebase
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }

      // Inicializar Firebase
      const app = initializeApp(firebaseConfig, "crear-admin")
      const auth = getAuth(app)

      // Crear usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Actualizar perfil con nombre
      if (nombre) {
        await updateProfile(userCredential.user, {
          displayName: nombre,
        })
      }

      setSuccess(true)
      toast({
        title: "Usuario administrador creado",
        description: "El usuario administrador se ha creado correctamente.",
      })
    } catch (error: any) {
      console.error("Error al crear usuario:", error)

      let message = "No se pudo crear el usuario administrador."

      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            message = "Este correo electrónico ya está en uso."
            break
          case "auth/invalid-email":
            message = "El formato del correo electrónico no es válido."
            break
          case "auth/weak-password":
            message = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres."
            break
          case "auth/operation-not-allowed":
            message = "La creación de usuarios no está habilitada."
            break
          default:
            message = `Error: ${error.message || error.code}`
        }
      }

      setErrorMessage(message)

      toast({
        title: "Error al crear usuario",
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
          <CardTitle className="text-2xl">Crear Usuario Administrador</CardTitle>
          <CardDescription>Crea un usuario administrador para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Configuración inicial</AlertTitle>
            <AlertDescription>
              Esta página te permite crear un usuario administrador para iniciar sesión en el sistema. Úsala solo para
              la configuración inicial.
            </AlertDescription>
          </Alert>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Usuario creado correctamente</AlertTitle>
              <AlertDescription>
                El usuario administrador se ha creado correctamente. Ahora puedes iniciar sesión.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ceac.edu"
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
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 6 caracteres.</p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || success}>
              {isLoading ? "Creando usuario..." : "Crear Usuario Administrador"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Volver a la página de inicio de sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
