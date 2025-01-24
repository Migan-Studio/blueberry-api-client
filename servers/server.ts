import { Actions, reqMaintenance, reqFirstConnection, version } from '..'
import type { Socket, WebSocketRequest } from '../types'
import EventEmitter from 'events'
import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

export class BlueBerryServer extends EventEmitter {
  private _app = express()
  private _httpServer = createServer(this._app)
  private _wsServer = new WebSocketServer({ server: this._httpServer })
  private _sockets: Socket[] = []
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

    this._wsServer.on('connection', (ws, request) => {
      this.emit('connection', ws, request)

      if (process.env.NODE_ENV === 'development') {
        console.log('[BlueBerryAPI server] connected.')
      }

      ws.on('message', (raw, isBinary) => {
        this.emit('message', raw, isBinary)

        try {
          const data: WebSocketRequest<any> = JSON.parse(String(raw))

          switch (data.action) {
            case Actions.ReqMaintenance:
              reqMaintenance(ws, data)
            case Actions.ReqFirstConnection:
              this._sockets = reqFirstConnection(ws, data, this._sockets)
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
