import { toArray } from '../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'
import { SaxoBankRandom } from '../../../saxobank-random.ts'

describe('trade/orders', () => {
  using app = new SaxoBankApplication({
    type: 'Simulation',
  })

  const {
    calculateMinimumTradeSize,
    getFirstAccount,
    resetSimulationAccount,
    findTradableInstruments,
    calculateFavourableOrderPrice,
    placeFavourableOrder,
    roundPriceToInstrumentSpecification,
    waitForPortfolioState,
  } = new TestingUtilities({ app })

  // Some bonds are quite expensive, so we need to set a high balance to be able to place those orders
  beforeEach(() => resetSimulationAccount({ balance: 10_000_000 }))
  afterAll(() => resetSimulationAccount({ balance: 10_000_000 }))

  describe('placing orders using different methods', () => {
    test('Method 1: Placing a single order, with no related orders', async () => {
      const placeOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: SaxoBankRandom.orderID(),
        OrderType: 'Market',
        OrderDuration: {
          DurationType: 'DayOrder',
        },
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('Method 2: Placing a single order, with one related order', async () => {
      const [record] = await toArray(findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      }))

      if (record === undefined) {
        throw new Error('FxSpot UIC 21 is not tradable')
      }

      const { instrument, quote } = record
      const { orderPrice: limitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Sell',
        orderType: 'Limit',
      })

      const amount = calculateMinimumTradeSize(instrument)

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        AssetType: 'FxSpot',
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: amount,
        ManualOrder: false,
        ExternalReference: SaxoBankRandom.orderID(),
        OrderType: 'Market',
        OrderDuration: {
          DurationType: 'DayOrder',
        },

        Orders: [{
          AssetType: 'FxSpot',
          Uic: instrument.Uic,
          BuySell: 'Sell',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Limit',
          OrderPrice: limitOrderPrice,
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }],
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('Method 3: Placing a single order, with two related orders', async () => {
      const [record] = await toArray(findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      }))

      if (record === undefined) {
        throw new Error('FxSpot UIC 21 is not tradable')
      }

      const { instrument, quote } = record

      const { orderPrice: sellLimitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Sell',
        orderType: 'Limit',
      })
      const { orderPrice: sellStopOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Sell',
        orderType: 'Stop',
      })

      const amount = calculateMinimumTradeSize(instrument)

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        AssetType: 'FxSpot',
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: amount,
        ManualOrder: false,
        ExternalReference: SaxoBankRandom.orderID(),
        OrderType: 'Market',
        OrderDuration: {
          DurationType: 'DayOrder',
        },

        Orders: [{
          AssetType: 'FxSpot',
          Uic: instrument.Uic,
          BuySell: 'Sell',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Limit',
          OrderPrice: sellLimitOrderPrice,
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }, {
          AssetType: 'FxSpot',
          Uic: instrument.Uic,
          BuySell: 'Sell',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Stop',
          OrderPrice: sellStopOrderPrice,
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }],
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('Method 4: Placing a single related order to an existing order', async () => {
      const [record] = await toArray(findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      }))

      if (record === undefined) {
        throw new Error('FxSpot UIC 21 is not tradable')
      }

      const { instrument, quote } = record
      const { orderPrice: buyLimitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Buy',
        orderType: 'Limit',
      })
      const { orderPrice: sellLimitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Sell',
        orderType: 'Limit',
      })

      const amount = calculateMinimumTradeSize(instrument)

      // First, place the initial entry order
      const entryOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: amount,
        ManualOrder: false,
        ExternalReference: SaxoBankRandom.orderID(),
        OrderType: 'Limit',
        OrderPrice: buyLimitOrderPrice,
        OrderDuration: {
          DurationType: 'DayOrder',
        },
      })

      expect(entryOrderResponse).toBeDefined()

      // After this, add a related order to the newly created order
      const relatedOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        OrderId: entryOrderResponse.OrderId,

        Orders: [{
          AssetType: 'FxSpot',
          Uic: instrument.Uic,
          BuySell: 'Sell',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Limit',
          OrderPrice: sellLimitOrderPrice,
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }],
      })

      expect(relatedOrderResponse).toBeDefined()
    })

    test('Method 5: Placing two related orders to an existing order', async () => {
      const [record] = await toArray(findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      }))

      if (record === undefined) {
        throw new Error('FxSpot UIC 21 is not tradable')
      }

      const { instrument, quote } = record
      const { orderPrice: buyLimitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Buy',
        orderType: 'Limit',
      })
      const { orderPrice: sellLimitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Sell',
        orderType: 'Limit',
        tolerance: 0.01,
      })
      const { orderPrice: sellStopOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Sell',
        orderType: 'Stop',
        tolerance: 0.02,
      })

      const amount = calculateMinimumTradeSize(instrument)

      // First, place the initial entry order
      const entryOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        AssetType: instrument.AssetType,
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: amount,
        ManualOrder: false,
        ExternalReference: SaxoBankRandom.orderID(),
        OrderType: 'Limit',
        OrderPrice: buyLimitOrderPrice,
        OrderDuration: {
          DurationType: 'DayOrder',
        },
      })

      expect(entryOrderResponse).toBeDefined()

      // After this, add a related order to the newly created order
      const relatedOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        OrderId: entryOrderResponse.OrderId,

        Orders: [{
          AssetType: instrument.AssetType,
          Uic: instrument.Uic,
          BuySell: 'Sell',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Limit',
          OrderPrice: sellLimitOrderPrice,
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }, {
          AssetType: instrument.AssetType,
          Uic: instrument.Uic,
          BuySell: 'Sell',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Stop',
          OrderPrice: sellStopOrderPrice,
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }],
      })

      expect(relatedOrderResponse).toBeDefined()
    })

    test('Method 6: Placing a single related order to an existing position', async () => {
      // not implemented
    })

    test('Method 7: Placing two related orders to an existing position', async () => {
      // not implemented
    })

    test('Method 8: Placing two orders that are OCO (One Cancels Other) orders.', async () => {
      const [record] = await toArray(findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      }))

      if (record === undefined) {
        throw new Error('FxSpot UIC 21 is not tradable')
      }

      const { instrument, quote } = record
      const { orderPrice: limitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Buy',
        orderType: 'Limit',
      })
      const { orderPrice: stopOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Buy',
        orderType: 'Stop',
      })

      const amount = calculateMinimumTradeSize(instrument)

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        Orders: [{
          AssetType: instrument.AssetType,
          Uic: instrument.Uic,
          BuySell: 'Buy',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Limit',
          OrderPrice: limitOrderPrice,
          OrderDuration: {
            DurationType: 'GoodTillCancel',
          },
        }, {
          AssetType: instrument.AssetType,
          Uic: instrument.Uic,
          BuySell: 'Buy',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Stop',
          OrderPrice: stopOrderPrice,
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
      // There are no instruments that support this on sim
    })

    test('AtTheOpening', () => {
      // There are no instruments that support this on sim
    })

    test('DayOrder', async () => {
      const [record] = await toArray(findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      }))

      if (record === undefined) {
        throw new Error('FxSpot UIC 21 is not tradable')
      }

      const { instrument, quote } = record
      const { orderPrice: limitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Buy',
        orderType: 'Limit',
      })

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        AssetType: instrument.AssetType,
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: calculateMinimumTradeSize(instrument),
        ManualOrder: false,
        ExternalReference: SaxoBankRandom.orderID(),
        OrderType: 'Limit',
        OrderPrice: limitOrderPrice,
        OrderDuration: {
          DurationType: 'DayOrder',
        },
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('FillOrKill', async () => {
      const [record] = await toArray(findTradableInstruments({
        assetType: 'Bond',
        limit: 1,
      }))

      if (record === undefined) {
        throw new Error('Could not find any tradable bond')
      }

      const { instrument } = record

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        AssetType: instrument.AssetType,
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: calculateMinimumTradeSize(instrument),
        ManualOrder: false,
        ExternalReference: SaxoBankRandom.orderID(),
        OrderType: 'Market',
        OrderDuration: {
          DurationType: 'FillOrKill',
        },
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('GoodForPeriod', () => {
      // There are no instruments that support this on sim
    })

    test('GoodTillCancel', async () => {
      const [record] = await toArray(findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      }))

      if (record === undefined) {
        throw new Error('FxSpot UIC 21 is not tradable')
      }

      const { instrument, quote } = record
      const { orderPrice: limitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Buy',
        orderType: 'Limit',
      })

      const placeOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        AssetType: instrument.AssetType,
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: calculateMinimumTradeSize(instrument),
        ManualOrder: false,
        ExternalReference: SaxoBankRandom.orderID(),
        OrderType: 'Limit',
        OrderPrice: limitOrderPrice,
        OrderDuration: {
          DurationType: 'GoodTillCancel',
        },
      })

      expect(placeOrderResponse).toBeDefined()
    })

    test('GoodTillDate', async ({ step }) => {
      const today = new Date()
      const nextYear = today.getFullYear() + 1

      const [record] = await toArray(findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      }))

      if (record === undefined) {
        throw new Error('FxSpot UIC 21 is not tradable')
      }

      const { instrument, quote } = record
      const { orderPrice: limitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Buy',
        orderType: 'Limit',
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
              RequestId: SaxoBankRandom.requestID(),

              AssetType: instrument.AssetType,
              Uic: instrument.Uic,
              BuySell: 'Buy',
              Amount: calculateMinimumTradeSize(instrument),
              ManualOrder: false,
              ExternalReference: SaxoBankRandom.orderID(),
              OrderType: 'Limit',
              OrderPrice: limitOrderPrice,
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
      const placeOrderResponse = await app.trading.orders.post({
        RequestId: SaxoBankRandom.requestID(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: SaxoBankRandom.orderID(),
        OrderType: 'Market',
        OrderDuration: {
          DurationType: 'ImmediateOrCancel',
        },
      })

      expect(placeOrderResponse).toBeDefined()
    })
  })

  describe('placing orders for different asset types', () => {
    const assetTypesToTest = [
      'Bond',
      'CfdOnEtc',
      'CfdOnEtf',
      'CfdOnEtn',
      'CfdOnFund',
      'CfdOnFutures',
      'CfdOnIndex',
      'CfdOnStock',
      'ContractFutures',
      'Etc',
      'Etf',
      'Etn',
      'Fund',
      'FxForwards',
      'FxSpot',
      'Stock',
    ] as const

    for (const assetType of assetTypesToTest) {
      test(assetType, async () => {
        const limit = 1

        await resetSimulationAccount()

        const tradableInstruments = findTradableInstruments({
          assetType,
          limit,
        })

        for await (const { instrument, quote } of tradableInstruments) {
          const placeOrderResponse = await placeFavourableOrder({
            instrument,
            buySell: 'Buy',
            orderType: 'Market',
            quote,
          })

          expect(placeOrderResponse).toBeDefined()
        }
      })
    }
  })

  describe('updating orders', () => {
    test('Method 1: Updating a single order, with no related orders', async ({ step }) => {
      const { AccountKey } = await getFirstAccount()

      const instruments = findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      })

      for await (const { instrument, quote } of instruments) {
        const { orderPrice } = calculateFavourableOrderPrice({
          buySell: 'Buy',
          instrument,
          quote,
          orderType: 'Limit',
          tolerance: 0.05,
        })

        const placeOrderResponse = await app.trading.orders.post({
          RequestId: SaxoBankRandom.requestID(),
          AccountKey,
          AssetType: 'FxSpot',
          Uic: instrument.Uic,
          BuySell: 'Buy',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Limit',
          OrderPrice: orderPrice,
          OrderDuration: {
            DurationType: 'DayOrder',
          },
        })

        expect(placeOrderResponse).toBeDefined()

        const updateBase = {
          get RequestId() {
            return SaxoBankRandom.requestID()
          },
          AccountKey,
          AssetType: 'FxSpot',
          OrderId: placeOrderResponse.OrderId,
          OrderType: 'Limit',
          OrderPrice: orderPrice,
          OrderDuration: {
            DurationType: 'DayOrder',
          },
        } as const

        await step('Amount', async () => {
          const updateOrderResponse = await app.trading.orders.patch({
            ...updateBase,
            Amount: 100_000,
          })

          expect(updateOrderResponse).toBeDefined()
        })

        await step('OrderDuration', async () => {
          const updateOrderResponse = await app.trading.orders.patch({
            ...updateBase,
            OrderDuration: {
              DurationType: 'GoodTillCancel',
            },
          })

          expect(updateOrderResponse).toBeDefined()
        })

        await step('OrderPrice', async () => {
          const { orderPrice } = calculateFavourableOrderPrice({
            buySell: 'Buy',
            instrument,
            quote,
            orderType: 'Limit',
            tolerance: 0.03,
          })

          const updateOrderResponse = await app.trading.orders.patch({
            ...updateBase,
            OrderPrice: orderPrice,
          })

          expect(updateOrderResponse).toBeDefined()
        })

        await step('OrderType', async () => {
          const updateOrderResponse = await app.trading.orders.patch({
            ...updateBase,
            OrderType: 'Market',
            OrderPrice: undefined,
          })

          expect(updateOrderResponse).toBeDefined()
        })
      }
    })

    test('Method 2: Updating a single order, with 1 related order', async ({ step }) => {
      const { AccountKey } = await getFirstAccount()

      const instruments = findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      })

      for await (const { instrument, quote } of instruments) {
        const { orderPrice: orderPriceEntry } = calculateFavourableOrderPrice({
          instrument,
          quote,
          buySell: 'Buy',
          orderType: 'Limit',
          tolerance: 0.02,
        })

        const { orderPrice: orderPriceTakeProfit } = calculateFavourableOrderPrice({
          instrument,
          quote,
          buySell: 'Sell',
          orderType: 'Limit',
          tolerance: 0.04,
        })

        const placeOrderResponse = await app.trading.orders.post({
          RequestId: SaxoBankRandom.requestID(),

          AssetType: 'FxSpot',
          Uic: instrument.Uic,
          BuySell: 'Buy',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Limit',
          OrderPrice: orderPriceEntry,
          OrderDuration: {
            DurationType: 'DayOrder',
          },

          Orders: [{
            AssetType: 'FxSpot',
            Uic: instrument.Uic,
            BuySell: 'Sell',
            Amount: 50_000,
            ManualOrder: false,
            ExternalReference: SaxoBankRandom.orderID(),
            OrderType: 'Limit',
            OrderPrice: orderPriceTakeProfit,
            OrderDuration: {
              DurationType: 'GoodTillCancel',
            },
          }],
        })

        expect(placeOrderResponse).toBeDefined()

        const baseOrderId = placeOrderResponse.OrderId
        const takeProfitOrderId = placeOrderResponse.Orders[0].OrderId

        const entryOrderUpdate = {
          get RequestId() {
            return SaxoBankRandom.requestID()
          },
          AccountKey,
          AssetType: 'FxSpot',
          OrderId: baseOrderId,
          OrderType: 'Limit',
          OrderPrice: orderPriceEntry,
          OrderDuration: {
            DurationType: 'DayOrder',
          },
        } as const

        const takeProfitOrderUpdate = {
          AccountKey,
          OrderId: takeProfitOrderId,
          AssetType: 'FxSpot',
          OrderType: 'Limit',
          OrderPrice: orderPriceTakeProfit,
          OrderDuration: {
            DurationType: 'DayOrder',
          },
        } as const

        await step('Amount', async () => {
          const updateOrderResponse = await app.trading.orders.patch({
            ...entryOrderUpdate,
            Amount: 100_000,

            Orders: [{
              ...takeProfitOrderUpdate,
              Amount: 100_000,
            }],
          })

          expect(updateOrderResponse).toBeDefined()
        })

        await step('OrderDuration', async () => {
          const updateOrderResponse = await app.trading.orders.patch({
            ...entryOrderUpdate,
            OrderDuration: {
              DurationType: 'GoodTillCancel',
            },

            Orders: [{
              ...takeProfitOrderUpdate,
              OrderDuration: {
                DurationType: 'GoodTillCancel',
              },
            }],
          })

          expect(updateOrderResponse).toBeDefined()
        })

        await step('OrderPrice', async () => {
          const { orderPrice: orderPriceEntry } = calculateFavourableOrderPrice({
            buySell: 'Buy',
            instrument,
            quote,
            orderType: 'Limit',
            tolerance: 0.03,
          })

          const { orderPrice: orderPriceTakeProfit } = calculateFavourableOrderPrice({
            buySell: 'Sell',
            instrument,
            quote,
            orderType: 'Limit',
            tolerance: 0.06,
          })

          const updateOrderResponse = await app.trading.orders.patch({
            ...entryOrderUpdate,
            OrderPrice: orderPriceEntry,

            Orders: [{
              ...takeProfitOrderUpdate,
              OrderPrice: orderPriceTakeProfit,
            }],
          })

          expect(updateOrderResponse).toBeDefined()
        })

        await step('OrderType', async () => {
          const updateOrderResponse = await app.trading.orders.patch({
            ...entryOrderUpdate,
            OrderType: 'Market',
            OrderPrice: undefined,

            Orders: [{
              ...takeProfitOrderUpdate,
              OrderType: 'Market',
              OrderPrice: undefined,
            }],
          })

          expect(updateOrderResponse).toBeDefined()
        })
      }
    })

    test('Method 3: Updating a single order, with 2 related order', async ({ step }) => {
      const { AccountKey } = await getFirstAccount()

      const instruments = findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      })

      for await (const { instrument, quote } of instruments) {
        const { orderPrice: orderPriceEntry } = calculateFavourableOrderPrice({
          instrument,
          quote,
          buySell: 'Buy',
          orderType: 'Limit',
          tolerance: 0.02,
        })

        const { orderPrice: orderPriceTakeProfit } = calculateFavourableOrderPrice({
          instrument,
          quote,
          buySell: 'Sell',
          orderType: 'Limit',
          tolerance: 0.04,
        })

        const { orderPrice: orderPriceStopLoss } = calculateFavourableOrderPrice({
          instrument,
          quote,
          buySell: 'Sell',
          orderType: 'Stop',
          tolerance: 0.04,
        })

        const placeOrderResponse = await app.trading.orders.post({
          RequestId: SaxoBankRandom.requestID(),

          AssetType: 'FxSpot',
          Uic: instrument.Uic,
          BuySell: 'Buy',
          Amount: 50_000,
          ManualOrder: false,
          ExternalReference: SaxoBankRandom.orderID(),
          OrderType: 'Limit',
          OrderPrice: orderPriceEntry,
          OrderDuration: {
            DurationType: 'DayOrder',
          },

          Orders: [{
            AssetType: 'FxSpot',
            Uic: instrument.Uic,
            BuySell: 'Sell',
            Amount: 50_000,
            ManualOrder: false,
            ExternalReference: SaxoBankRandom.orderID(),
            OrderType: 'Limit',
            OrderPrice: orderPriceTakeProfit,
            OrderDuration: {
              DurationType: 'GoodTillCancel',
            },
          }, {
            AssetType: 'FxSpot',
            Uic: instrument.Uic,
            BuySell: 'Sell',
            Amount: 50_000,
            ManualOrder: false,
            ExternalReference: SaxoBankRandom.orderID(),
            OrderType: 'Stop',
            OrderPrice: orderPriceStopLoss,
            OrderDuration: {
              DurationType: 'GoodTillCancel',
            },
          }],
        })

        expect(placeOrderResponse).toBeDefined()

        const baseOrderId = placeOrderResponse.OrderId
        const takeProfitOrderId = placeOrderResponse.Orders[0].OrderId

        const entryOrderUpdate = {
          get RequestId() {
            return SaxoBankRandom.requestID()
          },
          AccountKey,
          AssetType: 'FxSpot',
          OrderId: baseOrderId,
          OrderType: 'Limit',
          OrderPrice: orderPriceEntry,
          OrderDuration: {
            DurationType: 'DayOrder',
          },
        } as const

        const takeProfitOrderUpdate = {
          AccountKey,
          OrderId: takeProfitOrderId,
          AssetType: 'FxSpot',
          OrderType: 'Limit',
          OrderPrice: orderPriceTakeProfit,
          OrderDuration: {
            DurationType: 'DayOrder',
          },
        } as const

        const stopLossOrderUpdate = {
          AccountKey,
          OrderId: takeProfitOrderId,
          AssetType: 'FxSpot',
          OrderType: 'Limit',
          OrderPrice: orderPriceTakeProfit,
          OrderDuration: {
            DurationType: 'DayOrder',
          },
        } as const

        await step('Amount', async () => {
          const updateOrderResponse = await app.trading.orders.patch({
            ...entryOrderUpdate,
            Amount: 100_000,

            Orders: [{
              ...takeProfitOrderUpdate,
              Amount: 100_000,
            }, {
              ...stopLossOrderUpdate,
              Amount: 100_000,
            }],
          })

          expect(updateOrderResponse).toBeDefined()
        })

        await step('OrderDuration', async () => {
          const updateOrderResponse = await app.trading.orders.patch({
            ...entryOrderUpdate,
            OrderDuration: {
              DurationType: 'GoodTillCancel',
            },

            Orders: [{
              ...takeProfitOrderUpdate,
              OrderDuration: {
                DurationType: 'GoodTillCancel',
              },
            }, {
              ...stopLossOrderUpdate,
              OrderDuration: {
                DurationType: 'GoodTillCancel',
              },
            }],
          })

          expect(updateOrderResponse).toBeDefined()
        })

        await step('OrderPrice', async () => {
          const { orderPrice: orderPriceEntry } = calculateFavourableOrderPrice({
            buySell: 'Buy',
            instrument,
            quote,
            orderType: 'Limit',
            tolerance: 0.03,
          })

          const { orderPrice: orderPriceTakeProfit } = calculateFavourableOrderPrice({
            buySell: 'Sell',
            instrument,
            quote,
            orderType: 'Limit',
            tolerance: 0.06,
          })

          const { orderPrice: orderPriceStopLoss } = calculateFavourableOrderPrice({
            buySell: 'Sell',
            instrument,
            quote,
            orderType: 'Stop',
            tolerance: -0.06,
          })

          const updateOrderResponse = await app.trading.orders.patch({
            ...entryOrderUpdate,
            OrderPrice: orderPriceEntry,

            Orders: [{
              ...takeProfitOrderUpdate,
              OrderPrice: orderPriceTakeProfit,
            }, {
              ...stopLossOrderUpdate,
              OrderPrice: orderPriceStopLoss,
            }],
          })

          expect(updateOrderResponse).toBeDefined()
        })

        await step('OrderType', async () => {
          const updateOrderResponse = await app.trading.orders.patch({
            ...entryOrderUpdate,
            OrderType: 'Market',
            OrderPrice: undefined,
            Orders: [takeProfitOrderUpdate, stopLossOrderUpdate],
          })

          expect(updateOrderResponse).toBeDefined()
        })
      }
    })
  })

  describe('cancelling orders', () => {
    test('Deleting order by order id', async () => {
      const { AccountKey } = await getFirstAccount()

      const [record] = await toArray(findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21],
        limit: 1,
      }))

      if (record === undefined) {
        throw new Error('FxSpot UIC 21 is not tradable')
      }

      const { instrument, quote } = record
      const { orderPrice: limitOrderPrice } = calculateFavourableOrderPrice({
        instrument,
        quote,
        buySell: 'Buy',
        orderType: 'Limit',
      })

      const placeOrderResponse = await app.trading.orders.post({
        ManualOrder: false,
        AssetType: 'FxSpot',
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: calculateMinimumTradeSize(instrument),
        OrderType: 'Limit',
        OrderPrice: limitOrderPrice,
        OrderDuration: { DurationType: 'DayOrder' },
        ExternalReference: SaxoBankRandom.orderID(),
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

      const records = await toArray(findTradableInstruments({
        assetType: 'FxSpot',
        uics: [21, 16],
      }))

      const eurusdRecord = records.find((candidate) => candidate.instrument.Uic === 21)
      if (eurusdRecord === undefined) {
        throw new Error('FxSpot UIC 21 is not tradable')
      }

      const eurdkkRecord = records.find((candidate) => candidate.instrument.Uic === 16)
      if (eurdkkRecord === undefined) {
        throw new Error('FxSpot UIC 16 is not tradable')
      }

      const { orderPrice: eurusdOrderPrice } = calculateFavourableOrderPrice({
        instrument: eurusdRecord.instrument,
        quote: eurusdRecord.quote,
        buySell: 'Buy',
        orderType: 'Limit',
      })

      const { orderPrice: eurdkkOrderPrice } = calculateFavourableOrderPrice({
        instrument: eurusdRecord.instrument,
        quote: eurusdRecord.quote,
        buySell: 'Buy',
        orderType: 'Limit',
      })

      const placeEURUSDOrderResponse = await app.trading.orders.post({
        ManualOrder: false,
        AssetType: 'FxSpot',
        Uic: eurusdRecord.instrument.Uic,
        BuySell: 'Buy',
        Amount: calculateMinimumTradeSize(eurusdRecord.instrument),

        OrderType: 'Limit',
        OrderPrice: eurusdOrderPrice,
        OrderDuration: {
          DurationType: 'GoodTillCancel',
        },

        ExternalReference: SaxoBankRandom.orderID(),
        IsForceOpen: undefined,
      })

      const placeEURDKKOrderResponse = await app.trading.orders.post({
        ManualOrder: false,
        AssetType: 'FxSpot',
        Uic: eurdkkRecord.instrument.Uic,
        BuySell: 'Buy',
        Amount: calculateMinimumTradeSize(eurdkkRecord.instrument),

        OrderType: 'Limit',
        OrderPrice: eurdkkOrderPrice,
        OrderDuration: {
          DurationType: 'GoodTillCancel',
        },

        ExternalReference: SaxoBankRandom.orderID(),
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

    test('Deleting orders for non-existing uics', async () => {
      const { AccountKey } = await getFirstAccount()

      const response = await app.trading.orders.delete({
        AccountKey,
        AssetType: 'FxSpot',
        Uic: 21123123, // non-existing UIC
      })

      expect(response).toEqual({
        ErrorInfo: {
          ErrorCode: 'IllegalInstrumentId',
          Message: 'Instrument ID is invalid',
        },
      })
    })

    test('Deleting non-existing order by id', async () => {
      const { AccountKey } = await getFirstAccount()

      const nonExistingOrderId = '123123' // must be numeric - otherwise, another different error ("OtherError") is returned

      const response = await app.trading.orders.delete({
        AccountKey,
        OrderIds: [
          nonExistingOrderId,
        ],
      })

      expect(response).toEqual({
        Orders: [
          {
            OrderId: nonExistingOrderId,
            ErrorInfo: {
              ErrorCode: 'OrderNotFound',
              Message: 'Requested order ID was not found',
            },
          },
        ],
      })
    })

    test('Deleting a non-existing order by id alongside existing orders', async ({ step }) => {
      const { AccountKey } = await getFirstAccount()

      const instruments = findTradableInstruments({
        assetType: 'Stock',
        sessions: ['Closed'], // We don't want the order to be filled (we need to be able to cancel it)
        limit: 1,
      })

      for await (const { instrument, quote } of instruments) {
        await step(instrument.Description, async () => {
          const placeOrderResponse = await placeFavourableOrder({
            instrument,
            quote,
            buySell: 'Buy',
            orderType: 'Limit',
          })

          const placedOrderId = placeOrderResponse.OrderId
          const nonExistingOrderId = '123123' // must be numeric - otherwise, another different error ("OtherError") is returned

          const response = await app.trading.orders.delete({
            AccountKey,
            OrderIds: [
              placedOrderId,
              nonExistingOrderId,
            ],
          })

          expect(response).toEqual({
            Orders: [
              { OrderId: placedOrderId },
              {
                OrderId: nonExistingOrderId,
                ErrorInfo: {
                  ErrorCode: 'OrderNotFound',
                  Message: 'Requested order ID was not found',
                },
              },
            ],
          })
        })
      }
    })

    /**
     * This test is a bit more complex, since it tests a few different scenarios
     * Based on this test we learn:
     * - Order cancellation happens in the order of the provided order ids
     * - If one order fails to cancel (e.g. "ErrorInfo" is defined), the rest of the orders are not cancelled
     * - This happens even if the order could be considered as "cancelled", e.g. by never existing
     */
    test('Deleting orders with related exit-orders should happen in the correct order', async ({ step }) => {
      const { AccountKey } = await getFirstAccount()

      const instruments = findTradableInstruments({
        assetType: 'Stock',
        sessions: ['Closed'], // We don't want the order to be filled (we need to be able to cancel it)
        limit: 1,
      })

      for await (const { instrument, quote } of instruments) {
        // deno-lint-ignore no-inner-declarations
        async function placeTestOrders(): Promise<{
          readonly placedEntryOrderId: string
          readonly placedTakeProfitOrderId: string
          readonly placedStopLossOrderId: string
        }> {
          const placeOrderResponse = await app.trading.orders.post({
            RequestId: SaxoBankRandom.requestID(),
            AssetType: instrument.AssetType,
            Uic: instrument.Uic,
            BuySell: 'Buy',
            Amount: calculateMinimumTradeSize(instrument),
            OrderType: 'Market',
            ExternalReference: 'entry',
            ManualOrder: false,
            OrderDuration: { DurationType: 'DayOrder' },
            Orders: [
              // Take profit
              {
                AssetType: instrument.AssetType,
                Uic: instrument.Uic,
                BuySell: 'Sell',
                Amount: calculateMinimumTradeSize(instrument),
                OrderType: 'Limit',
                OrderPrice: roundPriceToInstrumentSpecification({ instrument, price: quote.Mid * 1.05 }).price,
                OrderDuration: { DurationType: 'GoodTillCancel' },
                ExternalReference: 'take-profit',
                ManualOrder: false,
              },

              // Stop loss
              {
                AssetType: instrument.AssetType,
                Uic: instrument.Uic,
                BuySell: 'Sell',
                Amount: calculateMinimumTradeSize(instrument),
                OrderType: 'StopIfTraded',
                OrderPrice: roundPriceToInstrumentSpecification({ instrument, price: quote.Mid * 0.95 }).price,
                OrderDuration: { DurationType: 'GoodTillCancel' },
                ExternalReference: 'stop-loss',
                ManualOrder: false,
              },
            ],
          })

          const placedEntryOrderId = placeOrderResponse.OrderId
          const placedTakeProfitOrderId = placeOrderResponse.Orders[0].OrderId
          const placedStopLossOrderId = placeOrderResponse.Orders[1].OrderId

          return {
            placedEntryOrderId,
            placedTakeProfitOrderId,
            placedStopLossOrderId,
          }
        }

        await step(instrument.Description, async ({ step }) => {
          const nonExistingOrderId = '123123' // must be numeric - otherwise, another different error ("OtherError") is returned

          await step('Non existing -> Root -> Related', async () => {
            await resetSimulationAccount()
            const { placedEntryOrderId, placedStopLossOrderId, placedTakeProfitOrderId } = await placeTestOrders()

            const response = await app.trading.orders.delete({
              AccountKey,
              OrderIds: [
                nonExistingOrderId,
                placedEntryOrderId,
                placedTakeProfitOrderId,
                placedStopLossOrderId,
              ],
            })

            expect(response).toEqual({
              Orders: [
                {
                  ErrorInfo: {
                    ErrorCode: 'OrderNotFound',
                    Message: 'Requested order ID was not found',
                  },
                  OrderId: nonExistingOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'None',
                    Message: 'Cancellation of another order failed',
                  },
                  OrderId: placedEntryOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'None',
                    Message: 'Cancellation of another order failed',
                  },
                  OrderId: placedTakeProfitOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'None',
                    Message: 'Cancellation of another order failed',
                  },
                  OrderId: placedStopLossOrderId,
                },
              ],
            })
          })

          await step('Root -> Non existing -> Related', async () => {
            await resetSimulationAccount()
            const { placedEntryOrderId, placedStopLossOrderId, placedTakeProfitOrderId } = await placeTestOrders()

            const response = await app.trading.orders.delete({
              AccountKey,
              OrderIds: [
                placedEntryOrderId,
                nonExistingOrderId,
                placedTakeProfitOrderId,
                placedStopLossOrderId,
              ],
            })

            expect(response).toEqual({
              Orders: [
                {
                  OrderId: placedEntryOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'OrderNotFound',
                    Message: 'Requested order ID was not found',
                  },
                  OrderId: nonExistingOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'None',
                    Message: 'Cancellation of another order failed',
                  },
                  OrderId: placedTakeProfitOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'None',
                    Message: 'Cancellation of another order failed',
                  },
                  OrderId: placedStopLossOrderId,
                },
              ],
            })
          })

          await step('Root -> Related -> Non existing', async () => {
            await resetSimulationAccount()
            const { placedEntryOrderId, placedStopLossOrderId, placedTakeProfitOrderId } = await placeTestOrders()

            const response = await app.trading.orders.delete({
              AccountKey,
              OrderIds: [
                placedEntryOrderId,
                placedTakeProfitOrderId,
                placedStopLossOrderId,
                nonExistingOrderId,
              ],
            })

            expect(response).toEqual({
              Orders: [
                {
                  OrderId: placedEntryOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'TooLateToCancelOrder',
                    Message: 'It is too late to cancel this order',
                  },
                  OrderId: placedTakeProfitOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'None',
                    Message: 'Cancellation of another order failed',
                  },
                  OrderId: placedStopLossOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'None',
                    Message: 'Cancellation of another order failed',
                  },
                  OrderId: nonExistingOrderId,
                },
              ],
            })
          })

          await step('Related -> Root -> Non existing', async () => {
            await resetSimulationAccount()
            const { placedEntryOrderId, placedStopLossOrderId, placedTakeProfitOrderId } = await placeTestOrders()

            const response = await app.trading.orders.delete({
              AccountKey,
              OrderIds: [
                placedTakeProfitOrderId,
                placedStopLossOrderId,
                placedEntryOrderId,
                nonExistingOrderId,
              ],
            })

            expect(response).toEqual({
              Orders: [
                {
                  OrderId: placedTakeProfitOrderId,
                },
                {
                  OrderId: placedStopLossOrderId,
                },
                {
                  OrderId: placedEntryOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'OrderNotFound',
                    Message: 'Requested order ID was not found',
                  },
                  OrderId: nonExistingOrderId,
                },
              ],
            })
          })

          await step('Non existing -> Related -> Root', async () => {
            await resetSimulationAccount()
            const { placedEntryOrderId, placedStopLossOrderId, placedTakeProfitOrderId } = await placeTestOrders()

            const response = await app.trading.orders.delete({
              AccountKey,
              OrderIds: [
                nonExistingOrderId,
                placedTakeProfitOrderId,
                placedStopLossOrderId,
                placedEntryOrderId,
              ],
            })

            expect(response).toEqual({
              Orders: [
                {
                  ErrorInfo: {
                    ErrorCode: 'OrderNotFound',
                    Message: 'Requested order ID was not found',
                  },
                  OrderId: nonExistingOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'None',
                    Message: 'Cancellation of another order failed',
                  },
                  OrderId: placedTakeProfitOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'None',
                    Message: 'Cancellation of another order failed',
                  },
                  OrderId: placedStopLossOrderId,
                },
                {
                  ErrorInfo: {
                    ErrorCode: 'None',
                    Message: 'Cancellation of another order failed',
                  },
                  OrderId: placedEntryOrderId,
                },
              ],
            })
          })
        })
      }
    })

    test('Deleting an order right after it has been filled', async ({ step }) => {
      const { AccountKey } = await getFirstAccount()

      const instruments = findTradableInstruments({
        assetType: 'FxSpot',
        sessions: ['AutomatedTrading'], // We want the order to be filled
        limit: 1,
      })

      for await (const { instrument, quote } of instruments) {
        await step(instrument.Description, async () => {
          await resetSimulationAccount()

          const placeOrderResponse = await placeFavourableOrder({
            instrument,
            quote,
            buySell: 'Buy',
            orderType: 'Market',
          })

          const placedEntryOrderId = placeOrderResponse.OrderId

          await waitForPortfolioState({
            orders: ['=', 0],
            positions: ['=', 1],
            timeout: 5000,
          })

          const response = await app.trading.orders.delete({
            AccountKey,
            OrderIds: [placedEntryOrderId],
          })

          expect(response).toEqual({
            Orders: [
              {
                ErrorInfo: {
                  ErrorCode: 'OrderNotFound',
                  Message: 'Requested order ID was not found',
                },
                OrderId: placedEntryOrderId,
              },
            ],
          })
        })
      }
    })
  })
})
