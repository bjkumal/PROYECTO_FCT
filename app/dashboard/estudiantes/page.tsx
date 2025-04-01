import { EstudiantesTable } from "@/components/estudiantes-table"
import { PageHeader } from "@/components/page-header"
import { EstudianteCreateButton } from "@/components/estudiante-create-button"
import { Suspense } from "react"
import { TableSkeleton } from "@/components/table-skeleton"

export default function EstudiantesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Estudiantes"
        description="Gestiona los estudiantes que participan en FCT."
        actions={<EstudianteCreateButton />}
      />
      <Suspense fallback={<TableSkeleton columns={5} rows={5} />}>
        <EstudiantesTable />
      </Suspense>
    </div>
  )
}

