import { collection } from '@/common/mongodb-client'
import { DeviceEntity } from '.'

const devices = collection<DeviceEntity>('devices')

function findDeviceById(id: string): Promise<DeviceEntity | null> {
  return devices.findOne({ _id: id })
}

function findDevices(): Promise<DeviceEntity[]> {
  return devices.findMany({})
}

async function createOrUpdateDevice(
  id: string,
  { token }: Omit<DeviceEntity, 'id'>,
) {
  const found = await devices.findOne({ _id: id })

  if (found) {
    await devices.updateOne({ _id: id }, { $set: { token } })

    return
  }

  const device: DeviceEntity = { id, token }

  await devices.insertOne(device)
}

function deleteDeviceById(id: string) {
  return devices.deleteOne({ _id: id })
}

export const deviceRepository = {
  createOrUpdateDevice,
  findDeviceById,
  findDevices,
  deleteDeviceById,
}
