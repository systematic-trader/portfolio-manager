import {
  type ArgumentType,
  AssertionError,
  assertReturn,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { NetPositionFieldGroup } from '../../types/derives/net-position-field-group.ts'
import {
  NetPositionResponseBond,
  NetPositionResponseCfdOnEtc,
  NetPositionResponseCfdOnEtf,
  NetPositionResponseCfdOnEtn,
  NetPositionResponseCfdOnFund,
  NetPositionResponseCfdOnFutures,
  NetPositionResponseCfdOnIndex,
  NetPositionResponseCfdOnStock,
  NetPositionResponseContractFutures,
  NetPositionResponseEtc,
  NetPositionResponseEtf,
  NetPositionResponseEtn,
  NetPositionResponseFund,
  NetPositionResponseFxForwards,
  NetPositionResponseFxSpot,
  NetPositionResponseStock,
  type NetPositionResponseUnion,
  NetPositionResponseUnknown,
} from '../../types/records/net-position-response.ts'
import type { NetPositionsRequest } from '../../types/records/net-positions-request.ts'

const FieldGroups: NetPositionFieldGroup[] = [
  'DisplayAndFormat',
  'ExchangeInfo',
  'Greeks',
  'NetPositionBase',
  'NetPositionView',
]

export class NetPositions {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/netpositions')
  }

  async *get(
    parameters: ArgumentType<NetPositionsRequest>,
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<NetPositionResponseUnion, void, undefined> {
    const positions = this.#client.getPaginated<NetPositionResponseUnion>({
      searchParams: {
        ...parameters,
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
  position: NetPositionResponseUnion,
): NetPositionResponseUnion {
  switch (position.NetPositionBase.AssetType) {
    case 'Bond': {
      return assertReturn(NetPositionResponseBond, position)
    }

    case 'CfdOnEtc': {
      return assertReturn(NetPositionResponseCfdOnEtc, position)
    }

    case 'CfdOnEtf': {
      return assertReturn(NetPositionResponseCfdOnEtf, position)
    }

    case 'CfdOnEtn': {
      return assertReturn(NetPositionResponseCfdOnEtn, position)
    }

    case 'CfdOnFund': {
      return assertReturn(NetPositionResponseCfdOnFund, position)
    }

    case 'CfdOnFutures': {
      return assertReturn(NetPositionResponseCfdOnFutures, position)
    }

    case 'CfdOnIndex': {
      return assertReturn(NetPositionResponseCfdOnIndex, position)
    }

    case 'CfdOnStock': {
      return assertReturn(NetPositionResponseCfdOnStock, position)
    }

    case 'ContractFutures': {
      return assertReturn(NetPositionResponseContractFutures, position)
    }

    case 'Etc': {
      return assertReturn(NetPositionResponseEtc, position)
    }

    case 'Etf': {
      return assertReturn(NetPositionResponseEtf, position)
    }

    case 'Etn': {
      return assertReturn(NetPositionResponseEtn, position)
    }

    case 'Fund': {
      return assertReturn(NetPositionResponseFund, position)
    }

    case 'FxSpot': {
      return assertReturn(NetPositionResponseFxSpot, position)
    }

    case 'FxForwards': {
      return assertReturn(NetPositionResponseFxForwards, position)
    }

    case 'Stock': {
      return assertReturn(NetPositionResponseStock, position)
    }

    default: {
      return assertReturn(NetPositionResponseUnknown, position)
    }
  }
}
