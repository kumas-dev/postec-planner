import { Request, Response, NextFunction } from 'express'

export async function headerParseMiddleware<P, ResBody, ReqBody, ReqQuery>(
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody, Record<string, unknown>>,
  next: NextFunction,
) {
  const userContext = req.headers['x-user-context']
  const clientContext = req.headers['x-client-context']

  res.locals.userContext =
    typeof userContext === 'string'
      ? JSON.parse(Buffer.from(userContext, 'base64').toString())
      : null

  res.locals.clientContext =
    typeof clientContext === 'string'
      ? JSON.parse(Buffer.from(clientContext, 'base64').toString())
      : null

  next()
}
