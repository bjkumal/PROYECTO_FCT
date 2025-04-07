import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Verificar que todas las variables de entorno necesarias estén definidas
const requiredEnvVars = [
  "AIzaSyDyTcdYHPBFtWLlbBzLCmTrPxBiFn8uCSw",
  "ceac-fct-11dd6.firebaseapp.com",
  "ceac-fct-11dd6",
  "ceac-fct-11dd6.firebasestorage.app",
  "119628552506",
  "1:119628552506:web:00236327b0fa4f6f751803",
  "G-RB7GCTR1K7",
]
// Verificar si alguna variable de entorno está faltando
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])



// Configuración de Firebase con valores predeterminados para evitar errores
const firebaseConfig = {
  apiKey: "AIzaSyDyTcdYHPBFtWLlbBzLCmTrPxBiFn8uCSw",
  authDomain: "ceac-fct-11dd6.firebaseapp.com",
  projectId: "ceac-fct-11dd6",
  storageBucket: "ceac-fct-11dd6.firebasestorage.app",
  messagingSenderId: "119628552506",
  appId: "1:119628552506:web:00236327b0fa4f6f751803",
  measurementId: "G-RB7GCTR1K7"
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

// Función auxiliar para verificar si Firebase está correctamente configurado
export const isFirebaseConfigured = () => {
  return missingEnvVars.length === 0
}

export { app, db, auth, storage }

