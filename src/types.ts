export interface Maintenance {
  maintenance: boolean
  date?: {
    start: Date
    end: Date
  }
  message?: string
}

export enum Actions {
  Maintenance = 'maintenance',
  Status = 'status',
}

export interface WebSocketRequest<K = undefined> {
  action: Actions
  data: K
}

export interface WebSocketResponse {
  action: Actions
  status: number
}

export interface WebSocketError extends WebSocketResponse {
  error: string
}

export interface WebSocketOk<T = undefined> extends WebSocketResponse {
  data: T
}
