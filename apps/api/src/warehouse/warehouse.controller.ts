import { Request, Response } from 'express'
import { UnauthorizedError } from '../common/types'
import { findWarehouses, WarehouseEntity } from '.'
import { createRouter } from '@/common/router'

async function findWarehousesAction(
  _: Request,
  res: Response<{ data: { warehouses: WarehouseEntity[] } }>,
) {
  const {
    locals: { employeeId },
  } = res

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  const warehouses = await findWarehouses()

  res.json({
    data: { warehouses },
  })
}

export function router() {
  return createRouter().get('/', findWarehousesAction).build()
}
