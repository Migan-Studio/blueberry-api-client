import {
  Actions,
  Maintenance,
  WebSocketResponse,
  WebSocketError,
  WebSocketOk,
} from '../types'
import { EventEmitter } from 'events'
import { RawData, WebSocket } from 'ws'

export class BlueBerryClient extends EventEmitter {
  private _ws: WebSocket
  public constructor(private url: string) {
    super()
    this._ws = new WebSocket(url)

    this._ws.on('open', (...args) => {
      console.log('[BlueBerryAPI Client] Connected by server.')
      this.emit('open', ...args)
    })

    this._ws.on('message', (...args) => {
      this.emit('message', ...args)
    })

    this._ws.on('ping', (...args) => {
      this.emit('ping', ...args)
    })
  }

  public maintenance(data: Maintenance) {
    const ws = this._ws

    ws.send(
      JSON.stringify({
        action: Actions.Maintenance,
        data,
      }),
    )
    return new Promise((resolve, reject) => {
      function listener(raw: RawData) {
        const data: WebSocketResponse = JSON.parse(String(raw))
        if (data.action !== Actions.Maintenance) {
          return ws.once('message', listener)
        }
        if (data.status === 400) {
          reject(
            new Error(
              `[BlueBerryAPI Client] ${(data as WebSocketError).error}`,
            ),
          )
        }

        resolve(data as WebSocketOk)
      }

      ws.once('message', listener)
    })
  }
}
