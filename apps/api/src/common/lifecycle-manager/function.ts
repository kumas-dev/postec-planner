import { CleanupFn, InitFn } from '.'

export function createLifecycleManager(
  options: { enableSignalHandling?: boolean } = {},
) {
  const cleanupFns: CleanupFn[] = []

  async function add(fn: InitFn) {
    const cleanup = await fn()
    if (typeof cleanup === 'function') {
      cleanupFns.push(cleanup)
    }
  }

  async function shutdown() {
    // eslint-disable-next-line no-console
    console.log('\nShutting down resources...')
    for (const fn of cleanupFns.reverse()) {
      try {
        await fn()
      } catch (err) {
        console.error('Error during shutdown:', err)
      }
    }
    // eslint-disable-next-line no-console
    console.log('Shutdown complete.')
  }

  function setupSignalHandlers() {
    async function shutdownAndExit(signal: string) {
      // eslint-disable-next-line no-console
      console.log(`Received signal: ${signal}`)
      await shutdown()
      process.exit(0)
    }

    process.once('SIGINT', function () {
      shutdownAndExit('SIGINT')
    })
    process.once('SIGTERM', function () {
      shutdownAndExit('SIGTERM')
    })
    process.once('uncaughtException', async function (err) {
      console.error('Uncaught exception:', err)
      await shutdown()
      process.exit(1)
    })
    process.once('unhandledRejection', async function (reason) {
      console.error('Unhandled rejection:', reason)
      await shutdown()
      process.exit(1)
    })
  }

  if (options.enableSignalHandling ?? true) {
    setupSignalHandlers()
  }

  return {
    add,
    shutdown,
  }
}
