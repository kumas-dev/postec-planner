import { z } from 'zod'

export const UpdateDeviceTokenSchema = z.object({
  token: z.string(),
})

export type UpdateDeviceTokenDto = z.infer<typeof UpdateDeviceTokenSchema>

export type UpdateDeviceTokenInput = z.input<typeof UpdateDeviceTokenSchema>
