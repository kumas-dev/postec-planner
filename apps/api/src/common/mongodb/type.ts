import {
  Db,
  AggregateOptions,
  BulkWriteOptions,
  CreateIndexesOptions,
  DeleteOptions,
  DeleteResult,
  Filter,
  FindOptions,
  IndexSpecification,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
} from 'mongodb'

export type MongodbBuilderOptions = {
  databaseUrl?: string
}

export type Document<T extends { id: string }> = Omit<T, 'id'> & {
  _id: string
  createdAt: Date
  updatedAt: Date
}

export type MongodbCollection<T extends { id: string }> = {
  insertOne: (
    document: T,
    options?: InsertOneOptions,
  ) => Promise<InsertOneResult<Document<T>>>
  insertMany: (
    documents: T[],
    options?: BulkWriteOptions,
  ) => Promise<InsertManyResult<Document<T>>>
  updateOne: (
    filter: Filter<Document<T>>,
    update: UpdateFilter<Document<T>>,
    options?: UpdateOptions,
  ) => Promise<UpdateResult<Document<T>>>
  updateMany: (
    filter: Filter<Document<T>>,
    update: UpdateFilter<Document<T>>,
    options?: UpdateOptions,
  ) => Promise<UpdateResult<Document<T>>>
  findOne: (
    filter: Filter<Document<T>>,
    options?: FindOptions,
  ) => Promise<T | null>
  findMany: (filter: Filter<Document<T>>, options?: FindOptions) => Promise<T[]>
  deleteOne: (
    filter: Filter<Document<T>>,
    options?: DeleteOptions,
  ) => Promise<DeleteResult>
  deleteMany: (
    filter: Filter<Document<T>>,
    options?: DeleteOptions,
  ) => Promise<DeleteResult>
  aggregate: <T>(
    pipeline?: Record<string, unknown>[],
    options?: AggregateOptions,
  ) => Promise<T[]>
  count: (filter: Filter<Document<T>>) => Promise<number>
  createIndex: (
    indexSpec: IndexSpecification,
    options?: CreateIndexesOptions,
  ) => Promise<string>
}

export type MongodbBuilder = {
  db: Db
  connect: () => Promise<void>
  close: () => Promise<void>
  collection: <T extends { id: string }>(
    collectionName: string,
  ) => MongodbCollection<T>
}
