import { defaultKyselyContext } from '@/common/postec-data-database'
import { migrateEmployee } from '@/common/legacy-types'
import { EmployeeEntity } from '.'

async function findEmployees({ db } = defaultKyselyContext): Promise<
  EmployeeEntity[]
> {
  const result = await db.selectFrom('Staff_Id').selectAll().execute()

  return result.map(migrateEmployee)
}

async function findEmployee(
  id: string,
  { db } = defaultKyselyContext,
): Promise<EmployeeEntity | null> {
  const result = await db
    .selectFrom('Staff_Id')
    .selectAll()
    .where('ID', '=', id)
    .executeTakeFirst()

  return result ? migrateEmployee(result) : null
}

async function findAdminEmployees({ db } = defaultKyselyContext): Promise<
  EmployeeEntity[]
> {
  const result = await db
    .selectFrom('Staff_Id')
    .selectAll()
    .where('ACCESS', '<', 3)
    .execute()

  return result.map(migrateEmployee)
}

export const employeeRepository = {
  findEmployees,
  findEmployee,
  findAdminEmployees,
}
