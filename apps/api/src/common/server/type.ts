import { Application, Express, Router } from 'express'

export type ServerBuilder = {
  router: (path: string, router: Router) => ServerBuilder
  middleware: (fn: (server: Express) => void) => ServerBuilder
  build: () => Application
}

export type ServerBuilderOptions = {
  useHealth: boolean
  useLogging: boolean
  useError: boolean
  useJson: boolean
  useUrlencoded: boolean
  sentryDsn?: string
  sentryEnvironment?: string
}
