import { LocationModel } from '@/common/models'
import { PartnerEntity } from '../partner'
import { StateType, TaskType } from '@repo/shared-type'

export type TaskEntity = {
  id: string
  type: TaskType
  state: StateType
  partner: PartnerEntity
  content: string
  submittedEmployeeId?: string
  registeredEmployeeId: string
  inProgressEmployeeIds: string[]
  registeredAt: Date
  beginsAt?: Date
  endsAt?: Date
  location: LocationModel
  productId?: string
  serialNumber?: string
  referenceId?: string
  addressMatchId: string
}
