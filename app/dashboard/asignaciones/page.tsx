import { AsignacionesTable } from "@/components/asignaciones-table"
import { AsignacionCreateButton } from "@/components/asignacion-create-button"
import { PageHeader } from "@/components/page-header"
import { PermissionGuard } from "@/components/permission-guard"

export default function AsignacionesPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Asignaciones" description="Gestiona las asignaciones de prácticas" />
        <PermissionGuard permission="canCreate">
          <AsignacionCreateButton />
        </PermissionGuard>
      </div>
      <AsignacionesTable />
    </div>
  )
}
