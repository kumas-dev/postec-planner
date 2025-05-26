import { Express } from 'express'
import { ServerBuilderOptions } from '..'

export const useHealthMiddleware = (
  server: Express,
  { useHealth }: ServerBuilderOptions,
) => {
  if (!useHealth) {
    return
  }

  server.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok' })
  })
}
