import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '@/common/types'
import {
  generateAuthentication,
  verifyToken,
  AuthenticationEntity,
  authenticationRepository,
} from '.'

export async function authenticate(
  employeeId: string,
  {
    findActiveAuthentication = authenticationRepository.findActiveAuthentication,
    createAuthentication = authenticationRepository.createAuthentication,
    markAuthenticationAsExpired = authenticationRepository.markAuthenticationAsExpired,
  } = {},
): Promise<AuthenticationEntity> {
  if (await findActiveAuthentication({ employeeId })) {
    await markAuthenticationAsExpired({ employeeId })
  }

  const authentication = generateAuthentication({ employeeId })

  return createAuthentication(authentication)
}

export async function unauthenticate(
  employeeId: string,
  {
    findActiveAuthentication = authenticationRepository.findActiveAuthentication,
    markAuthenticationAsExpired = authenticationRepository.markAuthenticationAsExpired,
  } = {},
): Promise<void> {
  const authentication = await findActiveAuthentication({ employeeId })

  if (!authentication) {
    throw new BadRequestError({
      message: 'Cannot find active authentication',
    })
  }

  await Promise.all([markAuthenticationAsExpired(authentication)])
}

export async function refreshAuthentication(
  refreshToken: string,
  {
    findAuthenticationByRefreshToken = authenticationRepository.findAuthenticationByRefreshToken,
    createAuthentication = authenticationRepository.createAuthentication,
    markAuthenticationAsExpired = authenticationRepository.markAuthenticationAsExpired,
  } = {},
): Promise<AuthenticationEntity> {
  const authentication = await findAuthenticationByRefreshToken(refreshToken)

  if (!authentication) {
    throw new NotFoundError()
  }

  const { employeeId, accessToken, expiredAt } = authentication

  if (expiredAt) {
    throw new BadRequestError({
      message: 'Refresh token is expired',
    })
  }

  if (!verifyToken(refreshToken)) {
    throw new UnauthorizedError({ message: 'Invalid refresh token' })
  }

  if (verifyToken(accessToken)) {
    throw new BadRequestError({
      message: 'Cannot find active authentication',
    })
  }

  await markAuthenticationAsExpired({ employeeId })

  const newAuthentication = generateAuthentication({ employeeId })

  return createAuthentication(newAuthentication)
}

export async function validateAuthentication(
  accessToken: string,
  {
    findAuthenticationByAccessToken = authenticationRepository.findAuthenticationByAccessToken,
  } = {},
): Promise<AuthenticationEntity> {
  const authentication = await findAuthenticationByAccessToken(accessToken)

  if (!authentication) {
    throw new UnauthorizedError({ message: 'Invalid access token' })
  }

  const { expiredAt } = authentication

  if (expiredAt) {
    throw new UnauthorizedError({ message: 'Access token is expired' })
  }

  if (!verifyToken(accessToken)) {
    throw new UnauthorizedError({ message: 'Invalid access token' })
  }

  return authentication
}
