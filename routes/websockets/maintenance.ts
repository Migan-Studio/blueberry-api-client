import {
  Actions,
  Maintenance,
  WebSocketError,
  WebSocketOk,
  WebSocketRequest,
  WebSocketResponse,
} from '../../types'
import { RawData, WebSocket } from 'ws'

export function reqMaintenance(
  ws: WebSocket,
  wsData: WebSocketRequest<Maintenance>,
) {
  if (wsData.data === undefined) {
    return ws.send(
      JSON.stringify({
        action: Actions.ResMaintenance,
        status: 400,
        error: 'The data is required.',
      }),
    )
  }

  const data: Maintenance = {
    maintenance: wsData.data.maintenance,
    date: wsData.data.date,
    message: wsData.data.message,
  }

  if (data.maintenance === undefined) {
    return ws.send(
      JSON.stringify({
        action: Actions.ResMaintenance,
        status: 'Bad Request',
        error: 'The maintenance value is required.',
        status_code: 400,
      }),
    )
  }

  ws.send(
    JSON.stringify({
      action: Actions.ResMaintenance,
      status: 200,
    }),
  )
}

export function resMaintenance(
  ws: WebSocket,
  data: Maintenance,
): Promise<WebSocketOk<Maintenance>> {
  ws.send(
    JSON.stringify({
      action: Actions.ReqMaintenance,
      data,
    }),
  )
  return new Promise((resolve, reject) => {
    function listener(raw: RawData) {
      const data: WebSocketResponse = JSON.parse(String(raw))
      if (data.action !== Actions.ResMaintenance) {
        return ws.once('message', listener)
      }
      if (data.status === 400) {
        reject(
          new Error(`[BlueBerryAPI Client] ${(data as WebSocketError).error}`),
        )
      }

      resolve(data as WebSocketOk<Maintenance>)
    }

    ws.once('message', listener)
  })
}
