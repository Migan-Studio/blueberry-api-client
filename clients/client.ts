import { reqMaintenance, resMaintenance, resFirstConnection } from '../routes'
import {
  Actions,
  Maintenance,
  WebSocketRequest,
  WebSocketResponse,
} from '../types'
import { container } from '@sapphire/pieces'
import { EventEmitter } from 'events'
import { WebSocket } from 'ws'

export class BlueBerryClient extends EventEmitter {
  private _ws: WebSocket
  public constructor(private url: string) {
    super()
    this._ws = new WebSocket(this.url)

    this._ws.on('open', (...args) => {
      console.log('[BlueBerryAPI Client] Connected by server.')
      this.emit('open', ...args)

      this._ws.send(
        JSON.stringify({
          action: Actions.ReqFirstConnection,
          data: {
            client: container.channel,
            heartbeat_interval: container.heartbeatInterval,
          },
        }),
      )
    })

    this._ws.on('message', (raw, isBinary) => {
      this.emit('message', raw, isBinary)

      const wsData: WebSocketRequest<any> = JSON.parse(String(raw))

      switch (wsData.action) {
        case Actions.ReqMaintenance:
          reqMaintenance(this._ws, wsData)
      }
    })

    this._ws.on('message', raw => {
      const wsData: WebSocketResponse = JSON.parse(String(raw))

      switch (wsData.action) {
        case Actions.ResFirstConnection:
          resFirstConnection(this._ws, wsData)
      }
    })

    this._ws.on('ping', (...args) => {
      this.emit('ping', ...args)
    })
  }

  public maintenance(data: Maintenance) {
    return resMaintenance(this._ws, data)
  }
}
