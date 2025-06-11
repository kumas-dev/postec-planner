import { ApiResponse, UnauthorizedError } from '../types'

export function extractEmployeeId(res: ApiResponse<never>): string {
  const { employeeId } = res.locals

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  return employeeId
}
