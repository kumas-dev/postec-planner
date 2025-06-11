import { EmployeeEntity } from '@/employee'

export type StaffId = {
  SN: number
  ID: string
  PW: string
  ACCESS: number
  RESET: number
  TEL: string
  DEPOT: string
  RFCODE: string
  SORT: number
  NAVI_TYPE: number
  LAST_HELPER: string
  LOGDATE: Date
  LOGREAD: string
  USE_BUYCODE: string
}

export function migrateEmployee(data: StaffId): EmployeeEntity {
  const { ID, PW, ACCESS, DEPOT } = data

  return {
    id: `${ID}`,
    name: ID,
    password: PW,
    permission: ACCESS < 3 ? 'admin' : 'common',
    warehouseId: DEPOT,
  }
}
