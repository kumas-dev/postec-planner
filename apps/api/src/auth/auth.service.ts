import { employeeRepository, EmployeeEntity } from '../employee'
import { encrypt } from '@/common/utils'
import { UnauthorizedError } from '@/common/types'

export async function authenticateEmployee(
  { id, password }: { id: string; password: string },
  { findEmployee = employeeRepository.findEmployee } = {},
): Promise<EmployeeEntity> {
  const employee = await findEmployee(id)

  if (!employee || employee.password !== encrypt(password)) {
    throw new UnauthorizedError()
  }

  return employee
}
