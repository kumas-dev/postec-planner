import { notificationRepository, NotificationEntity, sendPushMessage } from '.'
import { EmployeeEntity, employeeRepository } from '../employee'
import { deviceRepository } from '../device'
import {
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../common/types'
import { partnerRepository } from '@/partner'
import { uuidv7 } from '@/common/utils'
import { createNotificationAndPushSend } from '@/common/services/create-notification-and-push-send'

export async function findMyNotificationDetails(
  { employeeId }: { employeeId: string },
  {
    findMyNotifications = notificationRepository.findMyNotifications,
    findEmployees = employeeRepository.findEmployees,
  } = {},
): Promise<{
  employees: EmployeeEntity[]
  notifications: NotificationEntity[]
}> {
  const [employees, notifications] = await Promise.all([
    findEmployees(),
    findMyNotifications(employeeId),
  ])

  return { employees, notifications }
}

export async function sendPendingNotifications({
  findNotificationsNotSent = notificationRepository.findNotificationsNotSent,
  updateNotificationSentStatus = notificationRepository.updateNotificationSentStatus,
  findDeviceById = deviceRepository.findDeviceById,
  deleteDeviceById = deviceRepository.deleteDeviceById,
} = {}): Promise<void> {
  const notifications = await findNotificationsNotSent()

  for (const notification of notifications) {
    const { employeeId } = notification
    const device = await findDeviceById(notification.employeeId)

    if (device === null) {
      await updateNotificationSentStatus(notification.id)
      continue
    }

    try {
      await Promise.all([
        sendPushMessage({ notification, token: device.token }),
        updateNotificationSentStatus(notification.id),
      ])
    } catch (e) {
      const error = e as Error

      if ('code' in error) {
        const { code } = error as { code?: string }

        switch (code) {
          case 'messaging/registration-token-not-registered':
            await deleteDeviceById(employeeId)

            break
          default:
            throw new InternalServerError({ message: String(e) })
        }
      } else {
        throw new InternalServerError({ message: String(e) })
      }
    }
  }
}

export async function createNavigationNotification(
  { partnerId, employeeId }: { partnerId: string; employeeId: string },
  {
    findPartner = partnerRepository.findPartner,
    createNotification = notificationRepository.createNotification,
    findEmployee = employeeRepository.findEmployee,
    findAdminEmployees = employeeRepository.findAdminEmployees,
    findDeviceById = deviceRepository.findDeviceById,
    deleteDeviceById = deviceRepository.deleteDeviceById,
  } = {},
) {
  const partner = await findPartner(partnerId)
  const employee = await findEmployee(employeeId)
  const adminEmployees = await findAdminEmployees()

  if (employee === null) {
    throw new UnauthorizedError()
  }

  if (partner === null) {
    throw new NotFoundError()
  }

  await Promise.all(
    adminEmployees.map(async (adminEmployee) => {
      const notification: NotificationEntity = {
        id: uuidv7(),
        title: '차량 이동',
        content: `"${employee.name}"님이 "${partner.name}"으로 이동합니다.`,
        employeeId: adminEmployee.id,
        sendsAt: new Date(),
      }

      await createNotificationAndPushSend(notification, {
        findDeviceById,
        deleteDeviceById,
        createNotification,
      })
    }),
  )
}
