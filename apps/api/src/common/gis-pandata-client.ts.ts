import { createKysely } from './kysely'
import { DOCF8, Setup } from './legacy-types'

export type PostecData = {
  DOCF8: DOCF8
  SETUP: Setup
}

export const kysely = createKysely<PostecData>({
  database: 'GIS_PANDATA',
})

export const defaultKyselyContext = { db: kysely.db }

export const { db, withTransaction } = kysely
