import {
  Actions,
  FirstConnectionRequest,
  FirstConnectionResponse,
  Socket,
  WebSocketError,
  WebSocketOk,
  WebSocketRequest,
  WebSocketResponse,
} from '../../types'
import { container } from '@sapphire/pieces'
import { WebSocket } from 'ws'

export function resFirstConnection(ws: WebSocket, wsData: WebSocketResponse) {
  if (Math.floor(wsData.status / 100) !== 2) {
    throw new Error(`[BlueBerryAPI Client] ${(wsData as WebSocketError).error}`)
  }

  const { maintenance, date, message } = (
    wsData as WebSocketOk<FirstConnectionResponse>
  ).data

  if (maintenance)
    container.maintenance = {
      maintenance,
      date,
      message,
    }
  else container.maintenance = null
}

export function reqFirstConnection(
  ws: WebSocket,
  wsData: WebSocketRequest<FirstConnectionRequest>,
  sockets: Socket[],
): Socket[] {
  const newSockets: Socket[] = [...sockets]
  for (const socket of sockets) {
    if (socket.name === wsData.data.client)
      ws.send(
        JSON.stringify({
          Actions: Actions.ResFirstConnection,
          status: 409,
          error: `${wsData.data.client} is already used.`,
        }),
      )
    return newSockets
  }

  newSockets.push({
    name: wsData.data.client,
    socket: ws,
  })

  ws.send(
    JSON.stringify({
      action: Actions.ResFirstConnection,
      status: 200,
      data: {
        heartbeat_interval: wsData.data.heartbeatInterval,
        // dummy
        maintenance: false,
      },
    }),
  )

  return newSockets
}
