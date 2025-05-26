import express, { Express, Router } from 'express'
import * as Sentry from '@sentry/node'
import {
  useErrorMiddleware,
  useHealthMiddleware,
  useJsonMiddleware,
  useLoggingMiddleware,
  useUrlencodedMiddleware,
} from './middlewares'
import { ServerBuilder, ServerBuilderOptions } from '.'

const DEFAULT_SERVER_OPTIONS: ServerBuilderOptions = {
  useHealth: true,
  useLogging: true,
  useError: true,
  useJson: true,
  useUrlencoded: true,
  sentryDsn: process.env.SENTRY_DSN,
  sentryEnvironment: process.env.SENTRY_ENVIRONMENT,
}

export function createServer(
  inputOptions: Partial<ServerBuilderOptions> = {},
): ServerBuilder {
  const options: ServerBuilderOptions = {
    ...DEFAULT_SERVER_OPTIONS,
    ...inputOptions,
  }

  const sentryDsn = options.sentryDsn
  const sentryEnvironment = options.sentryEnvironment ?? 'development'

  if (sentryDsn) {
    Sentry.init({ dsn: sentryDsn, environment: sentryEnvironment })
  }

  const server = express()

  useJsonMiddleware(server, options)
  useUrlencodedMiddleware(server, options)
  useLoggingMiddleware(server, options)
  useHealthMiddleware(server, options)

  const methods: ServerBuilder = {
    router: (path: string, router: Router) => {
      server.use(path, router)
      return methods
    },
    middleware: (fn: (server: Express) => void) => {
      fn(server)
      return methods
    },
    build: () => {
      useErrorMiddleware(server, options)
      return server
    },
  }

  return methods
}
