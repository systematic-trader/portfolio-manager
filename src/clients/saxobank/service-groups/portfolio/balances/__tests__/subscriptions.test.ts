import { Debug } from '../../../../../../utils/debug.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { Timeout } from '../../../../../../utils/timeout.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { SaxoBankStream } from '../../../../../saxobank-stream.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'

const debug = Debug('test')

describe('portfolio/balances/subscriptions', () => {
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
    const messageLimit = 20
    const instrumentLimit = 30

    const { ClientKey } = await getFirstClient()

    const instruments = findTradableInstruments({
      assetType: 'Stock',
      limit: instrumentLimit,
      sessions: ['AutomatedTrading'], // I would assume that the most activity happens during trading hours
    })

    let instrumentCount = 0
    for await (const { instrument, quote } of instruments) {
      instrumentCount++

      await step(`${instrument.Description}: (UIC ${instrument.Uic})`, async ({ step }) => {
        let stepCount = 0

        await placeFavourableOrder({
          buySell: 'Buy',
          instrument: instrument,
          orderType: 'Market',
          quote,
        })

        await waitForPortfolioState({
          positions: ['>', 0],
        })

        await using stream = new SaxoBankStream({ app })

        const balanceSubscription = stream.balances({
          ClientKey,
        })

        let firstMessage: unknown = undefined
        let lastMessage: unknown = undefined

        balanceSubscription.addListener('message', (message) => {
          stepCount++

          debug(message)

          step(`Message ${stepCount}/${messageLimit}`, () => {
            if (firstMessage === undefined) {
              firstMessage = message
            }

            if (stepCount >= messageLimit) {
              lastMessage = message
              stream.dispose()
            }
          })
        })

        while (true) {
          if (balanceSubscription.state.status === 'failed') {
            debug(balanceSubscription.state.error)
            throw balanceSubscription.state.error
          }

          if (balanceSubscription.state.status === 'disposed') {
            break
          }

          await Timeout.wait(250)
        }

        expect(firstMessage).toBeDefined()
        expect(lastMessage).toBeDefined()
        expect(firstMessage).not.toEqual(lastMessage)
      })
    }

    if (instrumentCount === 0) {
      throw new Error('Could not find any instruments to base test on')
    }
  })
})
