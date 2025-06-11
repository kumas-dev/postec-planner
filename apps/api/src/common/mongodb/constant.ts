import { MongodbBuilderOptions } from './type'

export const DEFAULT_MONGODB_OPTIONS: MongodbBuilderOptions = {
  databaseUrl: process.env.DATABASE_URL,
}
