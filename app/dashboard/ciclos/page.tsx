import { CiclosTable } from "@/components/ciclos-table"
import { PageHeader } from "@/components/page-header"
import { CicloCreateButton } from "@/components/ciclo-create-button"
import { Suspense } from "react"
import { TableSkeleton } from "@/components/table-skeleton"

export default function CiclosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ciclos Formativos"
        description="Gestiona los ciclos formativos del centro."
        actions={<CicloCreateButton />}
      />
      <Suspense fallback={<TableSkeleton columns={4} rows={5} />}>
        <CiclosTable />
      </Suspense>
    </div>
  )
}

