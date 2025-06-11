import { AddressMatchEntity } from '.'

export function findMatchingAddressMatchId(
  address: string,
  addressMatches: AddressMatchEntity[],
): string {
  for (const match of addressMatches) {
    const isIncluded = match.includeAddresses.some((includeAddress) =>
      address.includes(includeAddress),
    )
    const isExcluded = match.excludeAddresses.some((excludeAddress) =>
      address.includes(excludeAddress),
    )

    if (isIncluded && !isExcluded) {
      return match.id
    }
  }

  return addressMatches[addressMatches.length - 1].id
}
