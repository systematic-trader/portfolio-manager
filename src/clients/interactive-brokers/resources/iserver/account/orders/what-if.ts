import { type GuardType, props, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../../resource-client.ts'

const CurrentChangeAfter = props({
  current: string(),
  change: string(),
  after: string(),
})

const WhatIfResponse = props({
  amount: props({
    amount: string(),
    commission: string(),
    total: string(),
  }),

  equity: CurrentChangeAfter,
  initial: CurrentChangeAfter,
  maintenance: CurrentChangeAfter,
  position: CurrentChangeAfter,
})

interface WhatIfResponse extends GuardType<typeof WhatIfResponse> {}

export class WhatIf {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath(`${client.accountID}/orders/whatif`)
  }

  async post(parameters: {
    readonly conid: string | number
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<WhatIfResponse> {
    return await this.#client.post({
      guard: WhatIfResponse,
      body: {
        orders: [{
          conidex: `${parameters.conid}@SMART`,
          orderType: 'MKT',
          manualIndicator: false,
          quantity: 1,
          side: 'BUY',
          tif: 'DAY',
        }],
      },
      signal,
      timeout,
    })
  }
}
