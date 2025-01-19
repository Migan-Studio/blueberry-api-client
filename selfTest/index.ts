import { BlueBerryClient, BlueBerryServer } from '../src'

const server = new BlueBerryServer(8080)
server.start()

const client = new BlueBerryClient('ws://localhost:8080')

client.on('open', () => {
  client.maintenance({ maintenance: true }).then(a => {
    console.log(`client ${JSON.stringify(a)}`)
  })
})

setTimeout(
  () =>
    server
      .maintenance({
        maintenance: true,
        date: {
          start: new Date(),
          end: new Date('2026-01-31T03:00:00+09:00'),
        },
      })
      .then(a => console.log(`server ${JSON.stringify(a)}`)),
  10000,
)
