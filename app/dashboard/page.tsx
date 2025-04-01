import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { RecentAssignments } from "@/components/recent-assignments"
import { CiclosOverview } from "@/components/ciclos-overview"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <StatsCards />
      <div className="flex justify-end">
        <Link href="/inicializar-ciclos">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Inicializar Ciclos Formativos
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentAssignments />
        <CiclosOverview />
      </div>
    </div>
  )
}

