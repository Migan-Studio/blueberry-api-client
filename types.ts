import { ReleaseChannel } from '../utils'
import { WebSocket } from 'ws'

export interface Maintenance {
  maintenance: boolean
  date?: {
    start: Date
    end: Date
  }
  message?: string
}

export interface Status {
  releaseChannel: ReleaseChannel
  version: string
  maintenance: Maintenance | null
  uptime: number
}

export interface StatusRequest {
  client: ReleaseChannel
}

export interface FirstConnectionRequest {
  client: ReleaseChannel
  heartbeatInterval: number
}

export interface FirstConnectionResponse extends Maintenance {
  heartbeat_interval: number
}

export interface Socket {
  name: ReleaseChannel
  socket: WebSocket
}

export enum Actions {
  ReqMaintenance = 'reqMaintenance',
  ResMaintenance = 'resMaintenance',
  ReqStatus = 'reqStatus',
  ResStatus = 'resStatus',
  ReqFirstConnection = 'reqFirstConnection',
  ResFirstConnection = 'resFirstConnection',
}

export interface WebSocketData {
  action: Actions
}

export interface WebSocketRequest<K = undefined> extends WebSocketData {
  data: K
}

export interface WebSocketResponse extends WebSocketData {
  status: number
}

export interface WebSocketError extends WebSocketResponse {
  error: string
}

export interface WebSocketOk<T = undefined> extends WebSocketResponse {
  data: T
}
