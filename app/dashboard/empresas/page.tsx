import { EmpresasTable } from "@/components/empresas-table"
import { EmpresaCreateButton } from "@/components/empresa-create-button"
import { PageHeader } from "@/components/page-header"
import { PermissionGuard } from "@/components/permission-guard"

export default function EmpresasPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Empresas" description="Gestiona las empresas colaboradoras" />
        <PermissionGuard permission="canCreate">
          <EmpresaCreateButton />
        </PermissionGuard>
      </div>
      <EmpresasTable />
    </div>
  )
}
