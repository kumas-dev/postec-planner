import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, SECRET_KEY } from '@/config'
import { uuidv7 } from '@/common/utils'
import { AuthenticationEntity } from '.'

export function verifyToken(token: string, secretKey = SECRET_KEY): boolean {
  try {
    jwt.verify(token, secretKey)

    return true
  } catch (e) {
    return false
  }
}

export function generateAuthentication({
  employeeId,
}: {
  employeeId: string
}): AuthenticationEntity {
  const currentTime = Math.floor(Date.now() / 1000)
  const accessToken = jwt.sign(
    {
      exp: currentTime + ACCESS_TOKEN_TTL,
      employeeId,
    },
    SECRET_KEY,
    { algorithm: 'HS256' },
  )
  const refreshToken = jwt.sign(
    { exp: currentTime + REFRESH_TOKEN_TTL },
    SECRET_KEY,
    { algorithm: 'HS256' },
  )

  return {
    id: uuidv7(),
    employeeId,
    accessToken,
    refreshToken,
    generatedAt: new Date(),
  }
}
