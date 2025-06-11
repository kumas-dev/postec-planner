import { Request as ExpressRequest, Response as ExpressResponse } from 'express'

export type ApiRequest = ExpressRequest<unknown, unknown, unknown, unknown>
export type ApiResponse<T = unknown> = ExpressResponse<{ data: T }>

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Locals {
      employeeId?: string
    }
  }
}
