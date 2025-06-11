import {
  AggregateOptions,
  BulkWriteOptions,
  DeleteOptions,
  Filter,
  FindOptions,
  InsertOneOptions,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateOptions,
  WithId,
  CreateIndexesOptions,
  IndexSpecification,
  MongoClient,
  Db,
} from 'mongodb'
import {
  MongodbBuilderOptions,
  Document,
  MongodbCollection,
  MongodbBuilder,
} from './type'
import { DEFAULT_MONGODB_OPTIONS } from './constant'

function connect(client: MongoClient) {
  return async function () {
    await client.connect()
  }
}

function close(client: MongoClient) {
  return async function () {
    await client.close()
  }
}

function convertMongoIdToId<T extends { id: string }>({
  _id,
  ...rest
}: WithId<Document<T>>): T {
  return { id: _id, ...rest } as unknown as T
}

function convertIdToMongoId<T extends { id: string }>(
  filter: Filter<Document<T>>,
): Filter<Document<T>> {
  if (!filter || typeof filter !== 'object') {
    return filter
  }

  return Object.entries(filter).reduce(
    (acc, [key, value]) => {
      if (key === 'id') {
        return { ...acc, _id: value }
      }
      return { ...acc, [key]: value }
    },
    {} as Filter<Document<T>>,
  )
}

function insertOne(db: Db) {
  return function <T extends { id: string }>(
    collectionName: string,
    { id, ...attributes }: T,
    options: InsertOneOptions = {},
  ) {
    return db.collection<Document<T>>(collectionName).insertOne(
      {
        _id: id,
        ...attributes,
        updatedAt: new Date(),
        createdAt: new Date(),
      } as OptionalUnlessRequiredId<Document<T>>,
      options,
    )
  }
}

function insertMany(db: Db) {
  return function <T extends { id: string }>(
    collectionName: string,
    documents: T[],
    options: BulkWriteOptions = {},
  ) {
    return db.collection<Document<T>>(collectionName).insertMany(
      documents.map(
        ({ id, ...attributes }) =>
          ({
            _id: id,
            ...attributes,
            updatedAt: new Date(),
            createdAt: new Date(),
          }) as OptionalUnlessRequiredId<Document<T>>,
        options,
      ),
    )
  }
}

function updateOne(db: Db) {
  return function <T extends { id: string }>(
    collectionName: string,
    filter: Filter<Document<T>>,
    update: UpdateFilter<Document<T>>,
    options: UpdateOptions = {},
  ) {
    const { $set: setAttributes, $setOnInsert: setOnInsertAttributes } = update

    return db.collection<Document<T>>(collectionName).updateOne(
      convertIdToMongoId(filter),
      {
        ...update,
        $setOnInsert: { ...setOnInsertAttributes, createdAt: new Date() },
        $set: { ...setAttributes, updatedAt: new Date() },
      } as UpdateFilter<Document<T>>,
      options,
    )
  }
}

function updateMany(db: Db) {
  return async function <T extends { id: string }>(
    collectionName: string,
    filter: Filter<Document<T>>,
    update: UpdateFilter<Document<T>>,
    options: UpdateOptions = {},
  ) {
    const { $set: setAttributes, $setOnInsert: setOnInsertAttributes } = update

    return db.collection<Document<T>>(collectionName).updateMany(
      convertIdToMongoId(filter),
      {
        ...update,
        $setOnInsert: { ...setOnInsertAttributes, createdAt: new Date() },
        $set: { ...setAttributes, updatedAt: new Date() },
      } as UpdateFilter<Document<T>>,
      options,
    )
  }
}

function findOne(db: Db) {
  return async function <T extends { id: string }>(
    collectionName: string,
    filter: Filter<Document<T>>,
    options: FindOptions = {},
  ): Promise<T | null> {
    const document = await db
      .collection<Document<T>>(collectionName)
      .findOne(filter, options)

    return document ? convertMongoIdToId(document) : null
  }
}

function findMany(db: Db) {
  return async function <T extends { id: string }>(
    collectionName: string,
    filter: Filter<Document<T>>,
    options?: FindOptions,
  ): Promise<T[]> {
    const documents = await db
      .collection<Document<T>>(collectionName)
      .find(filter, options)
      .toArray()

    return documents.map(convertMongoIdToId)
  }
}

function deleteOne(db: Db) {
  return function <T extends { id: string }>(
    collectionName: string,
    filter: Filter<Document<T>>,
    options: DeleteOptions = {},
  ) {
    return db.collection<Document<T>>(collectionName).deleteOne(filter, options)
  }
}

function deleteMany(db: Db) {
  return function <T extends { id: string }>(
    collectionName: string,
    filter: Filter<Document<T>>,
    options: DeleteOptions = {},
  ) {
    return db
      .collection<Document<T>>(collectionName)
      .deleteMany(filter, options)
  }
}

function aggregate(db: Db) {
  return function <T>(
    collectionName: string,
    pipeline?: Record<string, unknown>[],
    options?: AggregateOptions,
  ) {
    return db
      .collection(collectionName)
      .aggregate(pipeline, options)
      .toArray() as Promise<T[]>
  }
}

function count(db: Db) {
  return function <T extends { id: string }>(
    collectionName: string,
    filter: Filter<Document<T>>,
  ): Promise<number> {
    return db.collection<Document<T>>(collectionName).countDocuments(filter)
  }
}

function createIndex(db: Db) {
  return function (
    collectionName: string,
    indexSpec: IndexSpecification,
    options: CreateIndexesOptions = {},
  ): Promise<string> {
    return db.collection(collectionName).createIndex(indexSpec, options)
  }
}

function collection(db: Db) {
  return function (collectionName: string): MongodbCollection {
    return {
      insertOne: <T extends { id: string }>(
        document: T,
        options?: InsertOneOptions,
      ) => insertOne(db)(collectionName, document, options),
      insertMany: <T extends { id: string }>(
        documents: T[],
        options?: BulkWriteOptions,
      ) => insertMany(db)(collectionName, documents, options),
      updateOne: <T extends { id: string }>(
        filter: Filter<Document<T>>,
        update: UpdateFilter<Document<T>>,
        options?: UpdateOptions,
      ) => updateOne(db)(collectionName, filter, update, options),
      updateMany: <T extends { id: string }>(
        filter: Filter<Document<T>>,
        update: UpdateFilter<Document<T>>,
        options?: UpdateOptions,
      ) => updateMany(db)(collectionName, filter, update, options),
      findOne: <T extends { id: string }>(
        filter: Filter<Document<T>>,
        options?: FindOptions,
      ) => findOne(db)(collectionName, filter, options),
      findMany: <T extends { id: string }>(
        filter: Filter<Document<T>>,
        options?: FindOptions,
      ) => findMany(db)(collectionName, filter, options),
      deleteOne: <T extends { id: string }>(
        filter: Filter<Document<T>>,
        options?: DeleteOptions,
      ) => deleteOne(db)(collectionName, filter, options),
      deleteMany: <T extends { id: string }>(
        filter: Filter<Document<T>>,
        options?: DeleteOptions,
      ) => deleteMany(db)(collectionName, filter, options),
      aggregate: (
        pipeline?: Record<string, unknown>[],
        options?: AggregateOptions,
      ) => aggregate(db)(collectionName, pipeline, options),
      count: <T extends { id: string }>(filter: Filter<Document<T>>) =>
        count(db)(collectionName, filter),
      createIndex: (
        indexSpec: IndexSpecification,
        options?: CreateIndexesOptions,
      ) => createIndex(db)(collectionName, indexSpec, options),
    }
  }
}

export function createMongodb(
  inputOptions: MongodbBuilderOptions = {},
): MongodbBuilder {
  const { databaseUrl } = { ...DEFAULT_MONGODB_OPTIONS, ...inputOptions }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set')
  }

  const client = new MongoClient(databaseUrl, { ignoreUndefined: true })
  const db = client.db(new URL(databaseUrl).pathname.replace(/^\//, ''))

  const methods = {
    connect: connect(client),
    close: close(client),
    collection: collection(db),
  }

  return { db, ...methods }
}
