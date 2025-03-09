import {
  array,
  AssertionError,
  coerce,
  record,
  string,
  unknown,
  validate,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { CombinedSignalController } from '../../../../../utils/signal.ts'
import { Timeout } from '../../../../../utils/timeout.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type { AssetClass } from '../../../types/derived/asset-class.ts'
import { Snapshot as SnapshotType, SnapshotFields } from '../../../types/record/snapshot.ts'

export class Snapshot {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('snapshot')
  }

  /**
   * Get Market Data for the given conid(s).
   * A pre-flight request must be made prior to ever receiving data.
   * For some fields, it may take more than a few moments to receive information.
   * See response fields for a list of available fields that can be request via fields argument.
   * The endpoint /iserver/accounts must be called prior to /iserver/marketdata/snapshot.
   * For derivative contracts the endpoint /iserver/secdef/search must be called first.
   */
  async get({ conids, fields }: {
    readonly conids: readonly (string | number)[]
    readonly fields?: undefined | readonly (string | number)[]
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<ReadonlyArray<Record<string, unknown>>> {
    return await this.#client.get({
      searchParams: {
        conids: conids.join(','),
        fields: fields?.join(','),
      },
      guard: array(record(string(), unknown())),
      signal,
      timeout,
    })
  }

  async getByAssetClass<T extends Extract<AssetClass, 'STK'>, const ConIDs extends readonly number[]>(
    options: {
      readonly assetClass: T
      readonly conIDs: ConIDs
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
    },
  ): Promise<{ readonly [Index in keyof ConIDs]: SnapshotType[T] }> {
    using timeout = options.timeout === undefined ? undefined : Timeout.wait(options.timeout)
    using controller = options.signal === undefined && timeout === undefined ? undefined : new CombinedSignalController(
      options.signal,
      timeout?.signal,
    )

    const fields = Object.keys(SnapshotFields[options.assetClass])
    const guard = SnapshotType[options.assetClass]
    const coerceSnapshot = coerce(guard)
    const validateSnapshot = validate(guard)

    while (true) {
      const snapshots = await this.get({
        conids: options.conIDs,
        fields: fields,
      }, {
        signal: controller?.signal,
      })

      const coercedSnapshots = snapshots.map(coerceSnapshot) as Array<SnapshotType[T]>

      let valid = true

      for (const snapshot of coercedSnapshots) {
        const invalidations = validateSnapshot(snapshot)

        if (invalidations.length === 0) {
          continue
        }

        const invalidAssetClass = invalidations.filter((invalidation) => {
          return invalidation.path.length === 1 &&
            invalidation.path[0] === '6070' &&
            invalidation.rule === 'logical' &&
            invalidation.function === 'equals' &&
            typeof invalidation.setting === 'string'
        })[0]?.setting as undefined | string

        if (invalidAssetClass !== undefined && invalidAssetClass !== options.assetClass) {
          throw new Error(`Expected asset class "${options.assetClass}" but got "${invalidAssetClass}".`)
        }

        if (invalidations.some((invalidation) => invalidation.rule === 'type' && invalidation.actual !== 'undefined')) {
          throw new AssertionError(invalidations, snapshot)
        }

        valid = false
        break
      }

      if (valid) {
        return options.conIDs.map((conID) => {
          const found = coercedSnapshots.find((snapshot) => snapshot.conid === conID)

          if (found === undefined) {
            throw new Error(`Snapshot not found for conid ${conID}.`)
          }

          return found
        }) as { readonly [Index in keyof ConIDs]: SnapshotType[T] }
      }

      await Timeout.wait(500)
    }
  }
}
