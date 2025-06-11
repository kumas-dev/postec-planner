import { DateTime } from 'luxon'
import { utcToLocal } from '../common/utils/date'
import { NotificationEntity } from '.'
import { defaultKyselyContext } from '@/common/postec-task-client'
import { defaultKyselyContext as dataKyselyContext } from '@/common/postec-data-client'
import { UnauthorizedError } from '@/common/types'
import { migrateNotification } from '@/common/legacy-types'

async function findMyNotifications(
  employeeId: string,
  { db } = defaultKyselyContext,
  { db: dataDb } = dataKyselyContext,
): Promise<NotificationEntity[]> {
  const employee = await dataDb
    .selectFrom('Staff_Id')
    .selectAll()
    .where('ID', '=', employeeId)
    .executeTakeFirst()

  if (!employee) {
    throw new UnauthorizedError()
  }

  const rows = await db
    .selectFrom('Staff_Message')
    .selectAll()
    .where('STAFF', '=', employeeId)
    .where('PHONE', '=', employee.TEL)
    .where('DATE', '>', DateTime.now().minus({ months: 1 }).toJSDate())
    .orderBy('DATE', 'desc')
    .execute()

  return rows.map(migrateNotification)
}

async function createNotification(
  notification: NotificationEntity,
  { db } = defaultKyselyContext,
): Promise<NotificationEntity | null> {
  const { title, content, employeeId, sendsAt } = notification

  const row = await db
    .insertInto('Staff_Message')
    .values({
      TYPE: 0,
      DATE: utcToLocal(sendsAt),
      TITLE: title,
      BODY: content,
      SUBBODY: '',
      LINK: '',
      STAFF: employeeId,
      INPUTSTAFF: employeeId,
      SHOW: 0,
      FCMSEND: 2,
      RESERVE: null,
      CALL_SN: null,
      PHONE: null,
    })
    .returningAll()
    .executeTakeFirst()

  return row ? migrateNotification(row) : null
}

async function findNotificationsNotSent(
  { db } = defaultKyselyContext,
  { db: dataDb } = dataKyselyContext,
): Promise<NotificationEntity[]> {
  const employees = await dataDb.selectFrom('Staff_Id').selectAll().execute()

  const rows = await db
    .selectFrom('Staff_Message')
    .selectAll()
    .where('FCMSEND', '=', 1)
    .orderBy('DATE', 'desc')
    .execute()

  return rows.map((row) => {
    const employee = employees.find(({ TEL }) => TEL === row.PHONE)

    if (employee) {
      return migrateNotification({ ...row, STAFF: employee.ID })
    }

    return migrateNotification(row)
  })
}

async function updateNotificationSentStatus(
  id: string,
  { db } = defaultKyselyContext,
): Promise<void> {
  await db
    .updateTable('Staff_Message')
    .set({ FCMSEND: 2 })
    .where('SN', '=', Number(id))
    .execute()
}

export const notificationRepository = {
  findMyNotifications,
  createNotification,
  findNotificationsNotSent,
  updateNotificationSentStatus,
}
