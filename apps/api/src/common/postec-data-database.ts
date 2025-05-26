import { createKysely } from './kysely'
import { StaffId } from './legacy-types'

export type PostecData = {
  Staff_Id: StaffId
}

export const kysely = createKysely<PostecData>({
  database: 'Postec_Data',
})

export const defaultKyselyContext = { db: kysely.db }

export const { db, withTransaction } = kysely
