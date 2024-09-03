import { Environment } from './environment.ts'
import { HTTPClient } from './http-client.ts'
import { AccountGroupResource } from './resources/portfolio/account-group-resource.ts'
import { AccountResource } from './resources/portfolio/account-resource.ts'
import { BalanceResource } from './resources/portfolio/balance-resource.ts'
import { ClientResource } from './resources/portfolio/client-resource.ts'
import { ClosedPositionResource } from './resources/portfolio/closed-position-resource.ts'
import { ExposureResource } from './resources/portfolio/exposure-resource.ts'
import { NetPositionResource } from './resources/portfolio/net-position-resource.ts'
import { OrderResource } from './resources/portfolio/order-resource.ts'
import { UserResource } from './resources/portfolio/user-resource.ts'

export class SaxoBankClient {
  readonly #client: HTTPClient

  readonly portfolio: {
    readonly accountGroups: AccountGroupResource
    readonly account: AccountResource
    readonly balance: BalanceResource
    readonly client: ClientResource
    readonly closedPosition: ClosedPositionResource
    readonly exposure: ExposureResource
    readonly netPosition: NetPositionResource
    readonly order: OrderResource
    readonly position: ClosedPositionResource
    readonly user: UserResource
  }

  constructor({
    token = Environment['SAXOBANK_API_AUTHORIZATION_BEARER_TOKEN'],
    prefixURL = Environment['SAXOBANK_API_PREFIX_URL'] ?? 'https://gateway.saxobank.com/sim/openapi',
  }: {
    readonly token?: undefined | string
    readonly prefixURL?: undefined | string
  } = {}) {
    if (token === undefined) {
      throw new Error('No token provided')
    }

    if (prefixURL === undefined) {
      throw new Error('No prefix URL provided')
    }

    this.#client = HTTPClient.withBearerToken(token)

    this.portfolio = {
      accountGroups: new AccountGroupResource({ client: this.#client, prefixURL }),
      account: new AccountResource({ client: this.#client, prefixURL }),
      balance: new BalanceResource({ client: this.#client, prefixURL }),
      client: new ClientResource({ client: this.#client, prefixURL }),
      closedPosition: new ClosedPositionResource({ client: this.#client, prefixURL }),
      exposure: new ExposureResource({ client: this.#client, prefixURL }),
      netPosition: new NetPositionResource({ client: this.#client, prefixURL }),
      order: new OrderResource({ client: this.#client, prefixURL }),
      position: new ClosedPositionResource({ client: this.#client, prefixURL }),
      user: new UserResource({ client: this.#client, prefixURL }),
    }
  }
}
