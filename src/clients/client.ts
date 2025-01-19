import { getMaintenance, sendMaintenance } from '../routes'
import { Actions, Maintenance, WebSocketRequest } from '../types'
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
    })

    this._ws.on('message', (raw, isBinary) => {
      this.emit('message', raw, isBinary)

      const data: WebSocketRequest<any> = JSON.parse(String(raw))

      switch (data.action) {
        case Actions.ReqMaintenance:
          getMaintenance(this._ws, data)
      }
    })

    this._ws.on('ping', (...args) => {
      this.emit('ping', ...args)
    })
  }

  public maintenance(data: Maintenance) {
    return sendMaintenance(this._ws, data)
  }
}
