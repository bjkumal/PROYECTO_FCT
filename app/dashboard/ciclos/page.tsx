import { CiclosTable } from "@/components/ciclos-table"
import { CicloCreateButton } from "@/components/ciclo-create-button"
import { PageHeader } from "@/components/page-header"
import { PermissionGuard } from "@/components/permission-guard"

export default function CiclosPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Ciclos Formativos" description="Gestiona los ciclos formativos del centro" />
        <PermissionGuard permission="canCreate">
          <CicloCreateButton />
        </PermissionGuard>
      </div>
      <CiclosTable />
    </div>
  )
}
