import { AddressMatchEntity, addressMatchRepository } from '.'

export async function findAddressMatches({
  findAddressMatches = addressMatchRepository.findAddressMatches,
} = {}): Promise<AddressMatchEntity[]> {
  const addressMatches = await findAddressMatches()

  return Array.from(
    addressMatches
      .filter(
        (match) =>
          match.includeAddresses.length > 0 ||
          match.excludeAddresses.length > 0,
      )
      .reduce<Map<string, AddressMatchEntity>>((acc, match) => {
        if (!acc.has(match.id)) {
          acc.set(match.id, match)
        }
        return acc
      }, new Map())
      .values(),
  ).sort(
    (a: AddressMatchEntity, b: AddressMatchEntity) =>
      Number(a.id) - Number(b.id),
  )
}
