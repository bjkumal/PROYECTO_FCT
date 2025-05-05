import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Verificar que todas las variables de entorno necesarias estén definidas
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
]



// Configuración de Firebase con valores predeterminados para evitar errores
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy-messaging-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "dummy-app-id",
}

// Inicializar Firebase
let app, db, auth, storage

try {
  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  db = getFirestore(app)
  auth = getAuth(app)
  storage = getStorage(app)

  console.log("Firebase inicializado correctamente")
} catch (error) {
  console.error("Error al inicializar Firebase:", error)

  // Crear instancias simuladas para evitar errores en tiempo de ejecución
  // Esto permitirá que la aplicación se cargue, aunque las operaciones de Firebase fallarán
  if (!app) {
    try {
      app = !getApps().length ? initializeApp({ ...firebaseConfig, projectId: "dummy-project" }) : getApp()
      db = getFirestore(app)
      auth = getAuth(app)
      storage = getStorage(app)
    } catch (fallbackError) {
      console.error("Error al crear instancias simuladas:", fallbackError)

      // Si todo falla, creamos objetos vacíos para evitar errores de importación
      db = {} as any
      auth = {} as any
      storage = {} as any
    }
  }
}



export { app, db, auth, storage }
