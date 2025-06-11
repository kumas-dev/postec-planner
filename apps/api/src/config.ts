import { tryParseEnvironment, tryParseInt } from '@/common/utils'

export const ENVIRONMENT = tryParseEnvironment(process.env.ENVIRONMENT)
export const LEGACY_SECRET_KEY = process.env.LEGACY_SECRET_KEY
export const SECRET_KEY =
  process.env.SECRET_KEY || 'a-default-secret-key-for-dgpst'
export const ACCESS_TOKEN_TTL =
  tryParseInt(process.env.ACCESS_TOKEN_TTL) ?? 60 * 60 * 24 * 30
export const REFRESH_TOKEN_TTL =
  tryParseInt(process.env.REFRESH_TOKEN_TTL) ?? 60 * 60 * 24 * 180

export const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY
