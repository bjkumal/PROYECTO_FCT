"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc } from "firebase/firestore"
import { useAuth } from "./auth-context"
import { useToast } from "@/components/ui/use-toast"

export interface PendingTask {
  id: string
  userId: string
  type: "empresa" | "estudiante" | "asignacion" | "ciclo"
  title: string
  description: string
  formData: any
  createdAt: string
}

interface PendingTasksContextType {
  pendingTasks: PendingTask[]
  loading: boolean
  addPendingTask: (task: Omit<PendingTask, "id" | "userId" | "createdAt">) => Promise<void>
  removePendingTask: (taskId: string) => Promise<void>
  getPendingTask: (taskId: string) => Promise<PendingTask | null>
  refreshTasks: () => Promise<void>
  count: number
}

const PendingTasksContext = createContext<PendingTasksContextType>({
  pendingTasks: [],
  loading: true,
  addPendingTask: async () => {},
  removePendingTask: async () => {},
  getPendingTask: async () => null,
  refreshTasks: async () => {},
  count: 0,
})

export function PendingTasksProvider({ children }: { children: ReactNode }) {
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchPendingTasks = async () => {
    if (!user) {
      setPendingTasks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const tasksCollection = collection(db, "pendingTasks")
      const tasksSnapshot = await getDocs(tasksCollection)
      const tasksData = tasksSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<PendingTask, "id">),
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setPendingTasks(tasksData)
    } catch (error) {
      console.error("Error fetching pending tasks:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas pendientes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingTasks()
  }, [user])

  const addPendingTask = async (task: Omit<PendingTask, "id" | "userId" | "createdAt">) => {
    if (!user) return

    try {
      const newTask = {
        ...task,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, "pendingTasks"), newTask)

      setPendingTasks((prev) => [
        {
          id: docRef.id,
          ...newTask,
        },
        ...prev,
      ])

      toast({
        title: "Tarea guardada",
        description: "La tarea se ha guardado como pendiente.",
      })
    } catch (error) {
      console.error("Error adding pending task:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la tarea pendiente.",
        variant: "destructive",
      })
    }
  }

  const removePendingTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "pendingTasks", taskId))
      setPendingTasks((prev) => prev.filter((task) => task.id !== taskId))

      toast({
        title: "Tarea eliminada",
        description: "La tarea pendiente ha sido eliminada.",
      })
    } catch (error) {
      console.error("Error removing pending task:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea pendiente.",
        variant: "destructive",
      })
    }
  }

  const getPendingTask = async (taskId: string): Promise<PendingTask | null> => {
    try {
      const taskDoc = await getDoc(doc(db, "pendingTasks", taskId))
      if (taskDoc.exists()) {
        return {
          id: taskDoc.id,
          ...(taskDoc.data() as Omit<PendingTask, "id">),
        }
      }
      return null
    } catch (error) {
      console.error("Error getting pending task:", error)
      return null
    }
  }

  const refreshTasks = async () => {
    await fetchPendingTasks()
  }

  return (
    <PendingTasksContext.Provider
      value={{
        pendingTasks,
        loading,
        addPendingTask,
        removePendingTask,
        getPendingTask,
        refreshTasks,
        count: pendingTasks.length,
      }}
    >
      {children}
    </PendingTasksContext.Provider>
  )
}

export const usePendingTasks = () => useContext(PendingTasksContext)
