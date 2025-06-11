import { TaskEntity } from '.'
import { BadRequestError } from '../common/types'
import { utcToLocal } from '../common/utils/date'
import { defaultKyselyContext } from '@/common/postec-task-client'
import {
  getLegacyTaskCode,
  getTaskTypeFromLegacy,
  migrateTask,
} from '@/common/legacy-types'

async function findTasks(
  { employeeId, partnerId }: { employeeId?: string; partnerId?: string },
  { db } = defaultKyselyContext,
): Promise<TaskEntity[]> {
  let query = db.selectFrom('Call_Table').where('SHOW', '=', 0)

  if (employeeId) {
    query = query.where('RUNSTAFF', 'like', `%${employeeId}%`)
  }

  if (partnerId) {
    query = query.where('CODE', '=', partnerId)
  }

  const rows = await query.orderBy('BACKDAY', 'desc').selectAll().execute()

  return rows.map(migrateTask)
}

async function findTasksByIds(
  ids: string[],
  { db } = defaultKyselyContext,
): Promise<TaskEntity[]> {
  if (ids.length === 0) {
    return []
  }

  const rows = await db
    .selectFrom('Call_Table')
    .where('SHOW', '>=', 0)
    .where(
      'SN',
      'in',
      ids.map((id) => Number(id)),
    )
    .orderBy('DATE', 'desc')
    .selectAll()
    .execute()

  return rows.map(migrateTask)
}

async function findTask(
  id: string,
  { db } = defaultKyselyContext,
): Promise<TaskEntity | null> {
  const task = await db
    .selectFrom('Call_Table')
    .where('SN', '=', Number(id))
    .selectAll()
    .executeTakeFirst()

  return task ? migrateTask(task) : null
}

async function updateTask(
  id: string,
  {
    state,
    inProgressEmployeeIds,
    completeEmployeeId,
  }: {
    state?: StateType
    inProgressEmployeeIds?: string[]
    completeEmployeeId?: string
  },
): Promise<null> {
  const updateFields = [
    !isUndefined(state) && 'SHOW = @state',
    !isUndefined(inProgressEmployeeIds) && 'RUNSTAFF = @inProgressEmployeeIds',
    !isUndefined(completeEmployeeId) &&
      'COMPSTAFF = @completeEmployeeId, COMPDATE=GETDATE()',
  ].filter((v): v is string => !!v)

  if (updateFields.length === 0) {
    throw new BadRequestError()
  }

  const query = `
  UPDATE
    Postec_Task.dbo.Call_Table
  SET
    ${updateFields.join(', ')}
  WHERE
    SN = @id;
  `

  await mssql()
    .input('id', id)
    .input('state', findLegacyState(state))
    .input('inProgressEmployeeIds', inProgressEmployeeIds?.join())
    .input('completeEmployeeId', completeEmployeeId)
    .query<LegacyTask>(query)

  return null
}

async function deleteTask(
  id: string,
  { db } = defaultKyselyContext,
): Promise<TaskEntity | null> {
  const row = await db
    .updateTable('Call_Table')
    .where('SN', '=', Number(id))
    .set({ SHOW: -1 })
    .returningAll()
    .executeTakeFirst()

  return row ? migrateTask(row) : null
}

async function createTask(task: TaskEntity, { db } = defaultKyselyContext) {
  const row = await db
    .insertInto('Call_Table')
    .values({
      SHOW: 0,
      TYPE: getLegacyTaskCode(task.type),
      CODE: task.partner.id,
      NAME: task.partner.name,
      TEL: task.partner.primaryPhoneNumber,
      TEL1: task.partner.secondaryPhoneNumber,
      ADDR: task.partner.primaryAddress,
      DATE: utcToLocal(task.registeredAt),
      MEMO: task.content,
      STAFF: task.registeredEmployeeId,
      BACKDAY: task.beginsAt ? utcToLocal(task.beginsAt) : null,
      BACKDAY2: task.endsAt ? utcToLocal(task.endsAt) : null,
      INPUTDATE: utcToLocal(task.registeredAt),
      INPUTSTAFF: task.registeredEmployeeId,
      EDITDATE: utcToLocal(task.registeredAt),
      EDITSTAFF: task.registeredEmployeeId,
      RUNDATE: task.beginsAt ? utcToLocal(task.beginsAt) : null,
      RUNSTAFF: task.inProgressEmployeeIds?.join(',') ?? '',
      RUNSHARE: 0,
      LAT: task.location.latitude.toString(),
      LNG: task.location.longitude.toString(),
      POST: 0,
      REPAIR_SN: null,
      S_NO: '',
      ITEM_CODE: task.productId ?? '',
      ID: task.referenceId ?? '',
    })
    .returningAll()
    .executeTakeFirst()

  const query = `
    INSERT INTO
      Postec_Task.dbo.Call_Table
      (
        SHOW, [TYPE], CODE, NAME, TEL, TEL1,
        ADDR, [DATE], MEMO, STAFF, BACKDAY, BACKDAY2,
        INPUTDATE, INPUTSTAFF, RUNSTAFF, RUNSHARE,
        LAT, LNG, POST, REPAIR_SN, S_NO, ITEM_CODE
      )
    OUTPUT
      inserted.SN,
      inserted.SHOW,
      inserted.[TYPE],
      inserted.CODE,
      inserted.NAME,
      inserted.TELSET,
      inserted.TEL,
      inserted.TEL1,
      inserted.ADDR,
      inserted.[DATE],
      inserted.MEMO,
      inserted.STAFF,
      inserted.BACKDAY,
      inserted.BACKDAY2,
      inserted.INPUTDATE,
      inserted.INPUTSTAFF,
      inserted.EDITDATE,
      inserted.EDITSTAFF,
      inserted.RUNDATE,
      inserted.RUNSTAFF,
      inserted.RUNSHARE,
      inserted.COMPDATE,
      inserted.COMPSTAFF,
      inserted.LAT,
      inserted.LNG,
      inserted.POST,
      inserted.REPAIR_SN,
      inserted.EDIT_STAFF,
      inserted.ID,
      inserted.S_NO,
      inserted.ITEM_CODE
    VALUES
      (
        0, @type, @partnerId, @partnerName, @partnerPrimaryPhoneNumber, @partnerSecondaryPhoneNumber,
        @partnerPrimaryAddress, @registeredAt, @content, @registeredEmployeeId, @beginsAt, @endsAt,
        @registeredAt, @registeredEmployeeId, @inProgressEmployeeIds, 0,
        @locationLatitude, @locationLongitude, @addressMatchId, @referenceId, @serialNumber, @productId
      );
  `

  const result = await mssql()
    .input('type', findLegacyTaskType(task.type))
    .input('partnerId', task.partner.id)
    .input('partnerName', task.partner.name)
    .input('partnerPrimaryPhoneNumber', task.partner.primaryPhoneNumber)
    .input('partnerSecondaryPhoneNumber', task.partner.secondaryPhoneNumber)
    .input('partnerPrimaryAddress', task.partner.primaryAddress)
    .input('registeredAt', utcToLocal(task.registeredAt))
    .input('content', task.content)
    .input('submittedEmployeeId', task.submittedEmployeeId)
    .input('beginsAt', task.beginsAt ? utcToLocal(task.beginsAt) : null)
    .input('endsAt', task.endsAt ? utcToLocal(task.endsAt) : null)
    .input('registeredEmployeeId', task.registeredEmployeeId)
    .input('inProgressEmployeeIds', task.inProgressEmployeeIds?.join())
    .input('locationLatitude', task.location.latitude)
    .input('locationLongitude', task.location.longitude)
    .input('referenceId', task.referenceId)
    .input('productId', task.productId)
    .input('serialNumber', task.serialNumber)
    .input('addressMatchId', task.addressMatchId)
    .query<LegacyTask>(query)

  const [newTask] = result.recordset.map<Task>(migrateTask)

  return newTask
}

export const taskRepository = {
  findTasks,
  findTasksByIds,
  findTask,
  updateTask,
  createTask,
  deleteTask,
}
