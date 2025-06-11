import { ApiRequest, ApiResponse } from '../common/types'
import {
  findPartnersWithTaskByName,
  findPartnerDetails,
  findJournalDetails,
  findStatusGroupedTasks,
  PartnerEntity,
} from '.'
import { extractEmployeeId } from '@/common/utils/extract-employee-id'
import { FindPartnersSchema, IdSchema } from '@repo/shared-type'
import { parseOrThrow } from '@/common/utils'
import { createRouter } from '@/common/router'

async function findPartnersAction(
  req: ApiRequest,
  res: ApiResponse<{ data: { partners: PartnerEntity[] } }>,
) {
  const employeeId = extractEmployeeId(res)

  const { name } = parseOrThrow(FindPartnersSchema, req.query)

  const partnersWithTask = await findPartnersWithTaskByName({ name })

  res.json({
    data: { partners: partnersWithTask },
  })
}

async function findPartnerAction(
  req: ApiRequest,
  res: ApiResponse<{
    data: {
      partner: PartnerEntity
      statusGroupedTasks: StatusGroupedTasks
      journals: JournalDetail[]
    }
  }>,
) {
  const employeeId = extractEmployeeId(res)

  const { id } = parseOrThrow(IdSchema, req.params)

  const partnerDetails = await findPartnerDetails(id)
  const journalDetails = await findJournalDetails(id)
  const statusGroupedTasks = await findStatusGroupedTasks(id)

  res.json({
    data: {
      partner: partnerDetails,
      journals: journalDetails,
      statusGroupedTasks,
    },
  })
}

export function router() {
  return createRouter()
    .get('/', findPartnersAction)
    .get('/:id', findPartnerAction)
    .build()
}
