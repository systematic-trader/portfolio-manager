import type { HTTPClient } from '../../http-client.ts'
import { ClosedPositionResponse } from '../../types/records/closed-position-response.ts'
import { fetchResourceData } from '../fetch-resource-data.ts'
import { urlJoin } from '../utils.ts'
import type { ClosedPositionFieldGroup } from '../../types/derives/closed-position-field-group.ts'

/**
 * Read only end points serving closed positions and the underlying closed positions making up the net closed position. The set of closed positions is restricted by the supplied query parameters as well as whether or not the identity represented by the authorization token has access to the account on which the positions are posted.
 * - A user of a client will have access to accounts under that client
 * - A user of an IB or WLC will have access to accounts on that client or clients there under
 * - An employee has access to all accounts
 *  -A request containing a TradingFloor "Federated Access" token will have access to the account specified in that token.
If access is granted on the basis of the TradingFloor "Federated Access" token, then the number of fields will be a subset of the full set of fields shown in the specification for the response.
 */
export class ClosedPositionResource {
  readonly #client: HTTPClient
  readonly #resourceURL: URL

  constructor({
    client,
    prefixURL,
  }: {
    readonly client: HTTPClient
    readonly prefixURL: string
  }) {
    this.#client = client
    this.#resourceURL = urlJoin(prefixURL, 'port', 'v1', 'closedpositions')
  }

  me({ skip, top, fieldGroups }: {
    skip?: undefined | number
    top?: undefined | number
    fieldGroups: ReadonlyArray<ClosedPositionFieldGroup>
  }): Promise<ReadonlyArray<ClosedPositionResponse>> {
    const url = urlJoin(this.#resourceURL, 'me')

    if (skip !== undefined) {
      url.searchParams.set('$skip', skip.toString())
    }

    if (top !== undefined) {
      url.searchParams.set('$top', top.toString())
    }

    if (fieldGroups.length > 0) {
      url.searchParams.set('FieldGroups', fieldGroups.join(','))
    }

    return fetchResourceData({
      client: this.#client,
      url,
      guard: ClosedPositionResponse,
    })
  }
}