import { redirect } from "next/navigation"

export default function Home() {
  // Redirigir a la página principal del dashboard
  redirect("/dashboard")
}

