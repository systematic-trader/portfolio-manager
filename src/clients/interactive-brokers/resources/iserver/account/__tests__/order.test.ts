import { Debug } from '../../../../../../utils/debug.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { Timeout } from '../../../../../../utils/timeout.ts'
import { InteractiveBrokersClient } from '../../../../client.ts'
import type {
  OrderPlacementParametersCurrencyConversion,
  OrderPlacementParametersExistingRootDouble,
  OrderPlacementParametersExistingRootSingle,
  OrderPlacementParametersRootWithOneAttached,
  OrderPlacementParametersRootWithTwoAttached,
  OrderPlacementParametersSingle,
} from '../orders.ts'

const debug = Debug('test')

const CONTRACTS = {
  'IWDA': 100292038,
  'AAPL': 265598,
  'TSLA': 76792991,
  'NOVO.B': 652806383,
  'ES@20270617': 649180661, // 17/06/2027
  'EUR.DKK': 39394687,
  "US-T Govt Bond STRIPS Interest 0.0 May15'48": 317483224,
}

// todo check if we have enough funds to do what we need to do in the test
// todo make a test showing what happens when we're converting from something we don't have

describe('iserver/account/order', () => {
  describe('currency conversion', () => {
    test('DKK -> EUR -> DKK', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['EUR.DKK']

      const ledger = await client.portfolio.account.ledger.get()
      debug('ledger dkk', ledger.DKK)

      const toEURResponse = await client.iserver.account.orders.post(
        {
          orders: [
            {
              isCcyConv: true,
              orderType: 'MKT',
              side: 'BUY',
              cOID: `test-order-${Math.random()}`,
              conidex: `${contractId}@SMART`,
              fxQty: 500, // in dkk
              manualIndicator: false,
              tif: 'DAY',
            },
          ],
        } satisfies OrderPlacementParametersCurrencyConversion,
      )

      debug('dkk -> eur response', toEURResponse)
      expect(toEURResponse).toBeDefined()

      await Timeout.wait(5000)

      const toDKKResponse = await client.iserver.account.orders.post(
        {
          orders: [{
            isCcyConv: true,
            orderType: 'MKT',
            side: 'SELL',
            cOID: `test-order-${Math.random()}`,
            conidex: `${contractId}@SMART`,
            fxQty: 450, // still in dkk (a bit less to account for 2 USD in conversion fees - which will be deduced in the account base currency)
            manualIndicator: false,
            tif: 'DAY',
          }],
        } satisfies OrderPlacementParametersCurrencyConversion,
      )

      debug('eur -> dkk response', toDKKResponse)
      expect(toDKKResponse).toBeDefined()
    })

    // it's not possible to place multiple currency conversion orders at the same time
    test.skip('2x DKK -> EUR', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const ledgerBefore = await client.portfolio.account.ledger.get()
      if (ledgerBefore.BASE === undefined || ledgerBefore.DKK === undefined || ledgerBefore.EUR === undefined) {
        throw new Error('Ledger before is undefined')
      }

      const contractId = CONTRACTS['EUR.DKK']

      const toEURResponse = await client.iserver.account.orders.post({
        orders: [{
          isCcyConv: true,
          orderType: 'MKT',
          side: 'BUY',
          cOID: `test-order-${Math.random()}`,
          conidex: `${contractId}@SMART`,
          fxQty: 500, // in dkk
          manualIndicator: false,
          tif: 'DAY',
        }, {
          isCcyConv: true,
          orderType: 'MKT',
          side: 'BUY',
          cOID: `test-order-${Math.random()}`,
          conidex: `${contractId}@SMART`,
          fxQty: 500, // in dkk
          manualIndicator: false,
          tif: 'DAY',
        }] as never,
      })

      debug('dkk -> eur response', toEURResponse)
      expect(toEURResponse).toBeDefined()

      await Timeout.wait(5000) // wait a bit for the orders to be filled

      const ledgerAfter = await client.portfolio.account.ledger.get()
      if (ledgerAfter.BASE === undefined || ledgerAfter.DKK === undefined || ledgerAfter.EUR === undefined) {
        throw new Error('Ledger after is undefined')
      }

      debug('ledger before', {
        BASE: ledgerBefore.BASE.cashbalance,
        DKK: ledgerBefore.DKK.cashbalance,
        EUR: ledgerBefore.EUR.cashbalance,
      })

      debug('ledger after', {
        BASE: ledgerAfter.BASE.cashbalance,
        DKK: ledgerAfter.DKK.cashbalance,
        EUR: ledgerAfter.EUR.cashbalance,
      })

      debug('ledger difference', {
        BASE: ledgerAfter.BASE.cashbalance - ledgerBefore.BASE.cashbalance,
        DKK: ledgerAfter.DKK.cashbalance - ledgerBefore.DKK.cashbalance,
        EUR: ledgerAfter.EUR.cashbalance - ledgerBefore.EUR.cashbalance,
      })
    })
  })

  describe('bond', () => {
    test('placing a market order', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            cOID: `test-order-${Math.random()}`,
            conidex: `${CONTRACTS["US-T Govt Bond STRIPS Interest 0.0 May15'48"]}@SMART`,
            manualIndicator: false,
            orderType: 'MKT',
            quantity: 1,
            side: 'BUY',
            tif: 'DAY',
          }],
        } satisfies OrderPlacementParametersSingle,
      )
      debug('response', response)
      expect(response).toBeDefined()
    })
  })

  describe('placing single entry order', () => {
    test('limit', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'LMT',
            price: 200, // current price for apple is around 240 - adjust this if needed
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('limit on close', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'LOC',
            price: 200, // current price for apple is around 240 - adjust this if needed
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('market', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'MKT',
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            outsideRth: true,
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('market on close', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'MOC',
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('midprice', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'MIDPRICE',
            price: 200, // current price for apple is around 240 - adjust this if needed
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('stop', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'STP',
            price: 200, // current price for apple is around 240 - adjust this if needed
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('stop limit', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'STOP_LIMIT',
            // current price for apple is around 240 - adjust this if needed
            price: 300, // limit price
            auxPrice: 200, // stop price
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('trailing stop (percentage)', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'TRAIL',
            price: 200, // current price for apple is around 240 - adjust this if needed
            trailingAmt: 5,
            trailingType: '%',
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('trailing stop (amount)', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'TRAIL',
            price: 200, // current price for apple is around 240 - adjust this if needed
            trailingAmt: 5,
            trailingType: 'amt',
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('trailing stop limit', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'TRAILLMT',
            // current price for apple is around 240 - adjust this if needed
            price: 250, // limit price
            auxPrice: 230, // stop price
            trailingAmt: 5,
            trailingType: '%',
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('all or none', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'LMT',
            price: 200,
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            allOrNone: true, // <--
            cOID: `test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })
  })

  describe('placing a single exit order', () => {
    test('market', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['NOVO.B']

      const entryResponse = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'MKT',
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            outsideRth: true,
            cOID: `entry-test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('entry response', entryResponse)
      expect(entryResponse).toBeDefined()

      // wait a bit for the order to be filled
      await Timeout.wait(15000)

      const exitResponse = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'MKT',
            side: 'SELL',
            tif: 'DAY',
            quantity: 1,
            outsideRth: true,
            cOID: `exit-test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('exit response', exitResponse)
      expect(exitResponse).toBeDefined()
    })
  })

  describe('placing a new root-order with attached orders', () => {
    test('one leg (take profit)', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [
            // Entry order
            {
              conidex: `${contractId}@SMART`,
              manualIndicator: false,
              orderType: 'LMT',
              price: 200, // Entry limit price - below current market
              side: 'BUY',
              tif: 'DAY',
              quantity: 1,
              cOID: `entry-test-order-${Math.random()}`,
              isSingleGroup: true,
            },

            // Take profit order
            {
              conidex: `${contractId}@SMART`,
              manualIndicator: false,
              orderType: 'LMT',
              price: 220, // Take profit price - above entry price
              side: 'SELL',
              tif: 'GTC', // Good till cancelled since this is a take profit
              quantity: 1,
              cOID: `take-profit-test-order-${Math.random()}`,
              isSingleGroup: true,
            },
          ],
        } satisfies OrderPlacementParametersRootWithOneAttached,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('one leg (stop loss)', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [
            // Entry order
            {
              conidex: `${contractId}@SMART`,
              manualIndicator: false,
              orderType: 'LMT',
              price: 200, // Entry limit price - below current market
              side: 'BUY',
              tif: 'DAY',
              quantity: 1,
              cOID: `entry-test-order-${Math.random()}`,
              isSingleGroup: true,
            },
            // Stop loss order
            {
              conidex: `${contractId}@SMART`,
              manualIndicator: false,
              orderType: 'STP',
              price: 190, // Stop loss price - below entry price
              side: 'SELL',
              tif: 'GTC', // Good till cancelled since this is a stop loss
              quantity: 1,
              cOID: `stop-loss-test-order-${Math.random()}`,
              isSingleGroup: true,
            },
          ],
        } satisfies OrderPlacementParametersRootWithOneAttached,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })

    test('two legs (take profit + stop loss)', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          orders: [
            // Entry order
            {
              conidex: `${contractId}@SMART`,
              manualIndicator: false,
              orderType: 'LMT',
              price: 200, // Entry limit price - below current market
              side: 'BUY',
              tif: 'DAY',
              quantity: 1,
              cOID: `entry-test-order-${Math.random()}`,
              isSingleGroup: true,
            },
            // Take profit order
            {
              conidex: `${contractId}@SMART`,
              manualIndicator: false,
              orderType: 'LMT',
              price: 220, // Take profit price - above entry price
              side: 'SELL',
              tif: 'GTC',
              quantity: 1,
              cOID: `take-profit-test-order-${Math.random()}`,
              isSingleGroup: true,
            },
            // Stop loss order
            {
              conidex: `${contractId}@SMART`,
              manualIndicator: false,
              orderType: 'STP',
              price: 190, // Stop loss price - below entry price
              side: 'SELL',
              tif: 'GTC',
              quantity: 1,
              cOID: `stop-loss-test-order-${Math.random()}`,
              isSingleGroup: true,
            },
          ],
        } satisfies OrderPlacementParametersRootWithTwoAttached,
      )

      debug('response', response)
      expect(response).toBeDefined()
    })
  })

  describe('placing attached orders to existing root order', () => {
    test('one leg (take profit)', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      // Place root entry order
      const entryResponse = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'LMT',
            price: 200, // Entry limit price - below current market
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `entry-test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      if ('error' in entryResponse) {
        throw new Error('Could not place entry order')
      }

      debug('entry response', entryResponse)
      expect(entryResponse).toBeDefined()

      const parentOrderId = entryResponse[0].order_id

      // Attach take profit order
      const attachedResponse = await client.iserver.account.orders.post(
        {
          parentOrderId,
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'LMT',
            price: 220, // Take profit price - above entry price
            side: 'SELL',
            tif: 'GTC',
            quantity: 1,
            cOID: `take-profit-test-order-${Math.random()}`,
            isSingleGroup: true,
          }],
        } satisfies OrderPlacementParametersExistingRootSingle,
      )

      debug('attached response', attachedResponse)
      expect(attachedResponse).toBeDefined()
    })

    test('one leg (stop loss)', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      // Place root entry order
      const entryResponse = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'LMT',
            price: 200, // Entry limit price - below current market
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `entry-test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('entry response', entryResponse)
      expect(entryResponse).toBeDefined()

      if (!Array.isArray(entryResponse) || !('order_id' in entryResponse[0])) {
        throw new Error('Invalid entry response')
      }

      const parentOrderId = entryResponse[0].order_id

      // Attach stop loss order
      const attachedResponse = await client.iserver.account.orders.post(
        {
          parentOrderId,
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'STP',
            price: 190, // Stop loss price - below entry price
            side: 'SELL',
            tif: 'GTC',
            quantity: 1,
            cOID: `stop-loss-test-order-${Math.random()}`,
            isSingleGroup: true,
          }],
        } satisfies OrderPlacementParametersExistingRootSingle,
      )

      debug('attached response', attachedResponse)
      expect(attachedResponse).toBeDefined()
    })

    test('two legs (take profit + stop loss)', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']

      // Place root entry order
      const entryResponse = await client.iserver.account.orders.post(
        {
          orders: [{
            conidex: `${contractId}@SMART`,
            manualIndicator: false,
            orderType: 'LMT',
            price: 200, // Entry limit price - below current market
            side: 'BUY',
            tif: 'DAY',
            quantity: 1,
            cOID: `entry-test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      debug('entry response', entryResponse)
      expect(entryResponse).toBeDefined()

      if (!Array.isArray(entryResponse) || !('order_id' in entryResponse[0])) {
        throw new Error('Invalid entry response')
      }

      const parentOrderId = entryResponse[0].order_id

      // Attach both take profit and stop loss orders
      const attachedResponse = await client.iserver.account.orders.post(
        {
          parentOrderId,
          orders: [
            {
              conidex: `${contractId}@SMART`,
              manualIndicator: false,
              orderType: 'LMT',
              price: 220, // Take profit price - above entry price
              side: 'SELL',
              tif: 'GTC',
              quantity: 1,
              cOID: `take-profit-test-order-${Math.random()}`,
              isSingleGroup: true,
            },
            {
              conidex: `${contractId}@SMART`,
              manualIndicator: false,
              orderType: 'STP',
              price: 190, // Stop loss price - below entry price
              side: 'SELL',
              tif: 'GTC',
              quantity: 1,
              cOID: `stop-loss-test-order-${Math.random()}`,
              isSingleGroup: true,
            },
          ],
        } satisfies OrderPlacementParametersExistingRootDouble,
      )

      debug('attached response', attachedResponse)
      expect(attachedResponse).toBeDefined()
    })
  })

  describe('modifying orders', () => {
    test('updating the limit price', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']
      const conidex = `${contractId}@SMART` as const

      const orderParameters = {
        conidex,
        manualIndicator: false,
        orderType: 'LMT',
        price: 200, // Entry limit price - below current market
        side: 'BUY',
        tif: 'DAY',
        quantity: 1,
      } as const

      // Place root entry order
      const entryResponse = await client.iserver.account.orders.post(
        {
          orders: [{
            ...orderParameters,
            cOID: `entry-test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      if ('error' in entryResponse) {
        throw new Error('Could not place entry order')
      }

      debug('entry response', entryResponse)
      expect(entryResponse).toBeDefined()

      const entryOrderId = entryResponse[0].order_id

      // Attach take profit order
      const modifiedResponse = await client.iserver.account.order.post(
        {
          orderId: entryOrderId,
          ...orderParameters,
          price: 201, // new limit price
        },
      )

      debug('modified response', modifiedResponse)
      expect(modifiedResponse).toBeDefined()
    })

    test('updating the quantity', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })

      const contractId = CONTRACTS['AAPL']
      const conidex = `${contractId}@SMART` as const

      const orderParameters = {
        conidex,
        manualIndicator: false,
        orderType: 'LMT',
        price: 200, // Entry limit price - below current market
        side: 'BUY',
        tif: 'DAY',
        quantity: 1,
      } as const

      // Place root entry order
      const entryResponse = await client.iserver.account.orders.post(
        {
          orders: [{
            ...orderParameters,
            cOID: `entry-test-order-${Math.random()}`,
          }],
        } satisfies OrderPlacementParametersSingle,
      )

      if ('error' in entryResponse) {
        throw new Error('Could not place entry order')
      }

      debug('entry response', entryResponse)
      expect(entryResponse).toBeDefined()

      const entryOrderId = entryResponse[0].order_id

      // Attach take profit order
      const modifiedResponse = await client.iserver.account.order.post(
        {
          orderId: entryOrderId,
          ...orderParameters,
          quantity: 2, // new quantity (1 more)
        },
      )

      debug('modified response', modifiedResponse)
      expect(modifiedResponse).toBeDefined()
    })
  })

  test.only('delete all orders', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const { orders } = await client.iserver.account.orders.get({
      force: true,
      filters: ['Inactive', 'PreSubmitted', 'Submitted'],
    })

    if (orders === undefined || orders.length === 0) {
      throw new Error('No orders to delete')
    }

    for (const order of orders) {
      debug('deleting order', order)

      const deleteOrderResponse = await client.iserver.account.order.delete({
        orderId: order.orderId,
        manualIndicator: false,
      })

      debug('order deletion response', deleteOrderResponse)
      expect(deleteOrderResponse).toBeDefined()
    }
  })
})
