import { EmpresasTable } from "@/components/empresas-table"
import { PageHeader } from "@/components/page-header"
import { EmpresaCreateButton } from "@/components/empresa-create-button"
import { Suspense } from "react"
import { TableSkeleton } from "@/components/table-skeleton"

export default function EmpresasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Empresas Colaboradoras"
        description="Gestiona las empresas que ofrecen plazas para FCT."
        actions={<EmpresaCreateButton />}
      />
      <Suspense fallback={<TableSkeleton columns={5} rows={5} />}>
        <EmpresasTable />
      </Suspense>
    </div>
  )
}

