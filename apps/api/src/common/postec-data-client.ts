import { createKysely } from './kysely'
import { Goods, PostSort, StaffId } from './legacy-types'

export type PostecData = {
  Staff_Id: StaffId
  Post_Sort: PostSort
  Goods: Goods
}

export const kysely = createKysely<PostecData>({
  database: 'Postec_Data',
})

export const defaultKyselyContext = { db: kysely.db }

export const { db, withTransaction } = kysely
