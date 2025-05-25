import { createApp } from '@/app'

const PORT = process.env.PORT || 3000

async function main() {
  createApp().listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is listening on ${PORT}`)
  })
}

main()
