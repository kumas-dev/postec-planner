import { partnerRepository, PartnerWithTask, PartnerDetail } from '.'
import { buildJournalDetails } from '../aggregate/build-journal-details.service'
import { buildTaskDetails } from '../aggregate/build-task-details.service'
import { employeeRepository } from '../employee'
import { JournalDetail, journalRepository } from '../journal'
import { kakaoRepository } from '../kakao'
import { productRepository } from '../product'
import { StatusGroupedTasks, taskRepository } from '../task'

export async function findPartnersWithTaskByName(
  { name }: { name: string },
  {
    findPartnersByName = partnerRepository.findPartnersByName,
    findTasksByPartnersIds = taskRepository.findTasksByPartnersIds,
    findEmployees = employeeRepository.findEmployees,
    findProductsByIds = productRepository.findProductsByIds,
  } = {},
): Promise<PartnerWithTask[]> {
  const partners = await findPartnersByName(name)

  const tasks = await findTasksByPartnersIds(
    partners.map((partner) => partner.id),
  )

  const taskDetails = await buildTaskDetails(tasks, {
    findEmployees,
    findProductsByIds,
  })

  return partners.map((partner) => {
    const partnerTasks = taskDetails.filter(
      (task) => task.partner.id === partner.id,
    )

    return { ...partner, tasks: partnerTasks }
  })
}

export async function findPartnerDetails(
  id: string,
  {
    findPartner = partnerRepository.findPartner,
    findLocal = kakaoRepository.findLocal,
  } = {},
): Promise<PartnerDetail> {
  const partner = await findPartner(id)

  const [address] = await findLocal(partner.primaryAddress)

  return {
    ...partner,
    ...(address && {
      location: {
        latitude: Number(address.y),
        longitude: Number(address.x),
        name: partner.name,
      },
    }),
  }
}

export async function findStatusGroupedTasks(
  id: string,
  {
    findTasksByPartner = taskRepository.findTasksByPartner,
    findEmployees = employeeRepository.findEmployees,
    findProductsByIds = productRepository.findProductsByIds,
  } = {},
): Promise<StatusGroupedTasks> {
  const tasks = await findTasksByPartner(id)

  const taskDetails = await buildTaskDetails(tasks, {
    findEmployees,
    findProductsByIds,
  })

  return {
    pending: taskDetails.filter((task) => task.state === 'pending'),
    completed: taskDetails.filter((task) => task.state === 'completed'),
    onHold: taskDetails.filter((task) => task.state === 'onHold'),
  }
}

export async function findJournalDetails(
  id: string,
  {
    findEmployees = employeeRepository.findEmployees,
    findProductsByIds = productRepository.findProductsByIds,
    findJournalsByPartnerId = journalRepository.findJournalsByPartnerId,
    findPartnersByIds = partnerRepository.findPartnersByIds,
    findTasksByIds = taskRepository.findTasksByIds,
  } = {},
): Promise<JournalDetail[]> {
  const journals = await findJournalsByPartnerId({ partnerId: id })

  const journalDetails = await buildJournalDetails(journals, {
    findEmployees,
    findPartnersByIds,
    findProductsByIds,
    findTasksByIds,
  })

  return journalDetails
}

export async function createPartnerWgs({
  findPartnerWithoutWGS = partnerRepository.findPartnerWithoutWGS,
  createOrUpdatePartnerWGS = partnerRepository.createOrUpdatePartnerWGS,
  findLocal = kakaoRepository.findLocal,
} = {}) {
  const partners = await findPartnerWithoutWGS()

  for (const partner of partners) {
    const {
      buy_code: buyCode,
      buy_addr: buyAddr1,
      buy_addr1: buyAddr2,
    } = partner

    const [address] = await findLocal(buyAddr1)

    await createOrUpdatePartnerWGS({
      code: buyCode,
      addr1: buyAddr1,
      addr2: buyAddr2,
      lat: address?.y ?? '',
      lng: address?.x ?? '',
    })
  }
}
