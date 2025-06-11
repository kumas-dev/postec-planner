import { createKysely } from './kysely'
import {
  CallTable,
  GoodsHistory,
  GoodsStock,
  StaffMessage,
} from './legacy-types'

export type PostecData = {
  Staff_Message: StaffMessage
  Goods_Stock: GoodsStock
  Goods_History: GoodsHistory
  Call_Table: CallTable
}

export const kysely = createKysely<PostecData>({
  database: 'Postec_Task',
})

export const defaultKyselyContext = { db: kysely.db }

export const { db, withTransaction } = kysely
