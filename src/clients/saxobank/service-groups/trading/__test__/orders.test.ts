import { toArray } from '../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'
import { createOrderExternalReference, createOrderRequestId } from '../../../saxobank-random.ts'

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
  } = new TestingUtilities({ app })

  // Some bonds are quite expensive, so we need to set a high balance to be able to place those orders
  beforeEach(() => resetSimulationAccount({ balance: 10_000_000 }))
  afterAll(() => resetSimulationAccount({ balance: 10_000_000 }))

  describe('placing orders using different methods', () => {
    test('Method 1: Placing a single order, with no related orders', async () => {
      const placeOrderResponse = await app.trading.orders.post({
        RequestId: createOrderRequestId(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: createOrderExternalReference(),
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
        RequestId: createOrderRequestId(),

        AssetType: 'FxSpot',
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: amount,
        ManualOrder: false,
        ExternalReference: createOrderExternalReference(),
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
          ExternalReference: createOrderExternalReference(),
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
        RequestId: createOrderRequestId(),

        AssetType: 'FxSpot',
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: amount,
        ManualOrder: false,
        ExternalReference: createOrderExternalReference(),
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
          ExternalReference: createOrderExternalReference(),
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
          ExternalReference: createOrderExternalReference(),
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
        RequestId: createOrderRequestId(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: amount,
        ManualOrder: false,
        ExternalReference: createOrderExternalReference(),
        OrderType: 'Limit',
        OrderPrice: buyLimitOrderPrice,
        OrderDuration: {
          DurationType: 'DayOrder',
        },
      })

      expect(entryOrderResponse).toBeDefined()

      // After this, add a related order to the newly created order
      const relatedOrderResponse = await app.trading.orders.post({
        RequestId: createOrderRequestId(),

        OrderId: entryOrderResponse.OrderId,

        Orders: [{
          AssetType: 'FxSpot',
          Uic: instrument.Uic,
          BuySell: 'Sell',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: createOrderExternalReference(),
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
        RequestId: createOrderRequestId(),

        AssetType: instrument.AssetType,
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: amount,
        ManualOrder: false,
        ExternalReference: createOrderExternalReference(),
        OrderType: 'Limit',
        OrderPrice: buyLimitOrderPrice,
        OrderDuration: {
          DurationType: 'DayOrder',
        },
      })

      expect(entryOrderResponse).toBeDefined()

      // After this, add a related order to the newly created order
      const relatedOrderResponse = await app.trading.orders.post({
        RequestId: createOrderRequestId(),

        OrderId: entryOrderResponse.OrderId,

        Orders: [{
          AssetType: instrument.AssetType,
          Uic: instrument.Uic,
          BuySell: 'Sell',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: createOrderExternalReference(),
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
          ExternalReference: createOrderExternalReference(),
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
        RequestId: createOrderRequestId(),

        Orders: [{
          AssetType: instrument.AssetType,
          Uic: instrument.Uic,
          BuySell: 'Buy',
          Amount: amount,
          ManualOrder: false,
          ExternalReference: createOrderExternalReference(),
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
          ExternalReference: createOrderExternalReference(),
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
        RequestId: createOrderRequestId(),

        AssetType: instrument.AssetType,
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: calculateMinimumTradeSize(instrument),
        ManualOrder: false,
        ExternalReference: createOrderExternalReference(),
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
        RequestId: createOrderRequestId(),

        AssetType: instrument.AssetType,
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: calculateMinimumTradeSize(instrument),
        ManualOrder: false,
        ExternalReference: createOrderExternalReference(),
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
        RequestId: createOrderRequestId(),

        AssetType: instrument.AssetType,
        Uic: instrument.Uic,
        BuySell: 'Buy',
        Amount: calculateMinimumTradeSize(instrument),
        ManualOrder: false,
        ExternalReference: createOrderExternalReference(),
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
              RequestId: createOrderRequestId(),

              AssetType: instrument.AssetType,
              Uic: instrument.Uic,
              BuySell: 'Buy',
              Amount: calculateMinimumTradeSize(instrument),
              ManualOrder: false,
              ExternalReference: createOrderExternalReference(),
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
        RequestId: createOrderRequestId(),

        AssetType: 'FxSpot',
        Uic: 21,
        BuySell: 'Buy',
        Amount: 50_000,
        ManualOrder: false,
        ExternalReference: createOrderExternalReference(),
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
        ExternalReference: createOrderExternalReference(),
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

        ExternalReference: createOrderExternalReference(),
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

        ExternalReference: createOrderExternalReference(),
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
