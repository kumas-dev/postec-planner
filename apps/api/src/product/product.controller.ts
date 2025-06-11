import { extractEmployeeId } from '@/common/utils/extract-employee-id'
import { ApiRequest, ApiResponse } from '../common/types'
import { FindProductsSchema } from '@repo/shared-type'
import { findProductsByName, ProductEntity } from '.'
import { parseOrThrow } from '@/common/utils'
import { createRouter } from '@/common/router'

async function findPartnersAction(
  req: ApiRequest,
  res: ApiResponse<{ products: ProductEntity[] }>,
) {
  const employeeId = extractEmployeeId(res)

  const { name } = parseOrThrow(FindProductsSchema, req.query)

  const products = await findProductsByName({ name })

  res.json({
    data: { products },
  })
}

export function router() {
  return createRouter().get('/', findPartnersAction).build()
}
