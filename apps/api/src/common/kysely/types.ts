import { Kysely, Transaction } from 'kysely'

export type KyselyBuilderOptions = {
  userName?: string
  password?: string
  port?: number
  database?: string
  server?: string
}

export type TrxOrDb<T> = Kysely<T> | Transaction<T>

export type KyselyBuilder<T> = {
  db: TrxOrDb<T>
  withTransaction: <U>(
    callback: (trx: Transaction<T>) => Promise<U>,
  ) => Promise<U>
}
