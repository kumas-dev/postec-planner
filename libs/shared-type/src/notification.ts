import { z } from 'zod'

export const createNavigationNotificationSchema = z.object({
  partnerId: z.string(),
})

export type CreateNavigationNotificationDto = z.infer<
  typeof createNavigationNotificationSchema
>

export type CreateNavigationNotificationInput = z.input<
  typeof createNavigationNotificationSchema
>
