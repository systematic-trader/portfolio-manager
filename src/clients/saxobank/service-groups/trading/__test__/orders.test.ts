import { toArray } from '../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'
import type { InfoPricesParameters } from '../info-prices.ts'

// todo write tests for different order types (can probably be simple entry orders)
// todo write some tests that result in errors (e.g. wrong side of market + wrong duration etc)
// todo test long/short

const MAXIMUM_INSTRUMENTS_PER_ASSET_TYPE = 1

function roundPrice(price: number, tickSize: number): number {
  const rounded = Math.round(price / tickSize) * tickSize
  return parseFloat(rounded.toFixed(10)) // Use toFixed and parseFloat to avoid floating-point precision errors
}

// todo use TickSizeScheme
// todo refactor this to a function that returns both order type and adjusted price, based on a tolerance
async function findSuiteablePrice({ app, assetType, uic, forwardDate }: {
  readonly app: SaxoBankApplication
  readonly assetType: keyof InfoPricesParameters
  readonly uic: number
  readonly delta?: undefined | number
  readonly forwardDate?: undefined | string
}) {
  const infoPrice = await app.trading.infoPrices.get({
    AssetType: assetType,
    Uic: uic,
    ForwardDate: forwardDate,
  })

  const bid = infoPrice.Quote.Bid
  if (bid === undefined) {
    throw new Error(`Could not determine bid price for ${assetType} ${uic}`)
  }

  const ask = infoPrice.Quote.Ask
  if (ask === undefined) {
    throw new Error(`Could not determine ask price for ${assetType} ${uic}`)
  }

  if (assetType !== 'FxSpot' && assetType !== 'FxForwards') {
    throw new Error('Sikke noget!') // todo
  }

  // todo we should acceot this as a parameter
  const [instrument] = await toArray(app.referenceData.instruments.details.get({
    AssetTypes: [assetType],
    Uics: [uic],
  }))
  if (instrument === undefined) {
    throw new Error(`Could not determine instrument for ${assetType} ${uic}`)
  }

  function adjust(basis: 'bid' | 'ask', ticks: number, orderType: 'stop' | 'limit') {
    if (instrument === undefined) {
      throw new Error(`Could not determine instrument for ${assetType} ${uic}`)
    }

    const tickSize = orderType === 'stop'
      ? instrument.TickSizeStopOrder
      : orderType === 'limit'
      ? instrument.TickSizeLimitOrder
      : instrument.TickSize

    const priceBasis = basis === 'bid' ? bid : ask

    if (priceBasis === undefined) {
      throw new Error(`${basis} price is not defined`)
    }

    if (instrument === undefined) {
      throw new Error(`Could not determine instrument for ${assetType} ${uic}`)
    }

    return roundPrice(priceBasis + ticks * tickSize, tickSize)
  }

  return {
    bid,
    ask,
    adjust,
  }
}

describe('trade/orders', () => {
  using app = new SaxoBankApplication({
    type: 'Simulation',
  })

  const {
    calculateMinimumTradeSize,
    getFirstAccount,
    resetSimulationAccount,
    findTradableInstruments,
  } = new TestingUtilities({ app })

  // Some bonds are quite expensive, so we need to set a high balance to be able to place those orders
  beforeEach(() => resetSimulationAccount({ balance: 10_000_000 }))
  afterAll(() => resetSimulationAccount({ balance: 10_000_000 }))

  describe('placing orders using different methods', () => {
    test('Method 1: Placing a single order, with no related orders', async () => {
      const placeOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: crypto.randomUUID(),
        OrderType: 'Market',
        OrderDuration: {
          DurationType: 'DayOrder',
        },
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('Method 2: Placing a single order, with one related order', async () => {
      const price = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: crypto.randomUUID(),
        OrderType: 'Market',
        OrderDuration: {
          DurationType: 'DayOrder',
        },

        Orders: [{
          AssetType: 'FxSpot',
          Uic: 21,
          BuySell: 'Sell',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: crypto.randomUUID(),
          OrderType: 'Limit',
          OrderPrice: price.adjust('ask', 100, 'limit'),
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }],
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('Method 3: Placing a single order, with two related orders', async () => {
      const price = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: crypto.randomUUID(),
        OrderType: 'Market',
        OrderDuration: {
          DurationType: 'DayOrder',
        },

        Orders: [{
          AssetType: 'FxSpot',
          Uic: 21,
          BuySell: 'Sell',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: crypto.randomUUID(),
          OrderType: 'Limit',
          OrderPrice: price.adjust('ask', 20, 'limit'),
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }, {
          AssetType: 'FxSpot',
          Uic: 21,
          BuySell: 'Sell',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: crypto.randomUUID(),
          OrderType: 'Stop',
          OrderPrice: price.adjust('bid', -20, 'stop'),
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }],
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('Method 4: Placing a single related order to an existing order', async () => {
      const price = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      // First, place the initial entry order
      const entryOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: crypto.randomUUID(),
        OrderType: 'Limit',
        OrderPrice: price.adjust('bid', -20, 'limit'),
        OrderDuration: {
          DurationType: 'DayOrder',
        },
      })

      expect(entryOrderResponse).toBeDefined()

      // After this, add a related order to the newly created order
      const relatedOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        OrderId: entryOrderResponse.OrderId,

        Orders: [{
          AssetType: 'FxSpot',
          Uic: 21,
          BuySell: 'Sell',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: crypto.randomUUID(),
          OrderType: 'Limit',
          OrderPrice: price.adjust('ask', 20, 'limit'),
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }],
      })

      expect(relatedOrderResponse).toBeDefined()
    })

    test('Method 5: Placing two related orders to an existing order', async () => {
      const price = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      // First, place the initial entry order
      const entryOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: crypto.randomUUID(),
        OrderType: 'Limit',
        OrderPrice: price.adjust('bid', -20, 'limit'),
        OrderDuration: {
          DurationType: 'DayOrder',
        },
      })

      expect(entryOrderResponse).toBeDefined()

      // After this, add a related order to the newly created order
      const relatedOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        OrderId: entryOrderResponse.OrderId,

        Orders: [{
          AssetType: 'FxSpot',
          Uic: 21,
          BuySell: 'Sell',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: crypto.randomUUID(),
          OrderType: 'Limit',
          OrderPrice: price.adjust('ask', 20, 'limit'),
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }, {
          AssetType: 'FxSpot',
          Uic: 21,
          BuySell: 'Sell',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: crypto.randomUUID(),
          OrderType: 'Stop',
          OrderPrice: price.adjust('bid', -40, 'stop'),
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }],
      })

      expect(relatedOrderResponse).toBeDefined()
    })

    test('Method 6: Placing a single related order to an existing position', async () => {
      // todo implement this
    })

    test('Method 7: Placing two related orders to an existing position', async () => {
      // todo implement this
    })

    test('Method 8: Placing two orders that are OCO (One Cancels Other) orders.', async () => {
      const price = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        Orders: [{
          AssetType: 'FxSpot',
          Uic: 21,
          BuySell: 'Buy',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: crypto.randomUUID(),
          OrderType: 'Limit',
          OrderPrice: price.adjust('bid', -20, 'limit'),
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }, {
          AssetType: 'FxSpot',
          Uic: 21,
          BuySell: 'Buy',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: crypto.randomUUID(),
          OrderType: 'Stop',
          OrderPrice: price.adjust('ask', 20, 'stop'),
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }],
      })

      expect(placeOrderResponse).toBeDefined()
    })
  })

  describe('placing orders with different duration', () => {
    test('AtTheClose', () => {
      // todo I'm unable to find any instruments that support this
    })

    test('AtTheOpening', () => {
      // todo I'm unable to find any instruments that support this
    })

    test('DayOrder', async () => {
      const price = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: crypto.randomUUID(),
        OrderType: 'Limit',
        OrderPrice: price.adjust('ask', 20, 'limit'),
        OrderDuration: {
          DurationType: 'DayOrder',
        },
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('FillOrKill', async () => {
      const placeOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        AssetType: 'Bond',
        Uic: 17642865, // United States of America 1.25% 15 May 2050, USD
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: crypto.randomUUID(),
        OrderType: 'Market',
        OrderDuration: {
          DurationType: 'FillOrKill',
        },
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('GoodForPeriod', () => {
      // todo I'm unable to find any instruments that support this
    })

    test('GoodTillCancel', async () => {
      const price = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: crypto.randomUUID(),
        OrderType: 'Limit',
        OrderPrice: price.adjust('ask', 20, 'limit'),
        OrderDuration: {
          DurationType: 'GoodTillCancel',
        },
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('GoodTillDate', async ({ step }) => {
      const today = new Date()
      const nextYear = today.getFullYear() + 1

      const price = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      const testCases = [
        { ExpirationDateContainsTime: true, ExpirationTime: '00:00' },
        { ExpirationDateContainsTime: true, ExpirationTime: '00:37' },
        { ExpirationDateContainsTime: true, ExpirationTime: '12:00' },
        { ExpirationDateContainsTime: true, ExpirationTime: '12:37' },
        { ExpirationDateContainsTime: true, ExpirationTime: '12:37:00' },
        { ExpirationDateContainsTime: true, ExpirationTime: '12:37:00.000' },
        { ExpirationDateContainsTime: false, ExpirationTime: undefined },
        { ExpirationDateContainsTime: false, ExpirationTime: '00:00' },
        { ExpirationDateContainsTime: false, ExpirationTime: '00:00:00' },
        { ExpirationDateContainsTime: false, ExpirationTime: '00:00:00.000' },
      ] as const

      for (const testCase of testCases) {
        await step(
          `ExpirationDateContainsTime=${testCase.ExpirationDateContainsTime}, ExpirationTime=${testCase.ExpirationTime}`,
          async () => {
            const expirationDate = `${nextYear}-01-01`
            const expirationDateTime = testCase.ExpirationTime === undefined
              ? expirationDate
              : [expirationDate, testCase.ExpirationTime].join('T')

            const placeOrderResponse = await app.trading.orders.post({
              RequestId: crypto.randomUUID(),

              AssetType: 'FxSpot',
              Uic: 21,
              BuySell: 'Buy',
              Amount: 50_000,
              ManualOrder: false,
              ExternalReference: crypto.randomUUID(),
              OrderType: 'Limit',
              OrderPrice: price.adjust('ask', 20, 'limit'),
              OrderDuration: {
                DurationType: 'GoodTillDate',
                ExpirationDateContainsTime: testCase.ExpirationDateContainsTime,
                ExpirationDateTime: expirationDateTime,
              },
            })

            expect(placeOrderResponse).toBeDefined()

            // This works as a "beforeEach" + "afterAll"
            await resetSimulationAccount()
          },
        )
      }
    })

    test('ImmediateOrCancel', async () => {
      // Wait for a bit to avoid "Repeated trade on auto quote"-errors
      await new Promise((resolve) => setTimeout(resolve, 15_000))

      const price = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: crypto.randomUUID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: crypto.randomUUID(),
        OrderType: 'Limit',
        OrderPrice: price.adjust('ask', 20, 'limit'),
        OrderDuration: {
          DurationType: 'ImmediateOrCancel',
        },
      })

      expect(placeOrderResponse).toBeDefined()
    })
  })

  describe.only('placing orders for different asset types', () => {
    // todo is this all?
    const assetTypesToTest = [
      'Bond',
      'CfdOnCompanyWarrant',
      'CfdOnEtc',
      'CfdOnEtf',
      'CfdOnEtn',
      'CfdOnFund',
      'CfdOnFutures',
      'CfdOnIndex',
      'CfdOnRights', // todo there are no instruments of this type
      'CfdOnStock',
      'CompanyWarrant',
      'ContractFutures',
      'Etc',
      'Etf',
      'Etn',
      'Fund',
      // todo 'FuturesOption',
      'FxForwards',
      // todo 'FxNoTouchOption',
      // todo 'FxOneTouchOption',
      'FxSpot',
      'FxSwap', // todo ForwardDateNearLeg is mandatory - ForwardDateFarLeg is mandatory
      // todo 'FxVanillaOption',
      'Rights',
      'Stock',
      // todo 'StockIndexOption',
      // todo 'StockOption',
    ] as const

    // todo remove this
    const whitelist = new Set<typeof assetTypesToTest[number]>(['FxForwards'])

    for (const assetType of assetTypesToTest) {
      if (whitelist.has(assetType) === false) {
        continue
      }

      test(assetType, async ({ step }) => {
        switch (assetType) {
          case 'Bond':
          case 'CfdOnEtc':
          case 'CfdOnCompanyWarrant':
          case 'CfdOnEtf':
          case 'CfdOnEtn':
          case 'CfdOnFund':
          case 'CfdOnFutures':
          case 'CfdOnIndex':
          case 'CfdOnRights':
          case 'CfdOnStock':
          case 'CompanyWarrant':
          case 'ContractFutures':
          case 'Etc':
          case 'Etf':
          case 'Etn':
          case 'FxSpot':
          case 'FxSwap':
          case 'Rights':
          case 'Stock':
          case 'Fund': {
            const instruments = findTradableInstruments({
              assetTypes: [assetType],
              limit: MAXIMUM_INSTRUMENTS_PER_ASSET_TYPE,
            })

            for await (const instrument of instruments) {
              await step(`${instrument.Description} (UIC ${instrument.Uic})`, async () => {
                const placeOrderResponse = await app.trading.orders.post({
                  RequestId: crypto.randomUUID(),

                  AssetType: assetType,
                  Uic: instrument.Uic,
                  BuySell: 'Buy',
                  Amount: calculateMinimumTradeSize(instrument),
                  ManualOrder: false,
                  ExternalReference: crypto.randomUUID(),
                  OrderType: 'Market',
                  OrderDuration: {
                    DurationType: 'DayOrder',
                  },
                })

                expect(placeOrderResponse).toBeDefined()
              })

              await resetSimulationAccount()
            }

            break
          }

          case 'FxForwards': {
            const instruments = findTradableInstruments({
              assetTypes: [assetType],
              limit: MAXIMUM_INSTRUMENTS_PER_ASSET_TYPE,
            })

            for await (const instrument of instruments) {
              await step(`${instrument.Description} (UIC ${instrument.Uic})`, async () => {
                // todo find a way to remove this (repeated trade on auto quote)
                await new Promise((resolve) => setTimeout(resolve, 2000))

                const forwardDate = '2024-11-14'

                const price = await findSuiteablePrice({
                  app,
                  assetType: 'FxForwards',
                  uic: instrument.Uic,
                  forwardDate,
                })

                const [instrumentDetails] = await toArray(app.referenceData.instruments.details.get({
                  AssetTypes: [assetType],
                  Uics: [instrument.Uic],
                }))
                if (instrumentDetails === undefined) {
                  throw new Error(
                    `Could not determine details for ${instrument.Description} (UIC ${instrument.Uic})`,
                  )
                }

                const placeOrderResponse = await app.trading.orders.post({
                  RequestId: crypto.randomUUID(),

                  AssetType: assetType,
                  Uic: instrument.Uic,
                  BuySell: 'Buy',
                  Amount: calculateMinimumTradeSize(instrumentDetails),
                  ManualOrder: false,
                  ExternalReference: crypto.randomUUID(),
                  OrderType: 'Limit',
                  OrderPrice: price.adjust('ask', 20, 'limit'),
                  ForwardDate: forwardDate,
                  OrderDuration: {
                    DurationType: 'ImmediateOrCancel',
                  },
                })

                expect(placeOrderResponse).toBeDefined()
              })

              // todo only do this every few orders to speed things up
              await resetSimulationAccount()
            }

            break
          }

          default: {
            throw new Error('Unsupported asset type')
          }
        }
      })
    }
  })

  describe('cancelling orders', () => {
    test('Deleting order by order id', async () => {
      const { AccountKey } = await getFirstAccount()

      const price = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      const placeOrderResponse = await app.trading.orders.post({
        ManualOrder: false,
        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        OrderType: 'Limit',
        OrderPrice: price.adjust('bid', -200, 'limit'),
        OrderDuration: {
          DurationType: 'DayOrder',
        },
        ExternalReference: crypto.randomUUID(),
      })

      expect(placeOrderResponse).toBeDefined()

      const deleteOrderResponse = await app.trading.orders.delete({
        AccountKey,
        OrderIds: [placeOrderResponse.OrderId],
      })

      expect(deleteOrderResponse).toBeDefined()

      expect(deleteOrderResponse.Orders).toHaveLength(1)
      expect(deleteOrderResponse.Orders[0]?.OrderId).toEqual(placeOrderResponse.OrderId)
    })

    test('Deleting orders by asset type', async () => {
      const [account] = await toArray(app.portfolio.accounts.get())
      if (account === undefined) {
        throw new Error(`Could not determine account for simulation user`)
      }

      const priceEURUSD = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 21,
      })

      const priceEURDKK = await findSuiteablePrice({
        app,
        assetType: 'FxSpot',
        uic: 16,
      })

      const placeEURUSDOrderResponse = await app.trading.orders.post({
        ManualOrder: false,
        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,

        OrderType: 'Limit',
        OrderPrice: priceEURUSD.adjust('bid', -200, 'limit'),
        OrderDuration: {
          DurationType: 'GoodTillCancel',
        },

        ExternalReference: crypto.randomUUID(),
        IsForceOpen: undefined,
      })

      const placeEURDKKOrderResponse = await app.trading.orders.post({
        ManualOrder: false,
        AssetType: 'FxSpot',
        Uic: 16,
        BuySell: 'Buy',
        Amount: 50_000,

        OrderType: 'Limit',
        OrderPrice: priceEURDKK.adjust('bid', -200, 'limit'),
        OrderDuration: {
          DurationType: 'GoodTillCancel',
        },

        ExternalReference: crypto.randomUUID(),
        IsForceOpen: undefined,
      })

      expect(placeEURUSDOrderResponse.OrderId).not.toEqual(placeEURDKKOrderResponse.OrderId)

      const ordersBeforeDeletingOrder = await toArray(app.portfolio.orders.get({
        ClientKey: account.ClientKey,
      }))
      expect(ordersBeforeDeletingOrder).toHaveLength(2)

      const deleteOrderResponse = await app.trading.orders.delete({
        AccountKey: account.AccountKey,
        AssetType: 'FxSpot',
        Uic: 21,
      })

      expect(deleteOrderResponse).toBeUndefined()

      const ordersAfterDeletingOrder = await toArray(app.portfolio.orders.get({
        ClientKey: account.ClientKey,
      }))
      expect(ordersAfterDeletingOrder).toHaveLength(1)
    })
  })
})
