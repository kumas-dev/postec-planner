import { employeeRepository } from '../employee'
import { productRepository } from '../product'
import { Task, TaskDetail } from '../task'

export async function buildTaskDetails(
  tasks: Task[],
  {
    findEmployees,
    findProductsByIds,
  }: {
    findEmployees: typeof employeeRepository.findEmployees
    findProductsByIds: typeof productRepository.findProductsByIds
  },
): Promise<TaskDetail[]> {
  const productIds = [
    ...new Set(
      tasks.map((task) => task.productId).filter((v): v is string => !!v),
    ),
  ]

  const [employees, products] = await Promise.all([
    findEmployees(),
    findProductsByIds(productIds),
  ])

  return tasks.map((task) => {
    const {
      id,
      state,
      type,
      partner,
      content,
      submittedEmployeeId,
      registeredEmployeeId,
      inProgressEmployeeIds,
      registeredAt,
      beginsAt,
      endsAt,
      productId,
      serialNumber,
      location,
      addressMatchId,
    } = task

    const submittedEmployee = employees.find(
      (e) => e.id === submittedEmployeeId,
    )
    const registeredEmployee = employees.find(
      (e) => e.id === registeredEmployeeId,
    )
    const inProgressEmployees = inProgressEmployeeIds
      .map((inProgressEmployeeId) =>
        employees.find((e) => e.id === inProgressEmployeeId),
      )
      .filter((v) => !!v)

    const product = products.find((e) => e.id === productId)

    return {
      id,
      state,
      type,
      partner,
      content,
      ...(submittedEmployee && { submittedEmployee }),
      ...(registeredEmployee && { registeredEmployee }),
      inProgressEmployees,
      registeredAt,
      beginsAt,
      endsAt,
      ...(product && { product: { ...product, serialNumber } }),
      location,
      addressMatchId,
    }
  })
}
