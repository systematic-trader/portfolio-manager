import {
  type ArgumentType,
  AssertionError,
  assertReturn,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { PositionFieldGroup } from '../../types/derives/position-field-group.ts'
import {
  PositionResponseBond,
  PositionResponseCfdOnEtc,
  PositionResponseCfdOnEtf,
  PositionResponseCfdOnEtn,
  PositionResponseCfdOnFund,
  PositionResponseCfdOnFutures,
  PositionResponseCfdOnIndex,
  PositionResponseCfdOnStock,
  PositionResponseContractFutures,
  PositionResponseEtc,
  PositionResponseEtf,
  PositionResponseEtn,
  PositionResponseFund,
  PositionResponseFxForwards,
  PositionResponseFxSpot,
  PositionResponseStock,
  type PositionResponseUnion,
  PositionResponseUnknown,
} from '../../types/records/position-response.ts'
import type { PositionsRequest } from '../../types/records/positions-request.ts'
import { Subscriptions } from './positions/subscriptions.ts'

const FieldGroups: PositionFieldGroup[] = [
  'Costs',
  'DisplayAndFormat',
  'ExchangeInfo',
  'Greeks',
  'PositionBase',
  'PositionIdOnly',
  'PositionView',
]

export class Positions {
  readonly #client: ServiceGroupClient

  readonly subscriptions: Subscriptions

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/positions')

    this.subscriptions = new Subscriptions({ client: this.#client })
  }

  async *get(
    {
      AccountGroupKey,
      AccountKey,
      ClientKey,
      NetPositionId,
      PositionId,
      WatchlistId,
    }: ArgumentType<PositionsRequest>,
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<PositionResponseUnion, void, undefined> {
    const positions = this.#client.getPaginated<PositionResponseUnion>({
      searchParams: {
        AccountGroupKey,
        AccountKey,
        ClientKey,
        NetPositionId,
        PositionId,
        WatchlistId,
        FieldGroups,
      },
      timeout: options.timeout,
    }).execute()

    for await (const position of positions) {
      try {
        yield assertReturnPositionResponse(position)
      } catch (error) {
        if (error instanceof AssertionError) {
          // deno-lint-ignore no-console
          console.trace(error.invalidations)
        }

        throw error
      }
    }
  }
}

function assertReturnPositionResponse(
  position: PositionResponseUnion,
): PositionResponseUnion {
  switch (position.PositionBase.AssetType) {
    case 'Bond': {
      return assertReturn(PositionResponseBond, position)
    }

    case 'CfdOnEtc': {
      return assertReturn(PositionResponseCfdOnEtc, position)
    }

    case 'CfdOnEtf': {
      return assertReturn(PositionResponseCfdOnEtf, position)
    }

    case 'CfdOnEtn': {
      return assertReturn(PositionResponseCfdOnEtn, position)
    }

    case 'CfdOnFund': {
      return assertReturn(PositionResponseCfdOnFund, position)
    }

    case 'CfdOnFutures': {
      return assertReturn(PositionResponseCfdOnFutures, position)
    }

    case 'CfdOnIndex': {
      return assertReturn(PositionResponseCfdOnIndex, position)
    }

    case 'CfdOnStock': {
      return assertReturn(PositionResponseCfdOnStock, position)
    }

    case 'ContractFutures': {
      return assertReturn(PositionResponseContractFutures, position)
    }

    case 'Etc': {
      return assertReturn(PositionResponseEtc, position)
    }

    case 'Etf': {
      return assertReturn(PositionResponseEtf, position)
    }

    case 'Etn': {
      return assertReturn(PositionResponseEtn, position)
    }

    case 'Fund': {
      return assertReturn(PositionResponseFund, position)
    }

    case 'FxSpot': {
      return assertReturn(PositionResponseFxSpot, position)
    }

    case 'FxForwards': {
      return assertReturn(PositionResponseFxForwards, position)
    }

    case 'Stock': {
      return assertReturn(PositionResponseStock, position)
    }

    default: {
      return assertReturn(PositionResponseUnknown, position)
    }
  }
}
