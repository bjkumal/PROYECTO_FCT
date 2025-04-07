"use client"

import { useState, useEffect } from "react"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, type Auth } from "firebase/auth"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDyTcdYHPBFtWLlbBzLCmTrPxBiFn8uCSw",
  authDomain: "ceac-fct-11dd6.firebaseapp.com",
  projectId: "ceac-fct-11dd6",
  storageBucket: "ceac-fct-11dd6.firebasestorage.app",
  messagingSenderId: "119628552506",
  appId: "1:119628552506:web:00236327b0fa4f6f751803",
  measurementId: "G-RB7GCTR1K7"
}

export function useFirebase() {
  const [db, setDb] = useState<Firestore | null>(null)
  const [auth, setAuth] = useState<Auth | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Initialize Firebase
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
      const firestoreInstance = getFirestore(app)
      const authInstance = getAuth(app)

      setDb(firestoreInstance)
      setAuth(authInstance)
      setLoading(false)
    } catch (err) {
      console.error("Error al inicializar Firebase:", err)
      setError(err instanceof Error ? err : new Error("Error desconocido al inicializar Firebase"))
      setLoading(false)
    }
  }, [])

  return { db, auth, error, loading }
}

