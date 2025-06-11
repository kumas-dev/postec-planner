import { Request, Response } from 'express'
import { RouterBuilder } from '../common/router-builder'
import {
  findJournalDetails,
  findMyTasks,
  findTaskDetail,
  findTasks,
  TaskDetail,
  assignTask,
  unassignTask,
  createTaskParse,
  createTask,
  createVisitTaskParse,
  forceAssignTask,
  completeTask,
} from '.'
import { BadRequestError, UnauthorizedError } from '../common/types'
import { JournalDetail } from '../journal'

async function findTasksAction(
  _: Request,
  res: Response<{ data: { tasks: TaskDetail[] } }>,
) {
  const {
    locals: { employeeId },
  } = res

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  const taskDetails = await findTasks()

  res.json({
    data: { tasks: taskDetails },
  })
}

async function findMyTasksAction(
  _: Request,
  res: Response<{ data: { tasks: TaskDetail[] } }>,
) {
  const {
    locals: { employeeId },
  } = res

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  const taskDetails = await findMyTasks({ employeeId })

  res.json({
    data: { tasks: taskDetails },
  })
}

async function findTaskAction(
  { params: { id } }: Request<{ id: string }>,
  res: Response<{
    data: {
      task: TaskDetail
      journals: JournalDetail[]
    }
  }>,
) {
  const {
    locals: { employeeId },
  } = res

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  const taskDetail = await findTaskDetail(id)
  const journalDetails = await findJournalDetails(id)

  res.json({
    data: {
      task: taskDetail,
      journals: journalDetails,
    },
  })
}

async function completeTaskAction(
  { params: { id } }: Request<{ id: string }>,
  res: Response<undefined>,
) {
  const {
    locals: { employeeId },
  } = res

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  await completeTask({ id, employeeId })

  res.sendStatus(200)
}

async function assignTaskAction(
  { params: { id } }: Request<{ id: string }>,
  res: Response<undefined>,
) {
  const {
    locals: { employeeId },
  } = res

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  await assignTask({ id, employeeId })

  res.sendStatus(200)
}

async function assignForceTaskAction(
  { params: { id } }: Request<{ id: string }>,
  res: Response<undefined>,
) {
  const {
    locals: { employeeId },
  } = res

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  await forceAssignTask({ id, employeeId })

  res.sendStatus(200)
}

async function unassignTaskAction(
  { params: { id } }: Request<{ id: string }>,
  res: Response<undefined>,
) {
  const {
    locals: { employeeId },
  } = res

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  await unassignTask({ id, employeeId })

  res.sendStatus(200)
}

async function createTaskAction(
  { body }: Request,
  res: Response<{ data: { task: TaskDetail } }>,
) {
  const {
    locals: { employeeId },
  } = res

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  const result = createTaskParse(body)

  if (!result.success) {
    throw new BadRequestError({
      message: 'invalid parameters',
      error: result.error.errors,
    })
  }

  const { type, submittedEmployeeId, partnerId, content, beginsAt, endsAt } =
    result.data

  const taskDetail = await createTask({
    type,
    partnerId,
    content,
    inProgressEmployeeIds: [],
    submittedEmployeeId,
    registeredEmployeeId: employeeId,
    ...(beginsAt && { beginsAt: new Date(beginsAt) }),
    ...(endsAt && { endsAt: new Date(endsAt) }),
  })

  res.json({
    data: { task: taskDetail },
  })
}

async function createVisitTaskAction(
  { body }: Request,
  res: Response<{ data: { task: TaskDetail } }>,
) {
  const {
    locals: { employeeId },
  } = res

  if (!employeeId) {
    throw new UnauthorizedError()
  }

  const result = createVisitTaskParse(body)

  if (!result.success) {
    throw new BadRequestError({
      message: 'invalid parameters',
      error: result.error.errors,
    })
  }

  const { partnerId } = result.data

  const taskDetail = await createTask({
    type: 'visit',
    partnerId,
    content: '방문 업무',
    registeredEmployeeId: employeeId,
    submittedEmployeeId: employeeId,
    inProgressEmployeeIds: [employeeId],
  })

  res.json({
    data: { task: taskDetail },
  })
}

export function router() {
  return new RouterBuilder()
    .get('/', findTasksAction)
    .post('/', createTaskAction)
    .post('/visit', createVisitTaskAction)
    .get('/my', findMyTasksAction)
    .get('/:id', findTaskAction)
    .patch('/:id/complete', completeTaskAction)
    .patch('/:id/assign', assignTaskAction)
    .patch('/:id/assign-force', assignForceTaskAction)
    .patch('/:id/unassign', unassignTaskAction)
    .build()
}
