import { Express } from 'express'
import morgan, { token } from 'morgan'
import { ServerBuilderOptions } from '..'

token('remote-addr', (req, _) => req.headers['x-ip'] as string)
token('remote-user', (req, _) => req.headers['x-user-id'] as string)

export const useLoggingMiddleware = (
  server: Express,
  { useLogging }: ServerBuilderOptions,
) => {
  if (!useLogging) {
    return
  }

  server.use(
    morgan(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :res[content-length] ":referrer" ":user-agent"',
    ),
  )
}
