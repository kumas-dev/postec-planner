import { deviceRepository } from '../../device'
import {
  NotificationEntity,
  notificationRepository,
  sendPushMessage,
} from '../../notification'
import { InternalServerError } from '../types'

export async function createNotificationAndPushSend(
  notification: NotificationEntity,
  {
    createNotification,
    findDeviceById,
    deleteDeviceById,
  }: {
    createNotification: typeof notificationRepository.createNotification
    findDeviceById: typeof deviceRepository.findDeviceById
    deleteDeviceById: typeof deviceRepository.deleteDeviceById
  },
): Promise<void> {
  const { employeeId } = notification

  const [device] = await Promise.all([
    findDeviceById(employeeId),
    createNotification(notification),
  ])

  if (device === null) {
    return
  }

  try {
    await sendPushMessage({ notification, token: device.token })
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
