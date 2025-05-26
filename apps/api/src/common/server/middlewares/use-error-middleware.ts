import { Express, NextFunction, Request, Response } from 'express'
import { captureException } from '@sentry/node'
import { HttpError } from '@/common/types'
import { ServerBuilderOptions } from '..'

export const useErrorMiddleware = (
  server: Express,
  { useError, sentryDsn }: ServerBuilderOptions,
) => {
  if (!useError) {
    return
  }

  server.use((e: Error, req: Request, res: Response, _: NextFunction) => {
    const userId = req.header('x-user-id')
    const version = req.header('x-version')

    if (sentryDsn) {
      captureException(e, (scope) => {
        scope.clear()

        scope.setUser({ id: userId })
        scope.setTags({ version })
        scope.setExtras({
          error: {
            name: e.name,
            ...(e.message?.length > 0 && { message: e.message }),
            ...(e instanceof HttpError && { error: e.error, code: e.code }),
          },
        })
        return scope
      })
    }

    res.status(e instanceof HttpError ? e.status : 500).json({
      error: {
        name: e.name,
        ...(e.message?.length > 0 && { message: e.message }),
        ...(e instanceof HttpError && { error: e.error, code: e.code }),
      },
    })
  })
}
