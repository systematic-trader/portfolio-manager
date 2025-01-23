import { toArray } from '../../../../../utils/async-iterable.ts'
import { extractEntries } from '../../../../../utils/object.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'

describe('portfolio/closed-positions', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const { getFirstClient } = new TestingUtilities({ app: appLive })

    test('response passes guard', async () => {
      const client = await getFirstClient()

      const closedPositions = await toArray(appLive.portfolio.closedPositions.get({
        ClientKey: client.ClientKey,
      }))

      expect(closedPositions).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const {
      getFirstAccount,
      getFirstClient,
      resetSimulationAccount,
      waitForPortfolioState,
      findTradableInstruments,
      placeFavourableOrder,
    } = new TestingUtilities({
      app: appSimulation,
    })

    beforeEach(resetSimulationAccount)
    afterAll(resetSimulationAccount)

    test('response passes guard, with no closed positions', async () => {
      const client = await getFirstClient()

      const positions = await toArray(appSimulation.portfolio.closedPositions.get({
        ClientKey: client.ClientKey,
      }))

      expect(positions).toBeDefined()
    })

    test('response passes guard for different order types', async ({ step }) => {
      const client = await getFirstAccount()

      const limit = 20

      const assetTypes = {
        Bond: ['Long'],
        CfdOnEtc: ['Long', 'Short'],
        CfdOnEtf: ['Long', 'Short'],
        CfdOnEtn: ['Long', 'Short'],
        CfdOnFund: ['Long', 'Short'],
        CfdOnFutures: ['Long', 'Short'],
        CfdOnIndex: ['Long', 'Short'],
        CfdOnStock: ['Long', 'Short'],
        ContractFutures: ['Long', 'Short'],
        Etc: ['Long'],
        Etf: ['Long'],
        Etn: ['Long'],
        Fund: ['Long'],
        FxForwards: ['Long', 'Short'],
        FxSpot: ['Long', 'Short'],
        Stock: ['Long'],
      }

      for (const [assetType, tradeDirectionsToTest] of extractEntries(assetTypes)) {
        await step(assetType, async ({ step }) => {
          const tradeableInstruments = findTradableInstruments({
            assetType,
            supportedOrderTypes: ['Market'],
            sessions: ['AutomatedTrading'], // using open sessions will make sure that we consistently can enter a position using a market order
            limit,
          })

          let count = 0

          for await (const { instrument, quote, tradeDirections: supportedTradeDirections } of tradeableInstruments) {
            const progres = `${count + 1}/${limit}`
            await step(`${progres}: ${instrument.Description} (UIC ${instrument.Uic})`, async ({ step }) => {
              const tradeDirections = supportedTradeDirections.filter((tradeDirection) =>
                tradeDirectionsToTest.includes(tradeDirection)
              )
              for (const tradeDirection of tradeDirections) {
                await step(tradeDirection, async () => {
                  // Before we start, we should reset the simulation account, so we have no leftover orders, positions or anything elske
                  await resetSimulationAccount()

                  // Then we place the order
                  const openOrderResponse = await placeFavourableOrder({
                    instrument,
                    orderType: 'Market',
                    buySell: tradeDirection === 'Long' ? 'Buy' : 'Sell',
                    quote,
                  })
                  expect(openOrderResponse).toBeDefined()

                  await waitForPortfolioState({
                    positions: ['=', 1],
                    timeout: 60_000,
                  })

                  // After this, we need to sell the position again, so we can close it
                  const closeOrderResponse = await placeFavourableOrder({
                    instrument,
                    orderType: 'Market',
                    buySell: tradeDirection === 'Long' ? 'Sell' : 'Buy',
                    quote,
                  })
                  expect(closeOrderResponse).toBeDefined()

                  await waitForPortfolioState({
                    positions: ['=', 0],
                    timeout: 60_000,
                  })

                  // After the position has been closed, we should be able to find it
                  const closedPositions = await toArray(appSimulation.portfolio.closedPositions.get({
                    ClientKey: client.ClientKey,
                  }))

                  expect(closedPositions).toBeDefined()
                  expect(closedPositions).toHaveLength(1)
                })
              }
            })

            count++
          }

          if (count === 0) {
            throw new Error('Failed to find any instruments to base the test on')
          }
        })
      }
    })
  })
})
