import { Debug } from '../../../../../../utils/debug.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { Timeout } from '../../../../../../utils/timeout.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { SaxoBankStream } from '../../../../../saxobank-stream.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'

const debug = Debug('test')

describe('portfolio/closed-positions/subscriptions', () => {
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

  test('Opening a single stock-position, then closing it', async ({ step }) => {
    const instrumentLimit = 1

    const { ClientKey } = await getFirstClient()

    const instruments = findTradableInstruments({
      assetType: 'Stock',
      sessions: ['AutomatedTrading'], // Find a stock that is currently tradable
      limit: instrumentLimit,
    })

    let instrumentCount = 0
    for await (const { instrument, quote } of instruments) {
      instrumentCount++

      await step(`${instrument.Description}: (UIC ${instrument.Uic})`, async ({ step }) => {
        let messageCount = 0

        await resetSimulationAccount()

        await using stream = new SaxoBankStream({ app })

        const closedPositionsSubscription = await stream.closedPositions({
          ClientKey,
        })

        let firstMessage: unknown = undefined
        let latestMessage: unknown = undefined

        closedPositionsSubscription.addListener('message', (message) => {
          messageCount++

          debug(message)

          step(`Message ${messageCount}`, () => {
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
          positions: ['=', 1],
        })

        await placeFavourableOrder({
          buySell: 'Sell',
          instrument: instrument,
          orderType: 'Market',
          quote,
        })

        await waitForPortfolioState({
          positions: ['=', 0],
        })

        stream.dispose()

        while (true) {
          if (stream.state.status === 'failed') {
            debug(stream.state.error)
            throw stream.state.error
          }

          if (closedPositionsSubscription.status === 'disposed') {
            break
          }

          await Timeout.wait(250)
        }

        expect(messageCount).toBeGreaterThan(0)
        expect(firstMessage).toBeDefined()
        expect(latestMessage).toBeDefined()
        expect(firstMessage).not.toEqual(latestMessage) // We start with no closed positions, but end up with one
      })
    }

    if (instrumentCount === 0) {
      throw new Error('Could not find any instruments to base test on')
    }
  })
})
