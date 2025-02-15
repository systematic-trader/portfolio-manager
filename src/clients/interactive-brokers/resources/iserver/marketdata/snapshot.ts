import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'

const Fields = {
  '31': undefined,
  '55': undefined,
  '58': undefined,
  '70': undefined,
  '71': undefined,
  '73': undefined,
  '74': undefined,
  '75': undefined,
  '76': undefined,
  '77': undefined,
  '78': undefined,
  '79': undefined,
  '80': undefined,
  '82': undefined,
  '83': undefined,
  '84': undefined,
  '85': undefined,
  '86': undefined,
  '87': undefined,
  '88': undefined,
  '6004': undefined,
  '6008': undefined,
  '6070': undefined,
  '6072': undefined,
  '6073': undefined,
  '6119': undefined,
  '6457': undefined,
  '6508': undefined,
  '6509': undefined,
  '7051': undefined,
  '7057': undefined,
  '7058': undefined,
  '7059': undefined,
  '7068': undefined,
  '7084': undefined,
  '7085': undefined,
  '7086': undefined,
  '7087': undefined,
  '7088': undefined,
  '7089': undefined,
  '7094': undefined,
  '7184': undefined,
  '7219': undefined,
  '7220': undefined,
  '7221': undefined,
  '7280': undefined,
  '7281': undefined,
  '7282': undefined,
  '7283': undefined,
  '7284': undefined,
  '7285': undefined,
  '7286': undefined,
  '7287': undefined,
  '7288': undefined,
  '7289': undefined,
  '7290': undefined,
  '7291': undefined,
  '7292': undefined,
  '7293': undefined,
  '7294': undefined,
  '7295': undefined,
  '7296': undefined,
  '7308': undefined,
  '7309': undefined,
  '7310': undefined,
  '7311': undefined,
  '7607': undefined,
  '7633': undefined,
  '7635': undefined,
  '7636': undefined,
  '7637': undefined,
  '7638': undefined,
  '7639': undefined,
  '7644': undefined,
  '7655': undefined,
  '7671': undefined,
  '7672': undefined,
  '7674': undefined,
  '7675': undefined,
  '7676': undefined,
  '7677': undefined,
  '7678': undefined,
  '7679': undefined,
  '7724': undefined,
  '7681': undefined,
  '7682': undefined,
  '7683': undefined,
  '7684': undefined,
  '7685': undefined,
  '7686': undefined,
  '7687': undefined,
  '7688': undefined,
  '7689': undefined,
  '7690': undefined,
  '7694': undefined,
  '7695': undefined,
  '7696': undefined,
  '7697': undefined,
  '7698': undefined,
  '7699': undefined,
  '7700': undefined,
  '7702': undefined,
  '7703': undefined,
  '7704': undefined,
  '7705': undefined,
  '7706': undefined,
  '7707': undefined,
  '7708': undefined,
  '7714': undefined,
  '7715': undefined,
  '7718': undefined,
  '7720': undefined,
  '7741': undefined,
  '7762': undefined,
  '7768': undefined,
  '7920': undefined,
  '7921': undefined,
} as const

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
    readonly fields?: undefined | readonly (keyof typeof Fields)[]
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      searchParams: {
        conids: conids.join(','),
        fields: fields?.join(','),
      },
      guard: undefined, // todo implement guard
      signal,
      timeout,
    })
  }
}
