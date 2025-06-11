import { migrateProduct } from '@/common/legacy-types'
import { defaultKyselyContext } from '@/common/postec-data-client'
import { ProductEntity } from '.'
import { sql } from 'kysely'

async function findProductsByIds(
  ids: string[],
  { db } = defaultKyselyContext,
): Promise<ProductEntity[]> {
  if (ids.length === 0) {
    return []
  }

  const rows = await db
    .selectFrom('Goods')
    .where('Code', 'in', ids)
    .selectAll()
    .execute()

  return rows.map(migrateProduct)
}

async function findProduct(
  id: string,
  { db } = defaultKyselyContext,
): Promise<ProductEntity | null> {
  const row = await db
    .selectFrom('Goods')
    .where('Code', '=', id)
    .selectAll()
    .executeTakeFirst()

  return row ? migrateProduct(row) : null
}

async function findProductsByName(
  name: string,
  { db } = defaultKyselyContext,
): Promise<ProductEntity[]> {
  const words = name.split(' ')

  let query = await db.selectFrom('Goods')

  for (const word of words) {
    query = query.where(
      sql<boolean>`(CAST(Goods AS VARCHAR) + CAST(Stand AS VARCHAR)) LIKE ${`%${word}%`}`,
    )
  }

  const rows = await query.selectAll().execute()

  return rows.map(migrateProduct)
}

export const productRepository = {
  findProductsByIds,
  findProductsByName,
  findProduct,
}
