import { Debug } from '../../../../../../utils/debug.ts'
import { Environment } from '../../../../../../utils/environment.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { Timeout } from '../../../../../../utils/timeout.ts'
import { InteractiveBrokersClient, type InteractiveBrokersClientOptions } from '../../../../client.ts'
import type { OrderPlacementParametersSingle } from '../orders.ts'

const debug = Debug('test')

const accountId = Environment.get('IB_PAPER_ACCOUNT_ID')

const CONTRACTS = {
  'IWDA': 100292038,
  'AAPL': 265598,
  'TSLA': 76792991,
  'NOVO.B': 652806383,
  'ES@20270617': 649180661, // 17/06/2027
  'EUR.DKK': 39394687, // todo this naming seems off
}

// todo remove this, when it's implemented into the client
async function prepareClient(client: InteractiveBrokersClient<InteractiveBrokersClientOptions>): Promise<void> {
  await client.iserver.accounts.get()
  await client.iserver.questions.suppress.post()
}

describe('iserver/account/order', () => {
  describe('currency conversion', () => {
    test('DKK -> EUR -> DKK', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })
      await prepareClient(client)

      const contractId = CONTRACTS['EUR.DKK']

      // todo check if we have enough funds in too do actually do this test
      // todo make a test showing what happens when we're converting from something we don't have

      const toEURResponse = await client.iserver.account.orders.post({
        accountId,
        orders: [{
          isCcyConv: true,
          acctId: accountId,
          orderType: 'MKT',
          side: 'BUY',
          cOID: `test-order-${Math.random()}`,
          conidex: `${contractId}@SMART`,
          fxQty: 500, // in dkk
          manualIndicator: false,
          tif: 'DAY',
        }],
      })

      debug('dkk -> eur response', toEURResponse)
      expect(toEURResponse).toBeDefined()

      await Timeout.wait(5000)

      const toDKKResponse = await client.iserver.account.orders.post({
        accountId,
        orders: [{
          isCcyConv: true,
          acctId: accountId,
          orderType: 'MKT',
          side: 'SELL',
          cOID: `test-order-${Math.random()}`,
          conidex: `${contractId}@SMART`,
          fxQty: 450, // still in dkk (a bit less to account for 2 USD in conversion fees - which will be deduced in the account base currency)
          manualIndicator: false,
          tif: 'DAY',
        }],
      })

      debug('eur -> dkk response', toDKKResponse)
      expect(toDKKResponse).toBeDefined()
    })
  })

  describe('placing single entry order', () => {
    test('limit', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })
      await prepareClient(client)

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          accountId,
          orders: [{
            acctId: accountId,
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
      await prepareClient(client)

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          accountId,
          orders: [{
            acctId: accountId,
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
      await prepareClient(client)

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          accountId,
          orders: [{
            acctId: accountId,
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
      await prepareClient(client)

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          accountId,
          orders: [{
            acctId: accountId,
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
      await prepareClient(client)

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          accountId,
          orders: [{
            acctId: accountId,
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
      await prepareClient(client)

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          accountId,
          orders: [{
            acctId: accountId,
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
      await prepareClient(client)

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          accountId,
          orders: [{
            acctId: accountId,
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

    test('trailing stop', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })
      await prepareClient(client)

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          accountId,
          orders: [{
            acctId: accountId,
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

    test('trailing stop limit', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })
      await prepareClient(client)

      const contractId = CONTRACTS['AAPL']

      const response = await client.iserver.account.orders.post(
        {
          accountId,
          orders: [{
            acctId: accountId,
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
  })

  describe('placing a single exit order', () => {
    test('market', async () => {
      await using client = new InteractiveBrokersClient({ type: 'Paper' })
      await prepareClient(client)

      const contractId = CONTRACTS['NOVO.B']

      const entryResponse = await client.iserver.account.orders.post(
        {
          accountId,
          orders: [{
            acctId: accountId,
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
          accountId,
          orders: [{
            acctId: accountId,
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

  test.only('delete all orders', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })
    await prepareClient(client)

    const { orders } = await client.iserver.account.orders.get({
      force: true,
      filters: ['Inactive', 'PreSubmitted', 'Submitted'],
      accountId,
    })

    if (orders === undefined || orders.length === 0) {
      throw new Error('No orders to delete')
    }

    for (const order of orders) {
      debug('deleting order', order)

      const deleteOrderResponse = await client.iserver.account.order.delete({
        accountId,
        orderId: order.orderId,
        manualIndicator: false,
      })

      debug('order deletion response', deleteOrderResponse)
      expect(deleteOrderResponse).toBeDefined()
    }
  })
})
