import { BlueBerryClient, BlueBerryServer } from '../src'

new BlueBerryServer(8080).start()
const a = new BlueBerryClient('ws://localhost:8080')
// a.on('message', data => {
//   console.log(String(data))
// })
a.on('open', () => {
  a.maintenance({ maintenance: true }).then(a => {
    console.log(a)
  })
})
