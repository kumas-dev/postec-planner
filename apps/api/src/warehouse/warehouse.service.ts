import { WarehouseEntity, warehouseRepository } from '.'
import { employeeRepository } from '../employee'

export async function findWarehouses({
  findWarehouses = warehouseRepository.findWarehouses,
  findEmployees = employeeRepository.findEmployees,
} = {}): Promise<WarehouseEntity[]> {
  const employees = await findEmployees()
  const warehouses = await findWarehouses()
  const employeeWarehouseIds = employees.map((e) => e.warehouseId)

  return warehouses.filter(
    (warehouse) =>
      warehouse.id === '00' || employeeWarehouseIds.includes(warehouse.id),
  )
}
