import { z } from 'zod'
import { TASK_TYPES } from './enums'

export const CreateTaskSchema = z.object({
  type: z.enum(TASK_TYPES),
  submittedEmployeeId: z.string(),
  partnerId: z.string(),
  content: z.string(),
  beginsAt: z.string().date().nullish(),
  endsAt: z.string().date().nullish(),
})

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>
export type CreateTaskInput = z.input<typeof CreateTaskSchema>

export const CreateVisitTaskSchema = z.object({
  partnerId: z.string(),
})

export type CreateVisitTaskDto = z.infer<typeof CreateVisitTaskSchema>
export type CreateVisitTaskInput = z.input<typeof CreateVisitTaskSchema>
