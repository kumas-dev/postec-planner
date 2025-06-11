import { authenticateEmployee } from '.'
import {
  authenticate,
  refreshAuthentication,
  unauthenticate,
} from '../authentication'
import { ApiRequest, ApiResponse } from '@/common/types'
import { createRouter } from '@/common/router'
import { parseOrThrow } from '@/common/utils'
import { RefreshTokenSchema, SignInSchema } from '@repo/shared-type'
import { extractEmployeeId } from '@/common/utils/extract-employee-id'

async function signInAction(
  req: ApiRequest,
  res: ApiResponse<{
    accessToken: string
    refreshToken: string
  }>,
) {
  const { id, password } = parseOrThrow(SignInSchema, req.body)

  const employee = await authenticateEmployee({ id, password })

  const { accessToken, refreshToken } = await authenticate(employee.id)

  res.json({
    data: {
      accessToken,
      refreshToken,
    },
  })
}

async function signOutAction(req: ApiRequest, res: ApiResponse) {
  const employeeId = extractEmployeeId(res)

  await unauthenticate(employeeId)

  res.sendStatus(200)
}

async function refreshTokenAction(
  req: ApiRequest,
  res: ApiResponse<{
    accessToken: string
    refreshToken: string
  }>,
) {
  const { token } = parseOrThrow(RefreshTokenSchema, req.body)

  const { accessToken, refreshToken } = await refreshAuthentication(token)

  res.json({
    data: {
      accessToken,
      refreshToken,
    },
  })
}

export function router() {
  return createRouter()
    .post('/sign-in', signInAction)
    .post('/sign-out', signOutAction)
    .post('/refresh-token', refreshTokenAction)
    .build()
}
