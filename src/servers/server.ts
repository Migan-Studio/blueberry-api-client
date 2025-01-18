import { Actions, maintenance, version } from '..'
import type { WebSocketRequest } from '../types'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

export class BlueBerryServer {
  public app = express()
  public constructor(public port: number) {
    console.log(`[BlueBerryAPI server] version: ${version}`)

    this.app.use(express.json())

    this.app.get('/', (_, res) => {
      res.json({
        ping: 'Pong!',
      })
    })
  }

  public start() {
    const httpServer = createServer(this.app)
    const wsServer = new WebSocketServer({ server: httpServer })

    httpServer.listen(this.port, () => {
      console.log(`[BlueBerryAPI server] port: ${this.port}`)
      console.log('[BlueBerryAPI server] Server is on.')
    })

    wsServer.on('connection', ws => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[BlueBerryAPI server] connected.')
      }

      ws.on('message', raw => {
        try {
          const data: WebSocketRequest<any> = JSON.parse(String(raw))

          switch (data.action) {
            case Actions.Maintenance:
              maintenance(ws, data)
          }
        } catch (err) {
          console.error(err)
          ws.send(
            JSON.stringify({
              status_code: 400,
              error: 'The data is json. But it is not json',
            }),
          )
        }
      })

      ws.on('close', () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[BlueBerryAPI server] closed.')
        }
      })
    })
  }
}
