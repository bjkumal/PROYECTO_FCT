"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePendingTasks, type PendingTask } from "@/context/pending-tasks-context"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { EmpresaCreateButton } from "@/components/empresa-create-button"
import { EstudianteCreateButton } from "@/components/estudiante-create-button"
import { AsignacionCreateButton } from "@/components/asignacion-create-button"
import { CicloCreateButton } from "@/components/ciclo-create-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EditPendingTaskPage() {
  const params = useParams()
  const router = useRouter()
  const { getPendingTask, removePendingTask } = usePendingTasks()
  const [task, setTask] = useState<PendingTask | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const type = params.type as string
  const id = params.id as string

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true)
        const taskData = await getPendingTask(id)
        if (taskData) {
          setTask(taskData)
        } else {
          setError("No se encontró la tarea pendiente")
        }
      } catch (err) {
        console.error("Error fetching task:", err)
        setError("Error al cargar la tarea pendiente")
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [id, getPendingTask])

  const handleBack = () => {
    router.back()
  }

  const getTypeTitle = (type: string) => {
    switch (type) {
      case "empresa":
        return "Empresa"
      case "estudiante":
        return "Estudiante"
      case "asignacion":
        return "Asignación"
      case "ciclo":
        return "Ciclo Formativo"
      default:
        return "Registro"
    }
  }

  const renderFormComponent = () => {
    if (!task) return null

    switch (type) {
      case "empresa":
        return <EmpresaCreateButton initialData={task.formData} pendingTaskId={task.id} />
      case "estudiante":
        return <EstudianteCreateButton initialData={task.formData} pendingTaskId={task.id} />
      case "asignacion":
        return <AsignacionCreateButton initialData={task.formData} pendingTaskId={task.id} />
      case "ciclo":
        return <CicloCreateButton initialData={task.formData} pendingTaskId={task.id} />
      default:
        return <div>Tipo de formulario no soportado</div>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Error"
          description="No se pudo cargar la tarea pendiente"
          actions={
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          }
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "No se encontró la tarea pendiente"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Continuar registro: ${task.title}`}
        description={`Completa el registro pendiente de ${getTypeTitle(type)}`}
        actions={
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">{renderFormComponent()}</CardContent>
      </Card>
    </div>
  )
}
