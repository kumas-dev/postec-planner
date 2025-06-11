import * as crypto from 'crypto'

import { LEGACY_SECRET_KEY } from '../../config'

export function encrypt(input: string): string {
  if (!LEGACY_SECRET_KEY) {
    throw new Error('invalid LEGACY_SECRET_KEY')
  }

  const key = Buffer.from(LEGACY_SECRET_KEY.padEnd(16, '\0'))
  const iv = key
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv)

  let encrypted = cipher.update(input, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  return encrypted
}

export function decrypt(input: string): string {
  if (!LEGACY_SECRET_KEY) {
    throw new Error('invalid LEGACY_SECRET_KEY')
  }

  const key = Buffer.from(LEGACY_SECRET_KEY.padEnd(16, '\0'))
  const iv = key
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)

  let decrypted = decipher.update(input, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
