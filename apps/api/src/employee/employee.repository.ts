import { defaultKyselyContext } from '@/common/postec-data-client'
import { migrateEmployee } from '@/common/legacy-types'
import { EmployeeEntity } from '.'

async function findEmployees({ db } = defaultKyselyContext): Promise<
  EmployeeEntity[]
> {
  const rows = await db.selectFrom('Staff_Id').selectAll().execute()

  return rows.map(migrateEmployee)
}

async function findEmployee(
  id: string,
  { db } = defaultKyselyContext,
): Promise<EmployeeEntity | null> {
  const row = await db
    .selectFrom('Staff_Id')
    .selectAll()
    .where('ID', '=', id)
    .executeTakeFirst()

  return row ? migrateEmployee(row) : null
}

async function findAdminEmployees({ db } = defaultKyselyContext): Promise<
  EmployeeEntity[]
> {
  const rows = await db
    .selectFrom('Staff_Id')
    .selectAll()
    .where('ACCESS', '<', 3)
    .execute()

  return rows.map(migrateEmployee)
}

export const employeeRepository = {
  findEmployees,
  findEmployee,
  findAdminEmployees,
}
