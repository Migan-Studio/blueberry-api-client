import { ReleaseChannel } from '../../utils'
import { ClientToServerEvents, ServerToClientEvents } from '../types'
import { container } from '@sapphire/pieces'
import { EventEmitter } from 'events'
import { io, Socket } from 'socket.io-client'

export class BlueBerryClient extends EventEmitter {
  private _io: Socket<ServerToClientEvents, ClientToServerEvents>
  public constructor(private _url: string) {
    super()
    this._io = io(this._url)

    this._io.on('connect', () => {
      this._io.emit('handshake', container.channel, data => {
        if (!data.maintenance) container.maintenance = null
        else container.maintenance = data
      })
    })

    this._io.on('status', res => {
      res({
        releaseChannel: container.channel,
        version: container.version,
        maintenance: container.maintenance,
        // dummy
        uptime: 131,
      })
    })

    // this._io.on('message', (raw, isBinary) => {
    //   this.emit('message', raw, isBinary)

    //   const wsData: WebSocketRequest<any> = JSON.parse(String(raw))

    //   switch (wsData.action) {
    //     case Actions.ReqMaintenance:
    //       reqMaintenance(this._io, wsData)
    //     case Actions.ReqStatus:
    //       resStatus(this._io)
    //   }
    // })

    // this._io.on('message', raw => {
    //   const wsData: WebSocketResponse = JSON.parse(String(raw))

    //   switch (wsData.action) {
    //     case Actions.ResFirstConnection:
    //       resFirstConnection(this._io, wsData)
    //   }
    // })

    // this._io.on('ping', (...args) => {
    //   this.emit('ping', ...args)
    // })
  }

  public status(client: ReleaseChannel) {
    return new Promise(resolve => {
      this._io.emit('status', client, data => {
        resolve(data)
      })
    })
  }
}
