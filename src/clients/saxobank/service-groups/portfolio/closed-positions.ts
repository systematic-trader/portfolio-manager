import {
  type ArgumentType,
  AssertionError,
  assertReturn,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { ClosedPositionFieldGroup } from '../../types/derives/closed-position-field-group.ts'
import {
  ClosedPositionResponseBond,
  ClosedPositionResponseCfdOnEtc,
  ClosedPositionResponseCfdOnEtf,
  ClosedPositionResponseCfdOnEtn,
  ClosedPositionResponseCfdOnFund,
  ClosedPositionResponseCfdOnFutures,
  ClosedPositionResponseCfdOnIndex,
  ClosedPositionResponseCfdOnStock,
  ClosedPositionResponseContractFutures,
  ClosedPositionResponseEtc,
  ClosedPositionResponseEtf,
  ClosedPositionResponseEtn,
  ClosedPositionResponseFund,
  ClosedPositionResponseFxForwards,
  ClosedPositionResponseFxSpot,
  ClosedPositionResponseStock,
  type ClosedPositionResponseUnion,
  ClosedPositionResponseUnknown,
} from '../../types/records/closed-position-response.ts'
import type { ClosedPositionsRequest } from '../../types/records/closed-positions-request.ts'

const FieldGroups: ClosedPositionFieldGroup[] = [
  'ClosedPosition',
  'ClosedPositionDetails',
  'DisplayAndFormat',
  'ExchangeInfo',
]

export class ClosedPositions {
  readonly #client: ServiceGroupClient

  // readonly subscriptions: Subscriptions // todo

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/closedpositions')

    // this.subscriptions = new Subscriptions({ client: this.#client })
  }

  async *get(
    {
      AccountGroupKey,
      AccountKey,
      ClientKey,
      ClosedPositionId,
    }: ArgumentType<ClosedPositionsRequest>,
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<ClosedPositionResponseUnion, void, undefined> {
    const positions = this.#client.getPaginated<ClosedPositionResponseUnion>({
      searchParams: {
        AccountGroupKey,
        AccountKey,
        ClientKey,
        ClosedPositionId,
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
  position: ClosedPositionResponseUnion,
): ClosedPositionResponseUnion {
  switch (position.ClosedPosition.AssetType) {
    case 'Bond': {
      return assertReturn(ClosedPositionResponseBond, position)
    }

    case 'CfdOnEtc': {
      return assertReturn(ClosedPositionResponseCfdOnEtc, position)
    }

    case 'CfdOnEtf': {
      return assertReturn(ClosedPositionResponseCfdOnEtf, position)
    }

    case 'CfdOnEtn': {
      return assertReturn(ClosedPositionResponseCfdOnEtn, position)
    }

    case 'CfdOnFund': {
      return assertReturn(ClosedPositionResponseCfdOnFund, position)
    }

    case 'CfdOnFutures': {
      return assertReturn(ClosedPositionResponseCfdOnFutures, position)
    }

    case 'CfdOnIndex': {
      return assertReturn(ClosedPositionResponseCfdOnIndex, position)
    }

    case 'CfdOnStock': {
      return assertReturn(ClosedPositionResponseCfdOnStock, position)
    }

    case 'ContractFutures': {
      return assertReturn(ClosedPositionResponseContractFutures, position)
    }

    case 'Etc': {
      return assertReturn(ClosedPositionResponseEtc, position)
    }

    case 'Etf': {
      return assertReturn(ClosedPositionResponseEtf, position)
    }

    case 'Etn': {
      return assertReturn(ClosedPositionResponseEtn, position)
    }

    case 'Fund': {
      return assertReturn(ClosedPositionResponseFund, position)
    }

    case 'FxSpot': {
      return assertReturn(ClosedPositionResponseFxSpot, position)
    }

    case 'FxForwards': {
      return assertReturn(ClosedPositionResponseFxForwards, position)
    }

    case 'Stock': {
      return assertReturn(ClosedPositionResponseStock, position)
    }

    default: {
      return assertReturn(ClosedPositionResponseUnknown, position)
    }
  }
}
