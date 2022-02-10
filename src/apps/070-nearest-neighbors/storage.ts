export type DataSetSchema = {
  users: RecordSchema[]
}

export type RecordSchema = {
  timestamp: string
  name: string
  IV: number
  V: number
  VI: number
  I: number
  II: number
  III: number
  VII: number
  Rogue1: number
  Holiday?: number
}
