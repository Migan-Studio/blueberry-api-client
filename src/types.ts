export interface Maintenance {
  maintenance: boolean
  date?: {
    start: Date
    end: Date
  }
  message?: string
}

declare module '@sapphire/pieces' {
  interface Container {
    maintenance: Maintenance | null
  }
}
