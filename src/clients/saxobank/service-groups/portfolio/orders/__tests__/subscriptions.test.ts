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
    findTradableInstruments,
    resetSimulationAccount,
    placeFavourableOrder,
    waitForPortfolioState,
  } = new TestingUtilities({ app })

  beforeEach(resetSimulationAccount)
  afterAll(resetSimulationAccount)

  test('Streaming messages', async ({ step }) => {
    const instrumentLimit = 1

    const { ClientKey } = await getFirstClient()

    const instruments = findTradableInstruments({
      assetType: 'Stock',
      sessions: ['Closed'], // Only consider instruments for closed exchanges, since otherwise, the orders might be filled
      limit: instrumentLimit,
    })

    let instrumentCount = 0
    for await (const { instrument, quote } of instruments) {
      instrumentCount++

      await step(`${instrument.Description}: (UIC ${instrument.Uic})`, async ({ step }) => {
        let stepCount = 0

        await resetSimulationAccount()

        await using stream = new SaxoBankStream({ app })

        const ordersSubscription = stream.orders({
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

        await placeFavourableOrder({
          buySell: 'Buy',
          instrument: instrument,
          orderType: 'Market',
          quote,
        })

        await waitForPortfolioState({
          orders: ['=', 1],
        })

        await Timeout.wait(5000)

        stream.dispose()

        expect(firstMessage).toBeDefined()
        expect(latestMessage).toBeDefined()
        expect(firstMessage).not.toEqual(latestMessage)

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
      })
    }

    if (instrumentCount === 0) {
      throw new Error('Could not find any instruments to base test on')
    }
  })
})
