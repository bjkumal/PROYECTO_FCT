"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react"
import { initializeApp } from "firebase/app"
import { getAuth, signInAnonymously, fetchSignInMethodsForEmail } from "firebase/auth"

export default function FirebaseDiagnosticoPage() {
  const [diagnosticoResultados, setDiagnosticoResultados] = useState<{
    variablesEntorno: { nombre: string; estado: "ok" | "error"; valor: string }[]
    inicializacion: "pendiente" | "ok" | "error"
    inicializacionMensaje: string
    autenticacion: "pendiente" | "ok" | "error"
    autenticacionMensaje: string
    emailPassword: "pendiente" | "ok" | "error"
    emailPasswordMensaje: string
  }>({
    variablesEntorno: [],
    inicializacion: "pendiente",
    inicializacionMensaje: "",
    autenticacion: "pendiente",
    autenticacionMensaje: "",
    emailPassword: "pendiente",
    emailPasswordMensaje: "",
  })

  useEffect(() => {
    // Verificar variables de entorno
    const variablesRequeridas = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]

    const resultadosVariables = variablesRequeridas.map((nombre) => {
      const valor = process.env[nombre]
      return {
        nombre,
        estado: valor ? ("ok" as const) : ("error" as const),
        // Mostrar solo los primeros 5 caracteres por seguridad
        valor: valor ? `${valor.substring(0, 5)}...` : "No definido",
      }
    })

    setDiagnosticoResultados((prev) => ({
      ...prev,
      variablesEntorno: resultadosVariables,
    }))
  }, [])

  const probarInicializacion = async () => {
    try {
      // Intentar inicializar Firebase con las variables de entorno actuales
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }

      const app = initializeApp(firebaseConfig, "diagnostico")

      setDiagnosticoResultados((prev) => ({
        ...prev,
        inicializacion: "ok",
        inicializacionMensaje: "Firebase inicializado correctamente",
      }))

      return app
    } catch (error: any) {
      console.error("Error al inicializar Firebase:", error)
      setDiagnosticoResultados((prev) => ({
        ...prev,
        inicializacion: "error",
        inicializacionMensaje: `Error: ${error.message || JSON.stringify(error)}`,
      }))
      return null
    }
  }

  const probarAutenticacion = async () => {
    try {
      const app = await probarInicializacion()
      if (!app) {
        throw new Error("No se pudo inicializar Firebase")
      }

      const auth = getAuth(app)

      // Intentar autenticación anónima (debe estar habilitada en la consola de Firebase)
      await signInAnonymously(auth)

      setDiagnosticoResultados((prev) => ({
        ...prev,
        autenticacion: "ok",
        autenticacionMensaje: "Autenticación anónima exitosa",
      }))
    } catch (error: any) {
      console.error("Error al probar autenticación:", error)
      setDiagnosticoResultados((prev) => ({
        ...prev,
        autenticacion: "error",
        autenticacionMensaje: `Error: ${error.code || ""} - ${error.message || JSON.stringify(error)}`,
      }))
    }
  }

  const probarEmailPassword = async () => {
    try {
      const app = await probarInicializacion()
      if (!app) {
        throw new Error("No se pudo inicializar Firebase")
      }

      const auth = getAuth(app)

      // Verificar si el método de email/password está habilitado
      // Usamos fetchSignInMethodsForEmail con un email de prueba
      const email = "test@example.com"
      try {
        await fetchSignInMethodsForEmail(auth, email)

        setDiagnosticoResultados((prev) => ({
          ...prev,
          emailPassword: "ok",
          emailPasswordMensaje: "La autenticación por email/password parece estar habilitada",
        }))
      } catch (error: any) {
        if (error.code === "auth/operation-not-allowed") {
          setDiagnosticoResultados((prev) => ({
            ...prev,
            emailPassword: "error",
            emailPasswordMensaje: "La autenticación por email/password no está habilitada en Firebase",
          }))
        } else {
          // Si hay otro error, pero no es "operation-not-allowed", asumimos que email/password está habilitado
          setDiagnosticoResultados((prev) => ({
            ...prev,
            emailPassword: "ok",
            emailPasswordMensaje: "La autenticación por email/password parece estar habilitada",
          }))
        }
      }
    } catch (error: any) {
      console.error("Error al probar email/password:", error)
      setDiagnosticoResultados((prev) => ({
        ...prev,
        emailPassword: "error",
        emailPasswordMensaje: `Error: ${error.code || ""} - ${error.message || JSON.stringify(error)}`,
      }))
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Firebase</CardTitle>
          <CardDescription>Esta página ayuda a diagnosticar problemas con la configuración de Firebase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Variables de entorno</h3>
            <div className="space-y-2">
              {diagnosticoResultados.variablesEntorno.map((variable) => (
                <div key={variable.nombre} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{variable.nombre}:</span> {variable.valor}
                  </div>
                  {variable.estado === "ok" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Inicialización de Firebase</h3>
            <div className="space-y-2">
              <Button onClick={probarInicializacion}>Probar inicialización</Button>

              {diagnosticoResultados.inicializacion !== "pendiente" && (
                <Alert variant={diagnosticoResultados.inicializacion === "ok" ? "default" : "destructive"}>
                  {diagnosticoResultados.inicializacion === "ok" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{diagnosticoResultados.inicializacion === "ok" ? "Éxito" : "Error"}</AlertTitle>
                  <AlertDescription>{diagnosticoResultados.inicializacionMensaje}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Autenticación anónima</h3>
            <div className="space-y-2">
              <Button onClick={probarAutenticacion}>Probar autenticación anónima</Button>

              {diagnosticoResultados.autenticacion !== "pendiente" && (
                <Alert variant={diagnosticoResultados.autenticacion === "ok" ? "default" : "destructive"}>
                  {diagnosticoResultados.autenticacion === "ok" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{diagnosticoResultados.autenticacion === "ok" ? "Éxito" : "Error"}</AlertTitle>
                  <AlertDescription>{diagnosticoResultados.autenticacionMensaje}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Autenticación por Email/Password</h3>
            <div className="space-y-2">
              <Button onClick={probarEmailPassword}>Probar Email/Password</Button>

              {diagnosticoResultados.emailPassword !== "pendiente" && (
                <Alert variant={diagnosticoResultados.emailPassword === "ok" ? "default" : "destructive"}>
                  {diagnosticoResultados.emailPassword === "ok" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{diagnosticoResultados.emailPassword === "ok" ? "Éxito" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {diagnosticoResultados.emailPasswordMensaje}
                    {diagnosticoResultados.emailPassword === "error" && (
                      <div className="mt-2">
                        <p>Para habilitar la autenticación por email/password:</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-1">
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
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Solución alternativa</AlertTitle>
            <AlertDescription>
              Si continúas teniendo problemas, considera usar la página de login alternativa en /login-alternativo
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
