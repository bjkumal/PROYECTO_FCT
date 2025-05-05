import { PageHeader } from "@/components/page-header"
import { UsuariosTable } from "@/components/usuarios-table"
import { UsuarioCreateButton } from "@/components/usuario-create-button"
import { PermissionGuard } from "@/components/permission-guard"

export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader heading="Gestión de Usuarios" text="Administra los usuarios y sus roles en el sistema.">
        <PermissionGuard permission="canManageUsers">
          <UsuarioCreateButton />
        </PermissionGuard>
      </PageHeader>
      <UsuariosTable />
    </div>
  )
}
