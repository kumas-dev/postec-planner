import { AddressMatchEntity } from './address-match.model'
import { findAddressMatches } from './address-match.service'
import { createRouter } from '@/common/router'
import { ApiRequest, ApiResponse } from '@/common/types'

async function findAddressMatchesAction(
  _req: ApiRequest,
  res: ApiResponse<{ addressMatches: AddressMatchEntity[] }>,
) {
  const addressMatches = await findAddressMatches()

  res.json({
    data: { addressMatches },
  })
}

export function router() {
  return createRouter().get('/', findAddressMatchesAction).build()
}
