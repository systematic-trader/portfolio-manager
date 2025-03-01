import {
  boolean,
  type GuardType,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'

export const StatusResponse = props({
  authenticated: boolean(),
  competing: boolean(),
  connected: boolean(),
  message: optional(string()),
  MAC: string(),
  serverInfo: props({
    serverName: string(),
    serverVersion: string(),
  }),
  hardware_info: optional(string()),
  fail: optional(string()),
})

export interface StatusResponse extends GuardType<typeof StatusResponse> {}

export class Status {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('status')
  }

  async post({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<StatusResponse> {
    return await this.#client.post({
      guard: StatusResponse,
      signal,
      timeout,
    })
  }
}
