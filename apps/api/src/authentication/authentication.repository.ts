import { collection } from '@/common/mongodb-client'
import { NotFoundError } from '@/common/types'
import { AuthenticationEntity } from '.'

const authentications = collection<AuthenticationEntity>('authentications')

export async function createIndexesToAuthentication() {
  await authentications.createIndex(
    { employeeId: 1 },
    { unique: true, partialFilterExpression: { expiredAt: null } },
  )

  await authentications.createIndex([
    ['employeeId', 1],
    ['expiredAt', -1],
  ])

  await authentications.createIndex({ accessToken: 1 }, { unique: true })
  await authentications.createIndex({ refreshToken: 1 }, { unique: true })
}

async function findAuthentication(id: string): Promise<AuthenticationEntity> {
  const document = await authentications.findOne({ _id: id })

  if (!document) {
    throw new NotFoundError()
  }

  return document
}

async function findAuthenticationByAccessToken(
  accessToken: string,
): Promise<AuthenticationEntity | null> {
  return authentications.findOne({ accessToken })
}

async function findAuthenticationByRefreshToken(
  refreshToken: string,
): Promise<AuthenticationEntity | null> {
  return authentications.findOne({ refreshToken })
}

async function findActiveAuthentication({
  employeeId,
}: {
  employeeId: string
}): Promise<AuthenticationEntity | null> {
  return authentications.findOne({
    employeeId,
    expiredAt: { $exists: false },
  })
}

async function createAuthentication(
  authentication: AuthenticationEntity,
): Promise<AuthenticationEntity> {
  await authentications.insertOne(authentication)

  return authentication
}

async function markAuthenticationAsExpired({
  employeeId,
}: {
  employeeId: string
}): Promise<void> {
  const { acknowledged } = await authentications.updateOne(
    { employeeId, expiredAt: { $exists: false } },
    { $set: { expiredAt: new Date() } },
  )

  if (!acknowledged) {
    throw new Error('Failed to mark authentication as expired')
  }
}

export const authenticationRepository = {
  findAuthentication,
  findAuthenticationByAccessToken,
  findAuthenticationByRefreshToken,
  findActiveAuthentication,
  createAuthentication,
  markAuthenticationAsExpired,
}
