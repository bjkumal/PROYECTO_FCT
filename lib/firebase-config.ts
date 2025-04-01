// Configuración básica de Firebase
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

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
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { app, db, auth }

