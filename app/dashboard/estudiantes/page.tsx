import { EstudiantesTable } from "@/components/estudiantes-table"
import { EstudianteCreateButton } from "@/components/estudiante-create-button"
import { PageHeader } from "@/components/page-header"
import { PermissionGuard } from "@/components/permission-guard"

export default function EstudiantesPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Estudiantes" description="Gestiona los estudiantes del centro" />
        <PermissionGuard permission="canCreate">
          <EstudianteCreateButton />
        </PermissionGuard>
      </div>
      <EstudiantesTable />
    </div>
  )
}
