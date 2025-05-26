import { EmployeeResponse, Permission } from '@repo/shared-type'

export type EmployeeEntity = {
  id: string
  password: string
  name: string
  permission: Permission
  warehouseId: string
}

export function buildEmployeeView(employee: EmployeeEntity): EmployeeResponse {
  const { password: _, ...rest } = employee
  return {
    ...rest,
  }
}
