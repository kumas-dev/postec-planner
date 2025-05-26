import '@/common/env'
import { createApp } from '@/app'
import { createLifecycleManager } from '@/common/lifecycle-manager'
import { employeeRepository } from './employee'

const PORT = process.env.PORT || 3000

async function main() {
  const lifecycle = createLifecycleManager()

  await lifecycle.add(async () => {
    const app = createApp()
    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on ${PORT}`)
    })

    return () => {
      server.close()
      // eslint-disable-next-line no-console
      console.log('HTTP server closed')
    }
  })
}

main()
