import { migrateAddressMatch } from '@/common/legacy-types'
import { defaultKyselyContext } from '@/common/postec-data-client'
import { AddressMatchEntity } from '.'

async function findAddressMatches({ db } = defaultKyselyContext): Promise<
  AddressMatchEntity[]
> {
  const result = await db
    .selectFrom('Post_Sort')
    .selectAll()
    .orderBy('sort')
    .execute()

  return result.map(migrateAddressMatch)
}

export const addressMatchRepository = {
  findAddressMatches,
}
