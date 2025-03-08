import { Debug } from '../../../utils/debug.ts'
import { Environment } from '../../../utils/environment.ts'
import { describe, expect, test } from '../../../utils/testing.ts'
import { Timeout } from '../../../utils/timeout.ts'
import { InteractiveBrokersClient } from '../client.ts'
import { ExchangeCode } from '../types/derived/exchange-code.ts'

const debug = Debug('test')

// Browse swagger dokumentation:
// Gå til: https://editor.swagger.io/
// Indsæt JSON fra https://api.ibkr.com/gw/api/v3/api-docs
// Klik "Hide" øverst til højre, for at skjule alle fejl

// GENERELLT NOTER
// - Mange endpoints er "ustabile" og returnerer periodisk 503-fejl. Venter man lidt plejer det at virke igen.
// - Der er en exchange med koden "SMART", som betyder at IB selv finder den bedste børs at handle på - jeg er usikker på hvordan det virker med forskellig valuta.
// - Endpoints som eksempelvis contract details returnerer et sparse skema, hvor mange felter er null - eksempelvis "expiry" information for ETF'er. Jeg har tilføjet en coerce i client'en som fjerner null og tomme strings.
// - Der er et race-condition problem med brokerage session (især i test), hvor "logout" skal være helt færdig, inden man prøver at starte en ny session
// - Der er flere youtube videoer her: https://www.interactivebrokers.com/campus/trading-course/ibkrs-client-portal-api/ (nogle er gamle, men giver indblik i mulige værdier for params)
// - For futures og options lyder det til, at der et en bestemt rækkefølge man skal kalde endpoints i - det lyder som om, at de inde bagved vedligeholder nogle streams, som skal sættes op korrekt (og det gør man ved at kalde endpoint i en bestemt rækkefølge) - se https://www.youtube.com/watch?v=1Eqtv4eVAqM (ca 8 min inde)

const CONTRACTS = {
  'IWDA': 100292038,
  'AAPL': 265598,
  'TSLA': 76792991,
  'NOVO.B': 652806383,
}

describe(InteractiveBrokersClient.name, () => {
  test('Getting brokerage session status', async () => {
    // Response ser ud til at ændre sig periodisk
    // Jeg har bare ændret den til "undefined" mens jeg tester

    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const status = await client.iserver.auth.status.post()

    debug(status)

    await Timeout.wait(120_000)

    let seconds = 0

    while (true) {
      await Timeout.wait(10_000)

      seconds += 10

      const status = await client.iserver.auth.status.post()

      debug(status)

      debug('seconds', seconds)

      if (seconds > 350) {
        break
      }
    }
  })

  test('Getting accountds', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const accounts = await client.iserver.accounts.get()
    debug(accounts)
  })

  test('Getting information about exchanges', () => {
    // Det ser ud til, at der ikke er et endpoint specifikt til at hente oplysninger om en børs
    // Jeg skrev til deres support api@interactivebrokers.com og spurgte
    // De henviste mig til https://www.interactivebrokers.com/en/trading/products-exchanges.php#/exchanges
    // Det virker dog til, at listen mangler nogle børser, såsom IBIS2 (der er både en IBIS og en IBIS2)
    // Læg også mærke til at IB bruger deres egne "exchange id'er", som ikke stemmer overens med resten af verden
    // Eksempelvis er den tyske børs Xetra (XETR) kendt i IB som "IBIS" eller "IBIS2" - se https://www.reddit.com/r/interactivebrokers/comments/15rnvvx/ibis_vs_ibis2/

    // Jeg har lavet en enum over de IB exchange id'er jeg har fundet indtil videre + dem der er fra endpointet ovenfor:
    expect(ExchangeCode).toBeDefined()
  })

  test('Finding all available contracts', async () => {
    // Der er ikke et endpoint til "dumt" at finde alle kontrakter/instrumenter
    // Derimod er der et endpoint til at finde et overblik over alle kontrakter på en børs
    // Udfordringen er her, at vi ikke har et komplet overblik over alle børser som IB understøtter
    // Forskellige endpoints returnerer IB's egne "exchange id'er", som vi kan bruge til at udvide vores liste (guard'en)
    // På et tidspunkt, må vi have fundet alle nuværende børser - og om ikke andet, så kan vi tilføje dem manuelt, som det bliver nødvendigt

    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const contracts = await client.trsrv.allConids.get({
      exchange: 'IBIS2', // Xetra (XETR)
      assetClass: 'STK',
    })

    debug('contracts', contracts.slice(0, 8))
    expect(contracts).toBeDefined()

    // iShares Core MSCI World UCITS ETF (EUNL)
    // De bruger nogle interne tickers, som ikke nødvendigvis er det samme som det vi kender dem som
    // Når man slår dem op på https://pennies.interactivebrokers.com/cstools/contract_info/v3.10/index.php, kan man se at de kalder det "local name"
    // Se https://pennies.interactivebrokers.com/cstools/contract_info/v3.10/index.php?action=Conid%20Info&wlId=IB&conid=393119102&lang=en&ib_entity= - scroll ned til "[$exchangeIBIS2]"
    const iwda = contracts.find((candidate) => candidate.ticker === 'IWDA')
    debug('iwda', iwda)
    expect(iwda).toBeDefined()

    // Læg mærke til at "exchange" i IB er sat til Euronext Amsterdam (AEB), selvom vi slog op på Xetra (XETR).
    // ETF'en kan købes begge steder - og faktisk på endnu flere børser.
    // Jeg er ikke sikker på hvorfor der er én "primær" børs.
    // I dette tilfælde, bliver instrumentet også handlet i EUR, men det kunne have været en anden valuta (EUNL handles også i bla. USD og GBP)
    expect(iwda?.exchange).toEqual('AEB')
  })

  test('Finding contracts based on company name or symbol', async () => {
    // I deres dokumentation lægger de op til at det er sådan her man finder kontrakter
    // Men jeg er ikke sikker på om vi kan bruge det til noget
    // Man kan søge efter "symbol" eller "company name"
    // Jeg har ikke skrevet en guard til endpointet - det er ikke klart hvad der returneres$

    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const aaplBySymbol = await client.iserver.secdef.search.post({
      symbol: 'AAPL',
      secType: 'STK',
    })

    debug('AAPL by symbol', aaplBySymbol)
    expect(aaplBySymbol).toBeDefined()

    const aaplByName = await client.iserver.secdef.search.post({
      symbol: 'APPLE INC',
      name: true,
      secType: 'STK',
    })

    debug('AAPL by name', aaplByName)
    expect(aaplByName).toBeDefined()
  })

  test('Getting contract information', async ({ step }) => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    for (const [ticker, contractId] of Object.entries(CONTRACTS)) {
      await step(ticker, async () => {
        const contract = await client.iserver.contract.infoAndRules.get({
          conid: contractId,
        })

        debug(ticker, contract)
        expect(contract).toBeDefined()
      })
    }
  })

  test('Getting security information for contracts', async ({ step }) => {
    // Jeg tror ikke vi skal bruge det her endpoint til noget
    // Det virker til at samme information er tilgængelig via app.iserver.contracts.infoAndRules.get

    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    for (const [ticker, contractId] of Object.entries(CONTRACTS)) {
      await step(ticker, async () => {
        const info = await client.iserver.secdef.info.get({
          conid: contractId,
        })

        debug(ticker, info)
        expect(info).toBeDefined()
      })
    }
  })

  test('Getting trading schedule for a symbol', async () => {
    // Jeg kan ikke finde andre måder at finde åbningstider på
    // Det er meget begrænset - det er mærkeligt, at det er asset-class + symbol som er nødvendig information (og ikke contract id)
    // Angiver man "exchange-filter", så får man kun åbningstider for de udvalgte børser
    // Jeg er ikke sikker på hvad "exchange" er til

    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const aaplSchedule = await client.trsrv.secdef.schedule.get({
      assetClass: 'STK',
      symbol: 'AAPL',
      exchangeFilter: ['NASDAQ'],
    })

    debug(aaplSchedule)
    expect(aaplSchedule).toBeDefined()
  })

  test('Finding contract ids for forex currency pairs', async () => {
    // At finde contracts er meget fragmenteret - sådan her finder man currency pairs
    // Læg mærke til hvordan typerne overhovedet ikke passer med dokumentationen

    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const contracts = await client.iserver.currency.pairs.get({
      currency: ['USD', 'DKK'],
    })

    debug(contracts)
    expect(contracts).toBeDefined()

    const usdcad = contracts['USD'].find((pair) => pair.ccyPair === 'CAD')
    debug('USD/CAD', usdcad)
    expect(usdcad).toBeDefined()

    const eurdkk = contracts['DKK'].find((pair) => pair.ccyPair === 'EUR')
    debug('EUR/DKK', eurdkk)
    expect(eurdkk).toBeDefined()
  })

  test('Finding the current exchange rate between two currencies', async () => {
    // Jeg er ikke sikker på hvilken "rate" der returneres
    // Måske er det den vi kan veksle til på platformen

    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const eurusdRate = await client.iserver.exchangeRate.get({
      source: 'EUR',
      target: 'USD',
    })

    debug('EUR/USD', eurusdRate)
    expect(eurusdRate).toBeDefined()
  })

  test('Getting a market data snapshot', async () => {
    // Kør testen flere gange og læg mærke til hvordan response for de to requests ofte er forskellige
    // Accounts endpointet returnerer ofte undefined - men ikke altid
    // Market data snapshot er meget lignende, men returnere en simpel struktur bestående af "conid" og "updated"
    // Kun hvis nogle felter er ændret, vil de være inkluderet i responsen

    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    // It's required that we call /iserver/accounts first (don't know why - but it's probably so IB can setup some streams behind the scene)
    const accounts = await client.iserver.accounts.get()
    debug('accounts', accounts)

    const fields = [
      '31', // last price
      '55', // symbol
      '58', // "text"
      '70', // high
      '71', // low
      '84', // bid price
      '85', // ask size
      '86', // ask price
      '87', // volume
      '88', // bid size
      '6004', // exchange
      '6070', // The asset class of the instrument.
      '6509', // market data availability (eksempelvis "DPB" som betyder D = delayed, P = snapshot og B = Book)
      '7051', // company name
    ] as const

    let iteration = 0

    while (++iteration <= 100) {
      const snapshot = await client.iserver.marketData.snapshot.get({
        conids: [CONTRACTS['AAPL']], // skift kontrakten ud her med en stock på en børs, som du ved er åben (hvis den er lukket, får du ingen data før de første mange kald)
        fields,
      })

      debug(`snapshot#${iteration}`, snapshot)
      expect(snapshot).toBeDefined()

      await Timeout.wait(15_000)
    }
  })

  test('Getting account funds (balances, margins, etc.)', async () => {
    // Det her endpoint virker kun til at være et "overblik" over vores midler
    // Der er flere endpoints, som har mange flere detaljer (flere end hvad jeg tror vi skal bruge - se eksemplerne på linksne):
    //
    // Summary Of Available Funds:
    // https://www.interactivebrokers.com/campus/ibkr-api-page/webapi-ref/#tag/Trading-Accounts/paths/~1iserver~1account~1%7BaccountId%7D~1summary~1available_funds/get
    //
    // Summary Of Account Balances:
    // https://www.interactivebrokers.com/campus/ibkr-api-page/webapi-ref/#tag/Trading-Accounts/paths/~1iserver~1account~1%7BaccountId%7D~1summary~1balances/get
    //
    // Summary Of Account Margin
    // https://www.interactivebrokers.com/campus/ibkr-api-page/webapi-ref/#tag/Trading-Accounts/paths/~1iserver~1account~1%7BaccountId%7D~1summary~1margins/get
    //
    // Summary Of Account's Market Value
    // https://www.interactivebrokers.com/campus/ibkr-api-page/webapi-ref/#tag/Trading-Accounts/paths/~1iserver~1account~1%7BaccountId%7D~1summary~1market_value/get
    //
    // Fun fact:
    // Ud over at skulle kalde /accounts først, så virker det til at disse endpoint ikke skal "varme op" på samme måde som de andre endpoints

    const accountId = Environment.get('IB_ACCOUNT_ID')

    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    // It's required that we call /iserver/accounts first (don't know why - but it's probably so IB can setup some streams behind the scene)
    const accounts = await client.iserver.accounts.get()
    debug('accounts', accounts)

    const summary = await client.iserver.account.summary.get({
      accountId,
    })
    debug('summary', summary)
    expect(summary).toBeDefined()

    const availableFunds = await client.iserver.account.summary.availableFunds.get({
      accountId,
    })
    debug('available funds', availableFunds)
    expect(availableFunds).toBeDefined()

    const balances = await client.iserver.account.summary.balances.get({
      accountId,
    })
    debug('balances', balances)
    expect(balances).toBeDefined()

    const margins = await client.iserver.account.summary.margins.get({
      accountId,
    })
    debug('margins', margins)
    expect(margins).toBeDefined()

    const marketValue = await client.iserver.account.summary.marketValue.get({
      accountId,
    })
    debug('market value', marketValue)
    expect(marketValue).toBeDefined()
  })

  test('Simulation', async () => {
    // Jeg kan ikke få det til at spille
    // Jeg får http 403-response med html body indeholdende:
    // Access denied for: <min ip>
    // Please contact your administrator with the error code: 0.2468dd58.1739447735.166046db

    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const accounts = await client.iserver.accounts.get()

    debug('accounts', accounts)
    expect(accounts).toBeDefined()
  })

  test.only('market data snapshot', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    while (true) {
      const snapshots = await client.iserver.marketData.snapshot.getByAssetClass({
        assetClass: 'STK',
        conIDs: [CONTRACTS['NOVO.B'], CONTRACTS['AAPL']],
      })

      debug('snapshots', snapshots)

      await Timeout.wait(5_000)
    }
  })

  describe('websocket', () => {
    test('connect', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Live' })

      await client.connect()

      while (true) {
        await client.iserver.marketData.snapshot.get({
          conids: [CONTRACTS['AAPL']],
          fields: [
            '31', // last price
          ],
        })

        await Timeout.wait(5_000)
      }
    })
  })
})
