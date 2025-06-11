import { UpdateDeviceTokenSchema } from '@repo/shared-type'
import { updateDevice } from '.'
import { ApiRequest, ApiResponse } from '../common/types'
import { extractEmployeeId } from '@/common/utils/extract-employee-id'
import { parseOrThrow } from '@/common/utils'
import { createRouter } from '@/common/router'

async function updateDeviceTokenAction(
  { body }: ApiRequest,
  res: ApiResponse,
) {
  const employeeId = extractEmployeeId(res)

  const { token } = parseOrThrow(UpdateDeviceTokenSchema, body)

  await updateDevice({ employeeId, token })

  res.sendStatus(204)
}

export function router() {
  return createRouter().put('/', updateDeviceTokenAction).build()
}
