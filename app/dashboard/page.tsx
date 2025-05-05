import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { RecentAssignments } from "@/components/recent-assignments"
import { CiclosOverview } from "@/components/ciclos-overview"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <StatsCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-full flex">
          <RecentAssignments />
        </div>
        <div className="h-full flex">
          <CiclosOverview />
        </div>
      </div>
    </div>
  )
}
