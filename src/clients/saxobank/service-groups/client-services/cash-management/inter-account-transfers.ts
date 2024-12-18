import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { Currency3 } from '../../../types/derives/currency.ts'

export class InterAccountTransfers {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('interaccounttransfers')
  }

  // https://gateway.saxobank.com/openapi/cs/v2/cashmanagement/interaccounttransfers
  // https://www.saxotrader.com/openapi/cs/v2/cashmanagement/interaccounttransfers

  async post(
    options: {
      readonly Amount: number
      readonly Currency: Currency3
      readonly FromAccountKey: string
      readonly ToAccountKey: string
      readonly WithdrawalReasonId?: undefined | string
    },
    httpOptions: undefined | { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<string> {
    const response = await this.#client.post({
      body: options,
      signal: httpOptions.signal,
      timeout: httpOptions.timeout,
    }).execute()

    console.log('response', response)

    return 'todo' // todo
  }
}
