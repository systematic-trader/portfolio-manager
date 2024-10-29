import type { ServiceGroupClient } from '../../../../service-group-client.ts'

export class Reset {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client
  }

  /**
   * Reset the account balance to a specific value and deletes all orders and positions.
   * @param NewBalance The new account balance.
   * @param AccountKey The account key to reset.
   * @returns A promise that resolves when the account has been reset.
   */
  async put(
    { AccountKey, NewBalance }: {
      readonly AccountKey: string
      readonly NewBalance: number
    },
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<void> {
    if (Number.isSafeInteger(NewBalance) === false || NewBalance <= 0 || NewBalance > 10_000_000) {
      throw new Error('The account newBalance must be a positive integer between 1 and 100000000')
    }

    return await this.#client.put({
      path: `${AccountKey}/reset`,
      body: {
        NewBalance: NewBalance,
      },
      timeout: options.timeout,
    })
  }
}
