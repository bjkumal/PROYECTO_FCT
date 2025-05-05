"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { type UserRole, ROLE_PERMISSIONS, type UserPermissions } from "@/types/auth-types"

interface AuthContextType {
  user: User | null
  loading: boolean
  userRole: UserRole | null
  permissions: UserPermissions | null
  hasPermission: (action: keyof UserPermissions) => boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  permissions: null,
  hasPermission: () => false,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Verificación de Firestore mejorada
  const fetchUserRole = async (userId: string) => {
    try {
      // Verificar si Firestore está inicializado correctamente
      if (!db) {
        console.warn("Firestore no está inicializado correctamente, usando rol predeterminado")
        setUserRole("admin")
        setPermissions(ROLE_PERMISSIONS["admin"])
        return
      }

      try {
        const userDoc = await getDoc(doc(db, "users", userId))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          const role = (userData.role as UserRole) || "registrador"
          console.log(`Usuario ${userId} tiene rol: ${role}`)
          setUserRole(role)
          setPermissions(ROLE_PERMISSIONS[role])
          console.log(`Permisos asignados: `, ROLE_PERMISSIONS[role])
        } else {
          console.warn(`No se encontró documento para el usuario ${userId}, asignando rol predeterminado`)
          setUserRole("admin")
          setPermissions(ROLE_PERMISSIONS["admin"])
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
        setUserRole("admin")
        setPermissions(ROLE_PERMISSIONS["admin"])
      }
    } catch (error) {
      console.error("Error general en fetchUserRole:", error)
      setUserRole("admin")
      setPermissions(ROLE_PERMISSIONS["admin"])
    }
  }

  useEffect(() => {
    // Verificar si Firebase Auth está inicializado correctamente
    if (!auth) {
      console.error("Firebase Auth no está inicializado correctamente")
      setLoading(false)
      return () => {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Estado de autenticación cambiado:", user ? `Usuario ${user.uid} autenticado` : "No autenticado")
      setUser(user)

      if (user) {
        try {
          await fetchUserRole(user.uid)
        } catch (error) {
          console.error("Error al obtener el rol del usuario:", error)
          setUserRole("admin")
          setPermissions(ROLE_PERMISSIONS["admin"])
        }
      } else {
        setUserRole(null)
        setPermissions(null)
      }

      setLoading(false)

      // Redireccionar según el estado de la autenticación
      if (
        !user &&
        pathname !== "/login" &&
        !pathname.includes("/crear-admin") &&
        !pathname.includes("/login-alternativo") &&
        !pathname.includes("/firebase-diagnostico")
      ) {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [pathname, router])

  const hasPermission = (action: keyof UserPermissions): boolean => {
    if (!permissions) return false
    return permissions[action]
  }

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth no está inicializado correctamente")
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await fetchUserRole(userCredential.user.uid)
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
      setUserRole(null)
      setPermissions(null)
      router.push("/login")
    } catch (error) {
      console.error("Error en signOut:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userRole,
        permissions,
        hasPermission,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
