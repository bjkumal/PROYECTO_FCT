"use client"

import { usePendingTasks } from "@/context/pending-tasks-context"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Clock, Building2, GraduationCap, Link2, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function PendingTasksPage() {
  const { pendingTasks, loading, removePendingTask } = usePendingTasks()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "empresa":
        return <Building2 className="h-5 w-5 text-blue-500" />
      case "estudiante":
        return <GraduationCap className="h-5 w-5 text-green-500" />
      case "asignacion":
        return <Link2 className="h-5 w-5 text-purple-500" />
      case "ciclo":
        return <BookOpen className="h-5 w-5 text-amber-500" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
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

  const handleEditTask = (taskId: string, type: string) => {
    router.push(`/dashboard/pendientes/${type}/${taskId}`)
  }

  const handleDeleteTask = async (taskId: string) => {
    await removePendingTask(taskId)
  }

  const filteredTasks = activeTab === "all" ? pendingTasks : pendingTasks.filter((task) => task.type === activeTab)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tareas Pendientes"
        description="Gestiona los registros que has guardado para completar más tarde."
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="empresa">Empresas</TabsTrigger>
          <TabsTrigger value="estudiante">Estudiantes</TabsTrigger>
          <TabsTrigger value="asignacion">Asignaciones</TabsTrigger>
          <TabsTrigger value="ciclo">Ciclos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Cargando tareas pendientes...</p>
              </CardContent>
            </Card>
          ) : filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(task.type)}
                        <Badge variant="outline">{getTypeLabel(task.type)}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditTask(task.id, task.type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(task.createdAt), "dd MMMM yyyy, HH:mm", { locale: es })}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => handleEditTask(task.id, task.type)} className="gap-1">
                        <Edit className="h-3.5 w-3.5" />
                        Continuar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No tienes tareas pendientes</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
