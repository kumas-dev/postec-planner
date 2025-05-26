import { createServer } from './common/server'

export function createApp() {
  return createServer().build()
}
