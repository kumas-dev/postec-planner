import { EmployeeEntity, employeeRepository } from '.'
import { NotFoundError } from '../common/types'

export async function findMyEmployee(
  { id }: { id: string },
  { findEmployee = employeeRepository.findEmployee } = {},
): Promise<EmployeeEntity> {
  const employee = await findEmployee(id)

  if (!employee) {
    throw new NotFoundError()
  }

  return employee
}
