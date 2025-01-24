// TODO: 나중에 코드좀 깨끗하게 만들어야 할듯 함수명도 좀 그렇고
import {
  Actions,
  Socket,
  Status,
  StatusRequest,
  WebSocketError,
  WebSocketOk,
  WebSocketRequest,
  WebSocketResponse,
} from '../../types'
import { container } from '@sapphire/pieces'
import { RawData, WebSocket } from 'ws'

export function resStatus(ws: WebSocket) {
  ws.send(
    JSON.stringify({
      action: Actions.ResStatus,
      data: {
        release_channel: container.channel,
        version: container.version,
        maintenance: container.maintenance,
        // dummy
        uptime: 1234,
      },
    }),
  )
}

// 아래 두 함수 요약: 클라1 -> 서버 -> 클라2 -> 서버 -> 클라1
// 클라이언트가 서버에게 다른 클라이언트의 정보를 요청하는 함수
export function reqClientStatus(
  ws: WebSocket,
  data: StatusRequest,
): Promise<WebSocketOk<Status>> {
  ws.send(
    JSON.stringify({
      action: Actions.ReqFirstConnection,
      data,
    }),
  )

  return new Promise((resolve, reject) => {
    function listener(raw: RawData) {
      const data: WebSocketResponse = JSON.parse(String(raw))
      if (data.action !== Actions.ResStatus) return ws.once('message', listener)

      if (Math.floor(data.status / 100) !== 2)
        reject(
          new Error(`[BlueBerryAPI Error] ${(data as WebSocketError).error}`),
        )

      resolve(data as WebSocketOk<Status>)
    }

    ws.once('message', listener)
  })
}

// 서버가 클라이언트에게 요청하고, 그 요청에 대한 값을 해당 클라이언트의 정보를 요구하는 클라이언트에게 제공하는 함수
// TODO: 내가 봐도 작명이 좀 지랄맞긴함. 나중에 수정할 것임
export function reqServerStatus(
  ws1: WebSocket,
  wsData: WebSocketRequest<StatusRequest>,
  sockets: Socket[],
) {
  const ws2 = sockets.find(socket => socket.name === wsData.data.client)?.socket

  if (!ws2) {
    ws1.send(
      JSON.stringify({
        action: Actions.ResStatus,
        status: 404,
        error: `${wsData.data.client} is not found.`,
      }),
    )
    return
  }

  function listener(raw: RawData) {
    const data: WebSocketResponse = JSON.parse(String(raw))
    if (data.action !== Actions.ResStatus) return ws2?.once('message', listener)

    if (Math.floor(data.status / 100) !== 2) {
      return ws1.send(
        JSON.stringify({
          Actions: Actions.ResStatus,
          status: (data as WebSocketError).status,
          error: (data as WebSocketError).error,
        }),
      )
    }

    ws1.send(
      JSON.stringify({
        action: Actions.ResStatus,
        status: 200,
        data: (data as WebSocketOk<Status>).data,
      }),
    )
  }

  ws2.send(
    JSON.stringify({
      action: Actions.ReqStatus,
    }),
  )

  ws2.once('message', listener)
  return
}
