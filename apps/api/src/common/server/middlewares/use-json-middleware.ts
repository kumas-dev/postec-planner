import express, { Express } from 'express'
import { ServerBuilderOptions } from '..'

export const useJsonMiddleware = (
  server: Express,
  { useJson }: ServerBuilderOptions,
) => {
  if (!useJson) {
    return
  }

  server.use(express.json())
}
