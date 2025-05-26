import { KyselyBuilderOptions } from '.'

export const DEFAULT_KYSELY_OPTIONS: KyselyBuilderOptions = {
  userName: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  port: Number(process.env.MSSQL_PORT),
  database: process.env.MSSQL_DATABASE,
  server: process.env.MSSQL_HOST ?? 'localhost',
}
