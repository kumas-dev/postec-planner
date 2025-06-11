import { defaultKyselyContext } from '@/common/gis-pandata-client.ts'
import { sql } from 'kysely'
import { WarehouseEntity } from '.'
import { migrateWarehouse } from '@/common/legacy-types'

async function findWarehouses({ db } = defaultKyselyContext): Promise<
  WarehouseEntity[]
> {
  const rows = await db
    .selectFrom('SETUP')
    .select([
      sql<number>`ROW_NUMBER() OVER (ORDER BY (SELECT NULL))`.as('ROW_NUMBER'),
      'SET_DESC',
      'SET_CODE',
    ])
    .where((eb) =>
      eb.or([
        eb.and([eb('SET_CODE', '>=', 40), eb('SET_CODE', '<', 50)]),
        eb.and([eb('SET_CODE', '>=', 2040), eb('SET_CODE', '<', 2090)]),
      ]),
    )
    .execute()

  return rows.map(migrateWarehouse)
}

export const warehouseRepository = {
  findWarehouses,
}
