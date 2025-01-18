import { Actions, Maintenance, WebSocketRequest } from '../../types'
import { WebSocket } from 'ws'

export function maintenance(
  ws: WebSocket,
  wsData: WebSocketRequest<Maintenance>,
) {
  if (wsData.data === undefined) {
    return ws.send(JSON.stringify({}))
  }

  const data: Maintenance = {
    maintenance: wsData.data.maintenance,
  }

  wsData.data.date ? (data.date = wsData.data.date) : null

  if (data.maintenance === undefined) {
    return ws.send(
      JSON.stringify({
        action: Actions.Maintenance,
        status: 'Bad Request',
        error: 'The maintenance value is required.',
        status_code: 400,
      }),
    )
  }

  ws.send(
    JSON.stringify({
      action: Actions.Maintenance,
      status: 200,
    }),
  )
}
