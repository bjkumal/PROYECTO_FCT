"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Verificar si Firebase Auth está inicializado correctamente
    if (!auth) {
      console.error("Firebase Auth no está inicializado correctamente")
      setLoading(false)
      return () => {}
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)

      // Redireccionar según el estado de la autenticación
      if (!user && pathname !== "/login" && !pathname.includes("/forgot-password")) {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [pathname, router])

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth no está inicializado correctamente")
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Error en signIn:", error)
      throw error
    }
  }

  const signOut = async () => {
    if (!auth) {
      throw new Error("Firebase Auth no está inicializado correctamente")
    }

    try {
      await firebaseSignOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error en signOut:", error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

