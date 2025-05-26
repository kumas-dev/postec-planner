import * as tedious from 'tedious'
import * as tarn from 'tarn'
import { Kysely, MssqlDialect, Transaction } from 'kysely'
import { KyselyBuilder, KyselyBuilderOptions } from '.'
import { DEFAULT_KYSELY_OPTIONS } from './constant'

function createWithTransaction<T>(db: Kysely<T>) {
  return async function <U>(
    callback: (trx: Transaction<T>) => Promise<U>,
  ): Promise<U> {
    return db.transaction().execute(callback)
  }
}

export function createKysely<T>(
  inputOptions?: KyselyBuilderOptions,
): KyselyBuilder<T> {
  const { userName, password, port, database, server } = {
    ...DEFAULT_KYSELY_OPTIONS,
    ...inputOptions,
  }

  if (!server) {
    throw new Error('server is required')
  }

  const db = new Kysely<T>({
    dialect: new MssqlDialect({
      tarn: {
        ...tarn,
        options: {
          min: 0,
          max: 10,
        },
      },
      tedious: {
        ...tedious,
        connectionFactory: () =>
          new tedious.Connection({
            authentication: {
              options: {
                userName,
                password,
              },
              type: 'default',
            },
            options: {
              database,
              port,
              trustServerCertificate: true,
            },
            server,
          }),
      },
    }),
    plugins: [],
  })

  return {
    db,
    withTransaction: createWithTransaction(db),
  }
}
