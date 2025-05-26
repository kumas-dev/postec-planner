import { RequestHandler, Router } from 'express'

export type RouterBuilder = {
  post: <P, ResBody, ReqBody, ReqQuery>(
    path: string,
    ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]
  ) => RouterBuilder
  get: <P, ResBody, ReqBody, ReqQuery>(
    path: string,
    ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]
  ) => RouterBuilder
  put: <P, ResBody, ReqBody, ReqQuery>(
    path: string,
    ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]
  ) => RouterBuilder
  patch: <P, ResBody, ReqBody, ReqQuery>(
    path: string,
    ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]
  ) => RouterBuilder
  delete: <P, ResBody, ReqBody, ReqQuery>(
    path: string,
    ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]
  ) => RouterBuilder
  build: () => Router
}
