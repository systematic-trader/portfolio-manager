export type SaxoBankApplicationType = string & keyof typeof SaxoBankApplicationConfig

export const SaxoBankApplicationConfig = {
  Live: {
    authenticationURL: 'https://live.logonvalidation.net',
    websocketConnectURL: 'wss://streaming.saxobank.com/openapi/streamingws/connect',
    websocketReauthorizingURL: 'https://streaming.saxobank.com/openapi/streamingws/authorize',
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
    searchParamsMaxLength: 2048,
  },
  Simulation: {
    authenticationURL: 'https://sim.logonvalidation.net',
    websocketConnectURL: 'wss://streaming.saxobank.com/sim/openapi/streamingws/connect',
    websocketReauthorizingURL: 'https://streaming.saxobank.com/sim/openapi/streamingws/authorize',
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
    searchParamsMaxLength: 2048,
  },
} as const
