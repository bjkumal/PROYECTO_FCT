"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import {
  getAuth,
  updatePassword,
  updateEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { Moon, Sun, Monitor, User, Eye, EyeOff, Save, RefreshCw } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function ConfiguracionPage() {
  const { setTheme, theme } = useTheme()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Configuración de perfil
  const [perfil, setPerfil] = useState({
    nombre: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  })

  useEffect(() => {
    if (user) {
      setPerfil({
        ...perfil,
        nombre: user.displayName || "",
        email: user.email || "",
      })
    }
  }, [user])

  const handlePerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPerfil({
      ...perfil,
      [name]: value,
    })
  }

  const handlePerfilSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!user) {
        throw new Error("No hay usuario autenticado")
      }

      const auth = getAuth()
      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error("No hay usuario autenticado")
      }

      // Si se ha cambiado el nombre, actualizarlo
      if (perfil.nombre !== user.displayName) {
        await updateProfile(currentUser, {
          displayName: perfil.nombre,
        })
      }

      // Si se ha cambiado el email, actualizarlo
      if (perfil.email !== user.email && perfil.currentPassword) {
        // Reautenticar al usuario
        const credential = EmailAuthProvider.credential(user.email || "", perfil.currentPassword)
        await reauthenticateWithCredential(currentUser, credential)
        await updateEmail(currentUser, perfil.email)
      }

      // Si se ha cambiado la contraseña, actualizarla
      if (perfil.newPassword && perfil.currentPassword) {
        // Reautenticar al usuario
        const credential = EmailAuthProvider.credential(user.email || "", perfil.currentPassword)
        await reauthenticateWithCredential(currentUser, credential)
        await updatePassword(currentUser, perfil.newPassword)

        // Limpiar los campos de contraseña
        setPerfil({
          ...perfil,
          currentPassword: "",
          newPassword: "",
        })
      }

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil se ha actualizado correctamente.",
      })
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error)

      let message = "No se pudo actualizar el perfil."

      if (error.code) {
        switch (error.code) {
          case "auth/wrong-password":
            message = "La contraseña actual es incorrecta."
            break
          case "auth/weak-password":
            message = "La nueva contraseña es demasiado débil. Debe tener al menos 6 caracteres."
            break
          case "auth/requires-recent-login":
            message = "Esta operación es sensible y requiere una autenticación reciente. Inicia sesión de nuevo."
            break
          case "auth/email-already-in-use":
            message = "Este correo electrónico ya está en uso por otra cuenta."
            break
          default:
            message = `Error: ${error.message || error.code}`
        }
      }

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" description="Gestiona tus preferencias y ajustes de la aplicación." />

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="apariencia" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Apariencia</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Información de perfil</CardTitle>
              <CardDescription>Actualiza tu información personal y credenciales de acceso.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePerfilSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-base">
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={perfil.nombre}
                      onChange={handlePerfilChange}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={perfil.email}
                      onChange={handlePerfilChange}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <Separator className="my-4" />
                  <div className="section-title">Cambiar contraseña</div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-base">
                      Contraseña actual
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={perfil.currentPassword}
                        onChange={handlePerfilChange}
                        placeholder="Introduce tu contraseña actual"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Necesaria para confirmar cambios en tu email o contraseña.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-base">
                      Nueva contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={perfil.newPassword}
                        onChange={handlePerfilChange}
                        placeholder="Introduce tu nueva contraseña"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Debe tener al menos 6 caracteres.</p>
                  </div>
                </div>

                <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apariencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Apariencia</CardTitle>
              <CardDescription>Personaliza la apariencia de la aplicación según tus preferencias.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Tema</Label>
                    <p className="text-sm text-muted-foreground">Selecciona el tema de la aplicación</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="flex items-center gap-2"
                    >
                      <Sun className="h-4 w-4" />
                      Claro
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="flex items-center gap-2"
                    >
                      <Moon className="h-4 w-4" />
                      Oscuro
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                      className="flex items-center gap-2"
                    >
                      <Monitor className="h-4 w-4" />
                      Sistema
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
