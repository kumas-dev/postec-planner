import express, { Express } from 'express'
import { ServerBuilderOptions } from '..'

export const useUrlencodedMiddleware = (
  server: Express,
  { useUrlencoded }: ServerBuilderOptions,
) => {
  if (!useUrlencoded) {
    return
  }

  server.use(express.urlencoded({ extended: true }))
}
