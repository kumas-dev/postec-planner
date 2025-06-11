import { ApiRequest, ApiResponse } from '../common/types'
import {
  findMyNotificationDetails,
  createNavigationNotification,
  NotificationEntity,
} from '.'
import { createRouter } from '@/common/router'
import { extractEmployeeId } from '@/common/utils/extract-employee-id'
import { parseOrThrow } from '@/common/utils'
import { createNavigationNotificationSchema } from '@repo/shared-type'
import { EmployeeEntity } from '@/employee'

async function findMyNotificationsAction(
  _: ApiRequest,
  res: ApiResponse<{
    notifications: NotificationEntity[]
    employees: EmployeeEntity[]
  }>,
) {
  const employeeId = extractEmployeeId(res)

  const { notifications, employees } = await findMyNotificationDetails({
    employeeId,
  })

  res.json({
    data: { notifications, employees },
  })
}

async function createNavigationNotificationAction(
  req: ApiRequest,
  res: ApiResponse,
) {
  const employeeId = extractEmployeeId(res)

  const { partnerId } = parseOrThrow(
    createNavigationNotificationSchema,
    req.body,
  )

  await createNavigationNotification({ partnerId, employeeId })

  res.status(204).send()
}

export function router() {
  return createRouter()
    .get('/me', findMyNotificationsAction)
    .post('/navigation', createNavigationNotificationAction)
    .build()
}
