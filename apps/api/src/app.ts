import { createServer } from './common/server'
import * as employee from './employee'
import * as auth from './auth'
import * as addressMatch from './address-match'

export function createApp() {
  return createServer()
    .router('/v1/employees', employee.router())
    .router('/v1/auth', auth.router())
    .router('/v1/address-match', addressMatch.router())
    .build()
}
