import { messaging } from 'firebase-admin'
import { NotificationEntity } from '.'

export async function sendPushMessage({
  notification,
  token,
}: {
  notification: NotificationEntity
  token: string
}): Promise<boolean> {
  const { title, content, url } = notification
  try {
    await messaging().send({
      notification: {
        ...(title && { title }),
        ...(content && { body: content }),
      },
      token,
      data: { ...(url && { url }) },
    })

    return true
  } catch (e) {
    return false
  }
}
