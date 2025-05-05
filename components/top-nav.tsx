"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { usePendingTasks } from "@/context/pending-tasks-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Sun, Moon, User, Monitor, Edit, Trash2, Clock, FileEdit, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { ROLE_NAMES } from "@/types/auth-types"

export function TopNav() {
  const { user, signOut, userRole } = useAuth()
  const { setTheme } = useTheme()
  const { pendingTasks, count, removePendingTask } = usePendingTasks()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const router = useRouter()

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "US"

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-300"
      case "coordinador":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "registrador":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return ""
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "empresa":
        return "🏢"
      case "estudiante":
        return "👨‍🎓"
      case "asignacion":
        return "🔗"
      case "ciclo":
        return "📚"
      default:
        return "📝"
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
    setNotificationsOpen(false)
    router.push(`/dashboard/pendientes/${type}/${taskId}`)
  }

  const handleDeleteTask = async (taskId: string) => {
    await removePendingTask(taskId)
  }

  return (
    <header className="h-16 border-b flex items-center px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="ml-auto flex items-center gap-4">
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              {count > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {count}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <div className="font-medium">Tareas pendientes</div>
              <div className="text-xs text-muted-foreground">Registros que has guardado para completar más tarde</div>
            </div>
            {count > 0 ? (
              <ScrollArea className="h-[300px]">
                <div className="p-2">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="p-2 hover:bg-muted rounded-md">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <div className="text-xl">{getTypeIcon(task.type)}</div>
                          <div>
                            <div className="font-medium text-sm">{task.title}</div>
                            <div className="text-xs text-muted-foreground">{task.description}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(task.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEditTask(task.id, task.type)}
                          >
                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {getTypeLabel(task.type)}
                      </Badge>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No tienes tareas pendientes</div>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-muted/50">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-500" />
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              Claro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-blue-500" />
              Oscuro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 border-2 border-primary/20 hover:border-primary transition-colors">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-2 p-2">
              <div className="flex items-center justify-start gap-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.displayName || "Usuario"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(userRole)}`}>
                  {ROLE_NAMES[userRole as keyof typeof ROLE_NAMES] || "Usuario"}
                </Badge>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracion" className="flex items-center gap-2 cursor-pointer w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/pendientes" className="flex items-center gap-2 cursor-pointer w-full">
                <FileEdit className="mr-2 h-4 w-4" />
                <span>Tareas pendientes</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {count}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="text-red-500 focus:text-red-500">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
