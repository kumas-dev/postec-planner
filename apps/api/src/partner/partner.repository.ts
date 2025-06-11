import { PartnerEntity } from '.'
import { defaultKyselyContext } from '@/common/gis-pandata-client.ts'
import { migrateDOCF8 } from '@/common/legacy-types'

async function findPartnersByIds(
  ids: string[],
  { db } = defaultKyselyContext,
): Promise<PartnerEntity[]> {
  if (ids.length === 0) {
    return []
  }

  const rows = await db
    .selectFrom('DOCF8')
    .where('buy_code', 'in', ids)
    .selectAll()
    .execute()

  return rows.map(migrateDOCF8)
}

async function findPartner(
  id: string,
  { db } = defaultKyselyContext,
): Promise<PartnerEntity | null> {
  const row = await db
    .selectFrom('DOCF8')
    .where('buy_code', '=', id)
    .selectAll()
    .executeTakeFirst()

  return row ? migrateDOCF8(row) : null
}

async function findPartnersByName(
  name: string,
  { db } = defaultKyselyContext,
): Promise<PartnerEntity[]> {
  const words = name.split(' ')

  let query = db.selectFrom('DOCF8')

  for (const word of words) {
    query = query.where('buy_name', 'like', `%${word}%`)
  }

  const rows = await query.selectAll().execute()

  return rows.map(migrateDOCF8)
}

export const partnerRepository = {
  findPartnersByIds,
  findPartner,
  findPartnersByName,
}
