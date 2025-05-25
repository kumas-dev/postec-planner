import express, { Express } from 'express'

export function createApp(): Express {
  const app = express()

  app.use(express.json())
  app.get('/health', (_, res) => {
    res.json({ status: 'ok' })
  })

  return app
}
