import { TaskEntity } from '@/task'
import { localToUTC } from '../utils/date'
import { StateType, TaskType } from '@repo/shared-type'

export type CallTable = {
  SN: number
  SHOW: number
  TYPE: number
  CODE: string
  NAME: string
  TELSET: number | null
  TEL: string
  TEL1: string
  ADDR: string
  DATE: Date
  MEMO: string
  STAFF: string
  BACKDAY: Date | null
  BACKDAY2: Date | null
  INPUTDATE: Date
  INPUTSTAFF: string
  EDITDATE: Date
  EDITSTAFF: string
  RUNDATE: Date | null
  RUNSTAFF: string | null
  RUNSHARE: 0
  COMPDATE: Date | null
  COMPSTAFF: string | null
  LAT: string
  LNG: string
  POST: number
  REPAIR_SN: null
  EDIT_STAFF: null
  ID: string | null
  S_NO: string
  ITEM_CODE: string | null
}

const LEGACY_TASK_TYPE_PARSE: { [key in number]: TaskType } = {
  0: 'general',
  1: 'stockIn',
  2: 'rental',
  3: 'order',
  4: 'contract',
  5: 'repair',
  6: 'reject',
  7: 'request',
  99: 'memo',
}

export const TASK_TYPE_TO_LEGACY_TASK_CODE_MAP: Record<TaskType, number> =
  Object.entries(LEGACY_TASK_TYPE_PARSE).reduce(
    (acc, [code, type]) => {
      acc[type] = Number(code)
      return acc
    },
    {} as Record<TaskType, number>,
  )

export function getTaskTypeFromLegacy(code: number): TaskType | undefined {
  return LEGACY_TASK_TYPE_PARSE[code]
}

export function getLegacyTaskCode(type?: TaskType): number {
  if (!type) return 0
  return TASK_TYPE_TO_LEGACY_TASK_CODE_MAP[type] ?? 0
}

export const LEGACY_STATE_TO_STATE_TYPE_MAP: { [key in number]: StateType } = {
  0: 'pending',
  1: 'completed',
  3: 'onHold',
  4: 'excluded',
}

export const STATE_TYPE_TO_LEGACY_CODE_MAP: Record<StateType, number> =
  Object.entries(LEGACY_STATE_TO_STATE_TYPE_MAP).reduce(
    (acc, [key, value]) => {
      acc[value] = Number(key)
      return acc
    },
    {} as Record<StateType, number>,
  )

export function getStateTypeFromLegacy(code: number): StateType | undefined {
  return LEGACY_STATE_TO_STATE_TYPE_MAP[code]
}

export function getLegacyStateCode(state?: StateType): number {
  if (!state) return 0
  return STATE_TYPE_TO_LEGACY_CODE_MAP[state] ?? 0
}

export function migrateTask(task: CallTable): TaskEntity {
  const {
    SN,
    SHOW,
    TYPE,
    CODE,
    NAME,
    ADDR,
    TEL,
    TEL1,
    POST,
    MEMO,
    STAFF,
    RUNSTAFF,
    COMPSTAFF,
    DATE,
    BACKDAY,
    BACKDAY2,
    S_NO,
    ITEM_CODE,
    LAT,
    LNG,
  } = task

  return {
    id: `${SN}`,
    type: getTaskTypeFromLegacy(TYPE) ?? 'visit',
    state: getStateTypeFromLegacy(SHOW) ?? 'excluded',
    partner: {
      id: CODE,
      name: NAME,
      primaryPhoneNumber: TEL ?? '',
      secondaryPhoneNumber: TEL1 ?? '',
      primaryAddress: ADDR ?? '',
      secondaryAddress: '',
      addressSortNumber: POST,
    },
    location: {
      latitude: Number(LAT),
      longitude: Number(LNG),
      name: NAME,
    },
    content: MEMO,
    ...(COMPSTAFF && { submittedEmployeeId: COMPSTAFF }),
    registeredEmployeeId: STAFF,
    inProgressEmployeeIds: RUNSTAFF?.split(',') ?? [],
    registeredAt: localToUTC(DATE),
    ...(BACKDAY && { beginsAt: localToUTC(BACKDAY) }),
    ...(BACKDAY2 && { endsAt: localToUTC(BACKDAY2) }),
    ...(ITEM_CODE && { productId: ITEM_CODE }),
    ...(S_NO && { serialNumber: S_NO }),
    addressMatchId: `${POST}`,
  }
}
