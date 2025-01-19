import { Actions, getMaintenance, sendMaintenance, version } from '..'
import type { Maintenance, WebSocketRequest } from '../types'
import EventEmitter from 'events'
import express from 'express'
import { createServer, IncomingMessage } from 'http'
import { WebSocket, WebSocketServer } from 'ws'

export class BlueBerryServer extends EventEmitter {
  private _app = express()
  private _httpServer = createServer(this._app)
  private _wsServer = new WebSocketServer({ server: this._httpServer })
  private _ws?: WebSocket
  public constructor(private _port: number) {
    super()
    console.log(`[BlueBerryAPI server] version: ${version}`)

    this._app.use(express.json())

    this._app.get('/', (_, res) => {
      res.json({
        ping: 'Pong!',
      })
    })
  }

  public start() {
    this._httpServer.listen(this._port, () => {
      console.log(`[BlueBerryAPI server] port: ${this._port}`)
      console.log('[BlueBerryAPI server] Server is on.')
    })

    this._wsServer.on('connection', (ws, request: IncomingMessage) => {
      this.emit('connection', ws, request)

      this._ws = ws

      if (process.env.NODE_ENV === 'development') {
        console.log('[BlueBerryAPI server] connected.')
      }

      ws.on('message', (raw, isBinary) => {
        this.emit('message', raw, isBinary)

        try {
          const data: WebSocketRequest<any> = JSON.parse(String(raw))

          switch (data.action) {
            case Actions.ReqMaintenance:
              getMaintenance(ws, data)
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

  public maintenance(data: Maintenance) {
    if (this._ws === undefined)
      throw new Error(
        '[BlueBerryAPI Server] The WebSocket server is not opened.',
      )

    return sendMaintenance(this._ws, data)
  }
}
