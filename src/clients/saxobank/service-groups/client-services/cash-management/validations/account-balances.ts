import type { ServiceGroupClient } from '../../../../service-group-client/service-group-client.ts'

export class AccountBalances {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('accountBalances')
  }

  // https://www.saxotrader.com/openapi/cs/v2/cashmanagement/validations/accountBalances?fromAccountKey=DOVYUh7aaY33%7CHlcbjDS9w%3D%3D

  async get(
    options: {
      readonly fromAccountKey: string
    },
    httpOptions: undefined | { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<string> {
    const response = await this.#client.get({
      searchParams: {
        fromAccountKey: options.fromAccountKey,
      },
      signal: httpOptions.signal,
      timeout: httpOptions.timeout,
    }).execute()

    console.log('response', response)

    return 'todo' // todo
  }
}
