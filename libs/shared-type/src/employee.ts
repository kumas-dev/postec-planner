import { Permission } from './enums'

export type EmployeeResponse = {
  id: string
  name: string
  permission: Permission
  warehouseId: string
}
