"use client"

import { useState, useEffect } from "react"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, type Auth } from "firebase/auth"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
