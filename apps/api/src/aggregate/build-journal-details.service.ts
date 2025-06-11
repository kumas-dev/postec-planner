import { deduplicate } from '../common/utils'
import { employeeRepository } from '../employee'
import { Journal, JournalDetail } from '../journal'
import { partnerRepository } from '../partner'
import { productRepository } from '../product'
import { taskRepository } from '../task'

export async function buildJournalDetails(
  journals: Journal[],
  {
    findEmployees,
    findProductsByIds,
    findPartnersByIds,
    findTasksByIds,
  }: {
    findEmployees: typeof employeeRepository.findEmployees
    findProductsByIds: typeof productRepository.findProductsByIds
    findPartnersByIds: typeof partnerRepository.findPartnersByIds
    findTasksByIds: typeof taskRepository.findTasksByIds
  },
): Promise<JournalDetail[]> {
  const partnerIds = deduplicate(journals.map((journal) => journal.partnerId))
  const productIds = deduplicate(
    journals.map((journal) => journal.sales?.productId),
  )
  const taskIds = deduplicate(journals.map((journal) => journal.taskId))

  const [employees, products, partners, tasks] = await Promise.all([
    findEmployees(),
    findProductsByIds(productIds),
    findPartnersByIds(partnerIds),
    findTasksByIds(taskIds),
  ])

  return journals.map((journal) => {
    const { employeeId, sales, partnerId, taskId, ...rest } = journal

    const employee = employees.find((e) => e.id === employeeId)
    const product = products.find((e) => e.id === sales?.productId)
    const partner = partners.find((e) => e.id === partnerId)
    const task = tasks.find((e) => e.id === taskId)

    return {
      ...(employee && { employee }),
      ...(product && sales && { sales: { ...sales, product } }),
      ...(partner && { partner }),
      ...(task && { task }),
      ...rest,
    }
  })
}
