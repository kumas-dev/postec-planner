import { createMongodb } from './mongodb'

const mongodb = createMongodb()

export async function initialize() {
  await mongodb.connect()
}

export async function disconnect() {
  await mongodb.close()
}

export const { db, collection } = mongodb
