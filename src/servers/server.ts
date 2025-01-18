import { version } from '..'
import { maintenance } from './routes'
import type { Container } from '@sapphire/framework'
import express from 'express'

export class BlueBerryServer {
  public app = express()
  public constructor(
    public container: Container,
    public port: number,
  ) {
    console.log(`[BlueBerryAPI server] version: ${version}`)

    this.app.use(express.json())

    this.app.get('/', (_, res) => {
      res.json({
        ping: 'Pong!',
      })
    })

    this.app.get('/maintenance', maintenance)
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`[BlueBerryAPI server] port: ${this.port}`)
      console.log('[BlueBerryAPI server] Server is on.')
    })
  }
}
