import { Task, TaskDetail, taskRepository, TaskType } from '.'
import { buildJournalDetails } from '../aggregate/build-journal-details.service'
import { buildTaskDetails } from '../aggregate/build-task-details.service'
import { createNotificationAndPushSend } from '../common/services/create-notification-and-push-send'
import { BadRequestError, UnauthorizedError } from '../common/types'
import { uuidv4 } from '../common/utils'
import { deviceRepository } from '../device'
import { employeeRepository } from '../employee'
import { JournalDetail, journalRepository } from '../journal'
import { kakaoRepository } from '../kakao'
import { notificationRepository } from '../notification'
import { partnerRepository } from '../partner'
import { productRepository } from '../product'
import { addressMatchRepository } from '../address-match/address-match.repository'
import { findMatchingAddressMatchId } from '../address-match/address-match.util'

export async function findTasks({
  findTasks = taskRepository.findTasks,
  findEmployees = employeeRepository.findEmployees,
  findProductsByIds = productRepository.findProductsByIds,
} = {}): Promise<TaskDetail[]> {
  const tasks = await findTasks()

  return buildTaskDetails(tasks, { findEmployees, findProductsByIds })
}

export async function findMyTasks(
  { employeeId }: { employeeId: string },
  {
    findMyTasks = taskRepository.findMyTasks,
    findEmployees = employeeRepository.findEmployees,
    findProductsByIds = productRepository.findProductsByIds,
  } = {},
): Promise<TaskDetail[]> {
  const tasks = await findMyTasks(employeeId)

  return buildTaskDetails(tasks, { findEmployees, findProductsByIds })
}

export async function findTaskDetail(
  id: string,
  {
    findTask = taskRepository.findTask,
    findEmployees = employeeRepository.findEmployees,
    findProductsByIds = productRepository.findProductsByIds,
  } = {},
): Promise<TaskDetail> {
  const task = await findTask(id)

  const [taskDetail] = await buildTaskDetails([task], {
    findEmployees,
    findProductsByIds,
  })

  return taskDetail
}

export async function findJournalDetails(
  id: string,
  {
    findEmployees = employeeRepository.findEmployees,
    findProductsByIds = productRepository.findProductsByIds,
    findJournalsByTaskId = journalRepository.findJournalsByTaskId,
    findPartnersByIds = partnerRepository.findPartnersByIds,
    findTasksByIds = taskRepository.findTasksByIds,
  } = {},
): Promise<JournalDetail[]> {
  const journals = await findJournalsByTaskId({ taskId: id })

  const journalDetails = await buildJournalDetails(journals, {
    findEmployees,
    findPartnersByIds,
    findProductsByIds,
    findTasksByIds,
  })

  return journalDetails
}

export async function completeTask(
  { id, employeeId }: { id: string; employeeId: string },
  {
    findTask = taskRepository.findTask,
    updateTask = taskRepository.updateTask,
    createNotification = notificationRepository.createNotification,
    sendPushMessage = deviceRepository.sendPushMessage,
    findDeviceById = deviceRepository.findDeviceById,
    deleteDeviceById = deviceRepository.deleteDeviceById,
    findEmployeeOrNull = employeeRepository.findEmployeeOrNull,
  } = {},
): Promise<null> {
  const task = await findTask(id)
  const employee = await findEmployeeOrNull(employeeId)

  if (employee === null) {
    throw new UnauthorizedError()
  }

  if (!task.inProgressEmployeeIds.includes(employeeId)) {
    throw new BadRequestError()
  }

  await updateTask(id, { state: 'completed', completeEmployeeId: employeeId })

  if (task.registeredEmployeeId !== employeeId) {
    createNotificationAndPushSend(
      {
        id: uuidv4(),
        title: task.partner.name,
        content: `${employee.name}님이 업무를 완료 하였습니다.`,
        employeeId: task.registeredEmployeeId,
        sendsAt: new Date(),
        url: `planner://main/tasks/${task.id}`,
      },
      {
        createNotification,
        sendPushMessage,
        findDeviceById,
        deleteDeviceById,
      },
    )
  }

  return null
}

export async function assignTask(
  { id, employeeId }: { id: string; employeeId: string },
  {
    findTask = taskRepository.findTask,
    updateTask = taskRepository.updateTask,
  } = {},
): Promise<null> {
  const task = await findTask(id)

  if (task.inProgressEmployeeIds.includes(employeeId)) {
    throw new BadRequestError()
  }

  await updateTask(id, {
    inProgressEmployeeIds: [...task.inProgressEmployeeIds, employeeId],
  })

  return null
}

export async function forceAssignTask(
  { id, employeeId }: { id: string; employeeId: string },
  {
    findTask = taskRepository.findTask,
    updateTask = taskRepository.updateTask,
  } = {},
): Promise<null> {
  const task = await findTask(id)

  if (task.inProgressEmployeeIds.includes(employeeId)) {
    throw new BadRequestError()
  }

  await updateTask(id, {
    inProgressEmployeeIds: [employeeId],
  })

  return null
}

export async function unassignTask(
  { id, employeeId }: { id: string; employeeId: string },
  {
    findTask = taskRepository.findTask,
    updateTask = taskRepository.updateTask,
    deleteTask = taskRepository.deleteTask,
  } = {},
) {
  const task = await findTask(id)

  if (!task.inProgressEmployeeIds.includes(employeeId)) {
    throw new BadRequestError()
  }

  if (task.type === 'visit') {
    await deleteTask(id)

    return
  }

  await updateTask(id, {
    inProgressEmployeeIds: task.inProgressEmployeeIds.filter(
      (inProgressEmployeeId) => inProgressEmployeeId !== employeeId,
    ),
  })
}

export async function createTask(
  {
    type,
    partnerId,
    content,
    inProgressEmployeeIds,
    submittedEmployeeId,
    registeredEmployeeId,
    beginsAt,
    endsAt,
  }: {
    type: TaskType
    inProgressEmployeeIds: string[]
    submittedEmployeeId: string
    registeredEmployeeId: string
    partnerId: string
    content: string
    beginsAt?: Date
    endsAt?: Date
  },
  {
    createTask = taskRepository.createTask,
    findEmployees = employeeRepository.findEmployees,
    findProductsByIds = productRepository.findProductsByIds,
    findPartner = partnerRepository.findPartner,
    findLocal = kakaoRepository.findLocal,
    findAddressMatches = addressMatchRepository.findAddressMatches,
  } = {},
): Promise<TaskDetail> {
  const partner = await findPartner(partnerId)
  const [address] = await findLocal(partner.primaryAddress)
  const addressMatches = await findAddressMatches()
  const addressMatchId = findMatchingAddressMatchId(
    partner.primaryAddress,
    addressMatches,
  )

  const task: Task = {
    id: uuidv4(),
    state: 'pending',
    type,
    partner,
    content,
    beginsAt,
    endsAt,
    inProgressEmployeeIds,
    submittedEmployeeId,
    registeredEmployeeId,
    location: {
      latitude: Number(address.y),
      longitude: Number(address.x),
      name: partner.name,
    },
    registeredAt: new Date(),
    addressMatchId,
  }

  const newTask = await createTask(task)
  const [taskDetail] = await buildTaskDetails([newTask], {
    findEmployees,
    findProductsByIds,
  })

  return taskDetail
}
