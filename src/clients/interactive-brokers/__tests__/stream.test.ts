import { Debug } from '../../../utils/debug.ts'
import { describe, test } from '../../../utils/testing.ts'
import { Timeout } from '../../../utils/timeout.ts'
import { InteractiveBrokersClient } from '../client.ts'
import { InteractiveBrokersStream } from '../stream.ts'

const debug = {
  info: Debug('test-stream:info'),
}

const CONTRACTS = {
  'IWDA': 100292038,
  'AAPL': 265598,
  'TSLA': 76792991,
  'TL0': 78046366, // Tysk Tesla
  'NOVO.B': 652806383,
}

describe('stream', () => {
  test('init', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })
    await using stream = await InteractiveBrokersStream({
      client,
      marketData: {
        STK: [CONTRACTS['NOVO.B']],
      },
    })

    // while (true) {
    //   const snapshots = [stream.marketData.STK?.get(CONTRACTS['TL0']), stream.marketData.STK?.get(CONTRACTS['NOVO.B'])]

    //   for (const snapshot of snapshots) {
    //     if (snapshot === undefined) {
    //       throw new Error('Snapshot is undefined')
    //     }

    //     debug.info('snapshot:', pick(snapshot, ['55', '84', '86']))
    //   }

    //   await Timeout.wait(5_000)
    // }

    // debug.info('accounts:', stream.accounts)
    // debug.info('snapshots:', stream.snapshots)

    // expect(stream.accounts).toBeDefined()

    using repeater = Timeout.repeat(5_000, () => {
      debug.info('orders:', ['ignored'] /*stream.orders.filter((order) => order.status !== 'Cancelled')*/)
    })

    // const { accountId } = InteractiveBrokersClient.CONFIG[client.type]

    // const [order] = await client.iserver.account.orders.post(
    //   {
    //     accountId,
    //     orders: [{
    //       acctId: accountId,
    //       conidex: `${CONTRACTS['NOVO.B']}@SMART`,
    //       manualIndicator: false,
    //       orderType: 'LMT',
    //       price: 200, // current price for apple is around 240 - adjust this if needed
    //       side: 'BUY',
    //       tif: 'DAY',
    //       quantity: 1,
    //       cOID: `test-order-${Math.random()}`,
    //     }],
    //   } satisfies OrderPlacementParametersSingle,
    // )

    // await Timeout.wait(1_000)

    // await client.iserver.account.order.post({
    //   accountId,
    //   orderId: order.order_id,
    //   conidex: `${CONTRACTS['NOVO.B']}@SMART`,
    //   manualIndicator: false,
    //   orderType: 'MKT',
    //   side: 'BUY',
    //   tif: 'DAY',
    //   quantity: 1,
    // })

    await repeater
  })
})
