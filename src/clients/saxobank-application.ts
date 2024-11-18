import { open } from 'https://deno.land/x/open@v0.0.6/index.ts'
import * as path from 'jsr:@std/path'

import { Environment } from '../utils/environment.ts'
import { Timeout } from '../utils/timeout.ts'
import { HTTPClient, HTTPClientError } from './http-client.ts'
import { OpenAuthentication } from './saxobank/oauth.ts'
import { ServiceGroupClient } from './saxobank/service-group-client.ts'
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

const Config = {
  Live: {
    authenticationURL: 'https://live.logonvalidation.net',
    serviceURL: 'https://gateway.saxobank.com/openapi',
    refreshTokenTimeout: 60_000,
    storedAuthenticationFile: 'saxobank-authentication.json',
    env: {
      key: 'SAXOBANK_LIVE_APP_KEY',
      secret: 'SAXOBANK_LIVE_APP_SECRET',
      redirectURL: 'SAXOBANK_LIVE_APP_REDIRECT_URL',
      listenerHostname: 'SAXOBANK_LIVE_APP_REDIRECT_LISTENER_HOSTNAME',
      listenerPort: 'SAXOBANK_LIVE_APP_REDIRECT_LISTENER_PORT',
    },
  },
  Simulation: {
    authenticationURL: 'https://sim.logonvalidation.net',
    serviceURL: 'https://gateway.saxobank.com/sim/openapi',
    refreshTokenTimeout: 60_000,
    storedAuthenticationFile: 'saxobank-authentication.json',
    env: {
      key: 'SAXOBANK_SIM_APP_KEY',
      secret: 'SAXOBANK_SIM_APP_SECRET',
      redirectURL: 'SAXOBANK_SIM_APP_REDIRECT_URL',
      listenerHostname: 'SAXOBANK_SIM_APP_REDIRECT_LISTENER_HOSTNAME',
      listenerPort: 'SAXOBANK_SIM_APP_REDIRECT_LISTENER_PORT',
    },
  },
} as const

async function openLocalBrowser(url: URL): Promise<void> {
  const childProcess = await open(url.toString())

  childProcess.stderr?.close()
  childProcess.stdout?.close()
  childProcess.stdin?.close()
  childProcess.close()
}

type SaxoBankApplicationType = string & keyof typeof Config

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
  readonly #httpClient: HTTPClient
  readonly #auth: OpenAuthentication

  #refreshAuth: undefined | Timeout<void>

  get http(): HTTPClient {
    return this.#httpClient
  }

  readonly type: SaxoBankApplicationType

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
    const envType = Environment['SAXOBANK_APP_TYPE']

    if (envType !== undefined && envType !== 'Live' && envType !== 'Simulation') {
      throw new Error('Invalid SAXOBANK_APP_TYPE environment variable. Must be "Live" or "Simulation"')
    }

    this.type = settings.type ?? envType ?? 'Live'

    const sessionCredentialsPath = settings.authentication?.store === false
      ? undefined
      : settings.authentication?.store === undefined || settings.authentication.store === true
      ? Config[this.type].storedAuthenticationFile
      : settings.authentication.store

    const authenticationURL = new URL(Config[this.type].authenticationURL)

    const key = settings.key ?? Environment[Config[this.type].env.key]

    if (key === undefined) {
      throw new Error(
        `No SaxoBank application key provided. Did you forget to set the "${
          Config[this.type].env.key
        }" environment variable?`,
      )
    }

    const secret = settings.secret ?? Environment[Config[this.type].env.secret]

    if (secret === undefined) {
      throw new Error(
        `No SaxoBank application secret provided. Did you forget to set the "${
          Config[this.type].env.secret
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
        : settings.redirectURL.public) ?? Environment[Config[this.type].env.redirectURL]

    if (redirectURL === undefined) {
      throw new Error(
        `No SaxoBank redirect URL provided. Did you forget to set the "${
          Config[this.type].env.redirectURL
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
        Environment[Config[this.type].env.listenerHostname] ?? redirectURL.hostname

    const listenerPort = Number.parseInt(
      (settings.redirectURL instanceof URL || typeof settings.redirectURL === 'string'
        ? undefined
        : settings.redirectURL?.listener?.port?.toString()) ??
        Environment[Config[this.type].env.listenerPort] ?? redirectURL.port,
      10,
    )

    if (Number.isSafeInteger(listenerPort) === false || listenerPort < 1 || listenerPort > 65535) {
      throw new Error('Invalid listener port for SaxoBank redirect URL')
    }

    const serviceURL = new URL(Config[this.type].serviceURL)

    this.#httpClient = new HTTPClient({
      headers: async () => {
        const accessToken = await this.#auth.getAccessToken()

        return accessToken === undefined ? undefined : {
          'Authorization': `Bearer ${accessToken}`,
        }
      },
    })

    this.#auth = new OpenAuthentication(this.#httpClient, {
      authenticationURL,
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
      this.#refreshAuth = Timeout.repeat(Config[this.type].refreshTokenTimeout, async (signal) => {
        try {
          await this.#auth.refresh(signal)
        } catch (error) {
          this.#refreshAuth?.abort(error)
        }
      })
    }

    const serviceGroupClient = new ServiceGroupClient({
      client: this.#httpClient,
      serviceURL,
      onError: async (error, retries) => {
        if (retries === 0 && error instanceof HTTPClientError && error.statusCode === 401) {
          const isAuthorized = await this.#auth.authorize()

          if (isAuthorized === true) {
            return
          }
        }

        throw error
      },
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
}
