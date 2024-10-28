import { toArray } from '../../../utils/async-iterable.ts'
import type { SaxoBankApplication } from '../../saxobank-application.ts'

interface ResetSimulationAccount {
  (options?: {
    /**
     * The balance to reset the account to.
     * Must be within the range of 0 to 10,000,000.
     * The default is 50,000.
     */
    readonly balance?: undefined | number
  }): Promise<void>
}

/**
 * Creates a function to reset the simulation account to a given balance.
 * This is useful for testing on the simulation environment.
 */
export function createResetSimulationAccount({
  app,
  balance: defaultBalance = 50_000,
}: {
  /**
   * The SaxoBank application to use.
   * This must have a type of 'Simulation'.
   */
  readonly app: SaxoBankApplication

  /**
   * The default balance to reset the account to.
   * Must be within the range of 0 to 10,000,000.
   * The default is 50,000.
   */
  readonly balance?: undefined | number
}): {
  readonly resetSimulationAccount: ResetSimulationAccount
} {
  if (app.type !== 'Simulation') {
    throw new Error(
      `Expected SaxobankApplication type to be 'Simulation', but got '${app.type}' - only accounts on the simulation environment can be reset`,
    )
  }

  return {
    async resetSimulationAccount({ balance = defaultBalance }: { readonly balance?: undefined | number } = {}) {
      const [account] = await toArray(app.portfolio.accounts.me.get())
      if (account === undefined) {
        throw new Error(`Could not determine client for simulation user`)
      }

      await app.portfolio.accounts.account.reset.put({
        AccountKey: account.AccountKey,
        NewBalance: balance,
      })
    },
  }
}
