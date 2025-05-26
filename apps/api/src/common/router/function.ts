import {
  NextFunction,
  RequestHandler,
  Request,
  Response,
  Router,
} from 'express'
import { headerParseMiddleware } from './middlewares'
import { RouterBuilder } from '.'

function wrap<
  P,
  ResBody,
  ReqBody,
  ReqQuery,
  Locals extends Record<string, unknown>,
>(handler: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>) {
  return async (
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction,
  ) => {
    try {
      await handler(req, res, next)
    } catch (e) {
      next(e)
    }
  }
}

export function createRouter(): RouterBuilder {
  const router = Router({ mergeParams: true }).use(headerParseMiddleware)

  const methods = {
    post: <P, ResBody, ReqBody, ReqQuery>(
      path: string,
      ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery>[]
    ) => {
      router.post(path, ...handlers.map((handler) => wrap(handler)))
      return methods
    },

    get: <
      P,
      ResBody,
      ReqBody,
      ReqQuery,
      Locals extends Record<string, unknown>,
    >(
      path: string,
      ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>[]
    ) => {
      router.get(path, ...handlers.map((handler) => wrap(handler)))
      return methods
    },

    put: <
      P,
      ResBody,
      ReqBody,
      ReqQuery,
      Locals extends Record<string, unknown>,
    >(
      path: string,
      ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>[]
    ) => {
      router.put(path, ...handlers.map((handler) => wrap(handler)))
      return methods
    },

    patch: <
      P,
      ResBody,
      ReqBody,
      ReqQuery,
      Locals extends Record<string, unknown>,
    >(
      path: string,
      ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>[]
    ) => {
      router.patch(path, ...handlers.map((handler) => wrap(handler)))
      return methods
    },

    delete: <
      P,
      ResBody,
      ReqBody,
      ReqQuery,
      Locals extends Record<string, unknown>,
    >(
      path: string,
      ...handlers: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>[]
    ) => {
      router.delete(path, ...handlers.map((handler) => wrap(handler)))
      return methods
    },

    build: () => router,
  }

  return methods
}
