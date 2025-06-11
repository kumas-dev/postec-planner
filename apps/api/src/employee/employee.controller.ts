import { Request, Response } from 'express'
import { buildEmployeeView, findMyEmployee } from '.'
import { ApiRequest, ApiResponse, UnauthorizedError } from '@/common/types'
import { EmployeeResponse } from '@repo/shared-type'
import { createRouter } from '@/common/router'
import { extractEmployeeId } from '@/common/utils/extract-employee-id'

async function findMyEmployeeAction(
  _: ApiRequest,
  res: ApiResponse<{ employee: EmployeeResponse }>,
) {
  const employeeId = extractEmployeeId(res)

  const employee = await findMyEmployee({ id: employeeId })

  res.json({
    data: { employee: buildEmployeeView(employee) },
  })
}

export function router() {
  return createRouter().get('/me', findMyEmployeeAction).build()
}
