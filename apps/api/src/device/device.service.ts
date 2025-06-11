import { deviceRepository } from '.'

export async function updateDevice(
  { employeeId, token }: { employeeId: string; token: string },
  { createOrUpdateDevice = deviceRepository.createOrUpdateDevice } = {},
) {
  await createOrUpdateDevice(employeeId, { token })
}
