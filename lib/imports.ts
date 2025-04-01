// Este archivo sirve como punto central para todas las importaciones de Firebase
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

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

// Inicializar Firebase
let app, db, auth, storage

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  db = getFirestore(app)
  auth = getAuth(app)
  storage = getStorage(app)
} catch (error) {
  console.error("Error al inicializar Firebase:", error)

  // Crear objetos vacíos para evitar errores de importación
  db = {} as any
  auth = {} as any
  storage = {} as any
}

export { app, db, auth, storage }

// Exportar también las funciones de Firestore que se usan comúnmente
export {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore"

// Exportar funciones de autenticación
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"

