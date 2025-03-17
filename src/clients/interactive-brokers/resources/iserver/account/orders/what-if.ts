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
}, { extendable: true })

export interface WhatIfResponse extends GuardType<typeof WhatIfResponse> {}

export interface Margin {
  readonly buy: {
    readonly initial: number
    readonly maintenance: number
  }

  readonly sell: {
    readonly initial: number
    readonly maintenance: number
  }
}

export class WhatIf {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath(`${client.accountID}/orders/whatif`)
  }

  async post(parameters: {
    readonly conid: string | number
    readonly side: 'BUY' | 'SELL'
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
          side: parameters.side,
          tif: 'DAY',
        }],
      },
      signal,
      timeout,
    })
  }

  async margin(parameters: {
    readonly conid: string | number
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<Margin> {
    const [buy, sell] = await Promise.allSettled([
      this.post({ conid: parameters.conid, side: 'BUY' }, { signal, timeout }),
      this.post({ conid: parameters.conid, side: 'SELL' }, { signal, timeout }),
    ]).then(([buyResult, sellResult]) => {
      if (buyResult.status === 'rejected') {
        throw buyResult.reason
      }

      if (sellResult.status === 'rejected') {
        throw sellResult.reason
      }

      return [buyResult.value, sellResult.value] as const
    })

    return {
      buy: {
        initial: Number(buy.initial.change.replace(/,/g, '')),
        maintenance: Number(buy.maintenance.change.replace(/,/g, '')),
      },
      sell: {
        initial: Number(sell.initial.change.replace(/,/g, '')),
        maintenance: Number(sell.maintenance.change.replace(/,/g, '')),
      },
    }
  }
}
