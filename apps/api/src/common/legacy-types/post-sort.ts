import { AddressMatchEntity } from '@/address-match'

export type PostSort = {
  addr: string
  addr2: string
  notaddr: string
  sort: number
  group: string
}

export function migrateAddressMatch(data: PostSort): AddressMatchEntity {
  const { addr, addr2, notaddr, sort, group } = data

  const includeAddresses = [addr, addr2].filter(Boolean)
  const excludeAddresses = [notaddr].filter(Boolean)

  return {
    id: `${sort}`,
    label: addr2,
    includeAddresses,
    excludeAddresses,
    group,
  }
}
