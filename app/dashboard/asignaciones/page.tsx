import { AsignacionesTable } from "@/components/asignaciones-table"
import { PageHeader } from "@/components/page-header"
import { AsignacionCreateButton } from "@/components/asignacion-create-button"
import { Suspense } from "react"
import { TableSkeleton } from "@/components/table-skeleton"

export default function AsignacionesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Asignaciones"
        description="Gestiona las asignaciones de estudiantes a empresas para FCT."
        actions={<AsignacionCreateButton />}
      />
      <Suspense fallback={<TableSkeleton columns={5} rows={5} />}>
        <AsignacionesTable />
      </Suspense>
    </div>
  )
}

