import { open } from 'https://deno.land/x/open@v0.0.6/index.ts'
import * as path from 'jsr:@std/path'

import { toArray } from '../utils/async-iterable.ts'
import { Environment } from '../utils/environment.ts'
import { Timeout } from '../utils/timeout.ts'
import { HTTPClient, HTTPClientError } from './http-client.ts'
import { SaxoBankApplicationConfig, type SaxoBankApplicationType } from './saxobank/config.ts'
import { SaxoBankOpenAuthentication } from './saxobank/oauth.ts'
import { ServiceGroupClient } from './saxobank/service-group-client/service-group-client.ts'
import { SearchParamsMaxLengthExceededError } from './saxobank/service-group-client/service-group-search-params.ts'
import { AccountHistory } from './saxobank/service-groups/account-history.ts'
import { AssetTransfers } from './saxobank/service-groups/asset-transfers.ts'
import { AutoTrading } from './saxobank/service-groups/auto-trading.ts'
import { Chart } from './saxobank/service-groups/chart.ts'
import { ClientManagement } from './saxobank/service-groups/client-management.ts'
import { ClientReporting } from './saxobank/service-groups/client-reporting.ts'
import { ClientServices } from './saxobank/service-groups/client-services.ts'
import { CorporateActions } from './saxobank/service-groups/corporate-actions.ts'
import { DisclaimerManagement } from './saxobank/service-groups/disclaimer-management.ts'
import { EventNotificationServices } from './saxobank/service-groups/event-notification-services.ts'
import { MarketOverview } from './saxobank/service-groups/market-overview.ts'
import { PartnerIntegration } from './saxobank/service-groups/partner-integration.ts'
import { Portfolio } from './saxobank/service-groups/portfolio.ts'
import { ReferenceData } from './saxobank/service-groups/reference-data.ts'
import { RootServices } from './saxobank/service-groups/root-services.ts'
import { Trading } from './saxobank/service-groups/trading.ts'
import { ValueAdd } from './saxobank/service-groups/value-add.ts'

async function openLocalBrowser(url: URL): Promise<void> {
  const childProcess = await open(url.toString())

  childProcess.stderr?.close()
  childProcess.stdout?.close()
  childProcess.stdin?.close()
  childProcess.close()
}

export interface SaxoBankApplicationSettings {
  /** The type of SaxoBank application to use. */
  readonly type?: undefined | SaxoBankApplicationType

  /** The SaxoBank application key. */
  readonly key?: undefined | string

  /** The SaxoBank application secret. */
  readonly secret?: undefined | string

  /** The URL to redirect to after authentication. */
  readonly redirectURL?: undefined | string | URL | {
    /** The public URL to redirect to after authentication. */
    readonly public?: undefined | string | URL
    /** The local listener to use for the redirect URL. The default is the same as the public URL. */
    readonly listener?: undefined | {
      /** The hostname to listen on. */
      readonly hostname?: undefined | string
      /** The port to listen on. */
      readonly port?: undefined | number | string
    }
  }

  readonly authentication?: undefined | {
    /**
     * Whether to keep the application alive by periodically refreshing the access token.
     * The default is `true`.
     */
    readonly refresh?: undefined | boolean

    /**
     * Authentication tokens are stored between sessions.
     * Set to `false` to disable or provide a custom path.
     * The default is to store in the current working directory as `saxobank-authentication.json`.
     */
    readonly store?: undefined | boolean | string
  }

  /** Configuration for the authorization workflow. */
  readonly authorize?: undefined | {
    /**
     * The function to authenticate the application.
     * The default is to open a local browser window.
     */
    readonly handle?: undefined | ((authorizationURL: URL) => void | Promise<void>)

    /**
     * The timeout for the authorization workflow.
     * The default is to wait indefinitely.
     */
    readonly timeout?: undefined | number
  }
}

export class SaxoBankApplication implements Disposable {
  readonly type: SaxoBankApplicationType
  readonly #httpClient: HTTPClient
  readonly #auth: SaxoBankOpenAuthentication

  #refreshAuth: undefined | Timeout<void>

  get auth(): SaxoBankOpenAuthentication {
    return this.#auth
  }

  get http(): HTTPClient {
    return this.#httpClient
  }

  readonly accountHistory: AccountHistory
  readonly assetTransfers: AssetTransfers
  readonly autoTrading: AutoTrading
  readonly chart: Chart
  readonly clientManagement: ClientManagement
  readonly clientReporting: ClientReporting
  readonly clientServices: ClientServices
  readonly corporateActions: CorporateActions
  readonly disclaimerManagement: DisclaimerManagement
  readonly eventNotificationServices: EventNotificationServices
  readonly marketOverview: MarketOverview
  readonly partnerIntegration: PartnerIntegration
  readonly portfolio: Portfolio
  readonly referenceData: ReferenceData
  readonly rootServices: RootServices
  readonly trading: Trading
  readonly valueAdd: ValueAdd

  constructor(settings: undefined | SaxoBankApplicationSettings = {}) {
    const envType = Environment.tryGet('SAXOBANK_APP_TYPE')

    if (envType !== undefined && envType !== 'Live' && envType !== 'Simulation') {
      throw new Error('Invalid SAXOBANK_APP_TYPE environment variable. Must be "Live" or "Simulation"')
    }

    this.type = settings.type ?? envType ?? 'Live'

    const sessionCredentialsPath = settings.authentication?.store === false
      ? undefined
      : settings.authentication?.store === undefined || settings.authentication.store === true
      ? SaxoBankApplicationConfig[this.type].storedAuthenticationFile
      : settings.authentication.store

    const key = settings.key ?? Environment.tryGet(SaxoBankApplicationConfig[this.type].env.key)

    if (key === undefined) {
      throw new Error(
        `No SaxoBank application key provided. Did you forget to set the "${
          SaxoBankApplicationConfig[this.type].env.key
        }" environment variable?`,
      )
    }

    const secret = settings.secret ?? Environment.tryGet(SaxoBankApplicationConfig[this.type].env.secret)

    if (secret === undefined) {
      throw new Error(
        `No SaxoBank application secret provided. Did you forget to set the "${
          SaxoBankApplicationConfig[this.type].env.secret
        }" environment variable?`,
      )
    }

    let redirectURL =
      (settings.redirectURL === undefined
        ? undefined
        : typeof settings.redirectURL === 'string'
        ? settings.redirectURL
        : settings.redirectURL instanceof URL
        ? settings.redirectURL
        : settings.redirectURL.public) ?? Environment.tryGet(SaxoBankApplicationConfig[this.type].env.redirectURL)

    if (redirectURL === undefined) {
      throw new Error(
        `No SaxoBank redirect URL provided. Did you forget to set the "${
          SaxoBankApplicationConfig[this.type].env.redirectURL
        }" environment variable?`,
      )
    }

    redirectURL = new URL(redirectURL)

    if (redirectURL.port === '') {
      redirectURL.port = redirectURL.protocol === 'https:' ? '443' : '80'
    }

    const listenerHostname =
      (settings.redirectURL instanceof URL || typeof settings.redirectURL === 'string'
        ? undefined
        : settings.redirectURL?.listener?.hostname) ??
        Environment.tryGet(SaxoBankApplicationConfig[this.type].env.listenerHostname) ?? redirectURL.hostname

    const listenerPort = Number.parseInt(
      (settings.redirectURL instanceof URL || typeof settings.redirectURL === 'string'
        ? undefined
        : settings.redirectURL?.listener?.port?.toString()) ??
        Environment.tryGet(SaxoBankApplicationConfig[this.type].env.listenerPort) ?? redirectURL.port,
      10,
    )

    if (Number.isSafeInteger(listenerPort) === false || listenerPort < 1 || listenerPort > 65535) {
      throw new Error('Invalid listener port for SaxoBank redirect URL')
    }

    const serviceURL = new URL(SaxoBankApplicationConfig[this.type].serviceURL)

    this.#httpClient = new HTTPClient({
      headers: () => {
        if (this.#auth.accessToken === undefined) {
          return
        }

        return {
          'Authorization': `Bearer ${this.#auth.accessToken}`,
        }
      },
    })

    this.#auth = new SaxoBankOpenAuthentication(this.#httpClient, {
      type: this.type,
      key,
      secret,
      redirectURL,
      listener: {
        hostname: listenerHostname,
        port: listenerPort,
      },
      storedSessionPath: sessionCredentialsPath === undefined
        ? undefined
        : sessionCredentialsPath[0] === '/'
        ? sessionCredentialsPath
        : path.join(Deno.cwd(), sessionCredentialsPath),
      authorize: {
        handle: settings.authorize?.handle ?? openLocalBrowser,
        timeout: settings.authorize?.timeout,
      },
    })

    if (settings.authentication?.refresh ?? true) {
      this.#refreshAuth = Timeout.repeat(SaxoBankApplicationConfig[this.type].refreshTokenTimeout, async (signal) => {
        try {
          await this.#auth.refresh(signal)
        } catch (error) {
          // deno-lint-ignore no-console
          console.error(error)
        }
      })
    }

    const { searchParamsMaxLength } = SaxoBankApplicationConfig[this.type]

    const serviceGroupClient = new ServiceGroupClient({
      client: this.#httpClient,
      serviceURL,
      onError: async (error, retries) => {
        // If the request fails with a 401 status code, initiate authorization.
        // If authorization succeeds, retry the request.
        if (
          retries === 0 &&
          error instanceof HTTPClientError &&
          error.statusCode === 401 &&
          (await this.#auth.authorize()) === true
        ) {
          return
        }

        // When requests uses search parameters that are too long, the server will respond with a http status code of 404 and a HTML body.
        // This diverges from the http specification, but is confirmed to be intentional by the OpenAPI support.
        // We cannot recover from this error - but due to the counter-intuitive response code, we map the error to a more specific one.
        //
        // Please note that specific endpoint will, correctly, respond with http status code 404 as a part of their normal operation.
        // A key difference here is that the response body will be either empty or JSON.
        // This is the key difference that allows us to distinguish between the search parameter error and normal operations.
        if (
          error instanceof HTTPClientError &&
          error.statusCode === 404 &&
          error.headers['content-type'] === 'text/html'
        ) {
          const { searchParams } = new URL(error.href)
          throw new SearchParamsMaxLengthExceededError(searchParams, searchParamsMaxLength)
        }

        throw error
      },
      searchParamsMaxLength,
    })

    this.accountHistory = new AccountHistory({ client: serviceGroupClient })
    this.assetTransfers = new AssetTransfers({ client: serviceGroupClient })
    this.autoTrading = new AutoTrading({ client: serviceGroupClient })
    this.chart = new Chart({ client: serviceGroupClient })
    this.clientManagement = new ClientManagement({ client: serviceGroupClient })
    this.clientReporting = new ClientReporting({ client: serviceGroupClient })
    this.clientServices = new ClientServices({ client: serviceGroupClient })
    this.corporateActions = new CorporateActions({ client: serviceGroupClient })
    this.disclaimerManagement = new DisclaimerManagement({ client: serviceGroupClient })
    this.eventNotificationServices = new EventNotificationServices({ client: serviceGroupClient })
    this.marketOverview = new MarketOverview({ client: serviceGroupClient })
    this.partnerIntegration = new PartnerIntegration({ client: serviceGroupClient })
    this.portfolio = new Portfolio({ client: serviceGroupClient })
    this.referenceData = new ReferenceData({ client: serviceGroupClient })
    this.rootServices = new RootServices({ client: serviceGroupClient })
    this.trading = new Trading({ client: serviceGroupClient })
    this.valueAdd = new ValueAdd({ client: serviceGroupClient })
  }

  [Symbol.dispose](): void {
    this.dispose()
  }

  dispose(): void {
    this.#refreshAuth?.abort()
    this.#refreshAuth = undefined
  }

  /**
   * Reset the account in simulation mode.
   *
   * @param accountKey The account key to reset. If not provided, the first account will be reset.
   * @param balance The new balance for the account. The default is 10,000,000.
   */
  async resetSimulationAccount({
    accountKey,
    balance = 10_000_000,
  }: {
    readonly accountKey?: undefined | string
    readonly balance?: undefined | number
  } = {}): Promise<void> {
    if (this.type !== 'Simulation') {
      throw new Error('Cannot reset account in non-simulation mode')
    }

    if (accountKey === undefined) {
      const [account] = await toArray(this.portfolio.accounts.get())

      if (account === undefined) {
        throw new Error('No accounts returned from portfolio endpoint')
      }

      accountKey = account.AccountKey
    }

    await this.portfolio.accounts.account.reset.put({
      AccountKey: accountKey,
      NewBalance: balance,
    })
  }
}
