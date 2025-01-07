import { Debug } from '../../../../../../utils/debug.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { Timeout } from '../../../../../../utils/timeout.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { SaxoBankStream } from '../../../../../saxobank-stream.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'

const debug = Debug('test')

describe('portfolio/orders/subscriptions', () => {
  using app = new SaxoBankApplication({
    type: 'Simulation',
  })

  const {
    getFirstClient,
    getFirstAccount,
    findTradableInstruments,
    resetSimulationAccount,
    placeFavourableOrder,
    waitForPortfolioState,
  } = new TestingUtilities({ app })

  beforeEach(resetSimulationAccount)
  afterAll(resetSimulationAccount)

  test('Placing a single limit-order, then updating it to a market-order', async ({ step }) => {
    const instrumentLimit = 1

    const { ClientKey } = await getFirstClient()
    const { AccountKey } = await getFirstAccount()

    const instruments = findTradableInstruments({
      assetType: 'Stock',
      sessions: ['AutomatedTrading'], // Find a stock that is currently tradable
      limit: instrumentLimit,
    })

    let instrumentCount = 0
    for await (const { instrument, quote } of instruments) {
      instrumentCount++

      await step(`${instrument.Description}: (UIC ${instrument.Uic})`, async ({ step }) => {
        let stepCount = 0

        await resetSimulationAccount()

        await using stream = new SaxoBankStream({ app })

        const ordersSubscription = await stream.orders({
          ClientKey,
        })

        let firstMessage: unknown = undefined
        let latestMessage: unknown = undefined

        ordersSubscription.addListener('message', (message) => {
          stepCount++

          debug(message)

          step(`Message ${stepCount}`, () => {
            if (firstMessage === undefined) {
              firstMessage = message
            }

            latestMessage = message
          })
        })

        await Timeout.wait(5000)

        const order = await placeFavourableOrder({
          buySell: 'Buy',
          instrument: instrument,
          orderType: 'Limit',
          quote,
        })

        await Timeout.wait(5000)

        await app.trading.orders.patch({
          AccountKey,
          AssetType: instrument.AssetType,
          OrderId: order.OrderId,
          OrderDuration: {
            DurationType: 'DayOrder',
          },
          OrderType: 'Market',
        })

        await Timeout.wait(5000)

        await waitForPortfolioState({
          positions: ['=', 1],
        })

        stream.dispose()

        while (true) {
          if (stream.state.status === 'failed') {
            debug(stream.state.error)
            throw stream.state.error
          }

          if (ordersSubscription.status === 'disposed') {
            break
          }

          await Timeout.wait(250)
        }

        expect(firstMessage).toBeDefined()
        expect(latestMessage).toBeDefined()
        expect(firstMessage).toEqual(latestMessage) // we start with no orders, and end up with no orders
      })
    }

    if (instrumentCount === 0) {
      throw new Error('Could not find any instruments to base test on')
    }
  })
})
