import { NotificationEntity } from '@/notification'
import { Generated, Selectable } from 'kysely'

export type StaffMessage = {
  SN: Generated<number>
  TYPE: number | null
  DATE: Date
  TITLE: string | null
  BODY: string | null
  SUBBODY: string | null
  LINK: string | null
  STAFF: string
  INPUTSTAFF: string | null
  SHOW: number
  FCMSEND: number | null
  RESERVE: Date | null
  CALL_SN: number | null
  PHONE: string | null
}

export function migrateNotification(
  data: Selectable<StaffMessage>,
): NotificationEntity {
  const { SN, TITLE, BODY, DATE, STAFF, LINK } = data

  return {
    id: `${SN}`,
    title: TITLE ?? '',
    content: BODY ?? '',
    employeeId: STAFF,
    sendsAt: DATE,
    ...(LINK?.startsWith('/CallView.aspx?sn=') && {
      url: `planner://main/tasks/${LINK.replace('/CallView.aspx?sn=', '')}`,
    }),
  }
}
