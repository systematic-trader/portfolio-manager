import { toArray } from '../../../../../utils/async-iterable.ts'
import { extractEntries } from '../../../../../utils/object.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'

describe('portfolio/net-positions', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const { getFirstClient } = new TestingUtilities({ app: appLive })

    test('response passes guard', async () => {
      const client = await getFirstClient()

      const netPositions = await toArray(appLive.portfolio.netPositions.get({
        ClientKey: client.ClientKey,
      }))

      expect(netPositions).toBeDefined()
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

    test('response passes guard, with no positions', async () => {
      const client = await getFirstClient()

      const netPositions = await toArray(appSimulation.portfolio.netPositions.get({
        ClientKey: client.ClientKey,
      }))

      expect(netPositions).toBeDefined()
    })

    test('response passes guard for positions in different asset types', async ({ step }) => {
      const client = await getFirstAccount()

      const limit = 100

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
            sessions: ['AutomatedTrading'], // using open sessions will make sure that we consistently can enter positions using a market order
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
                await step(tradeDirection, async ({ step }) => {
                  // Before we start, we should reset the simulation account, so we have no leftover orders
                  await resetSimulationAccount()

                  for (const positionCount of [1, 2]) {
                    await step(`Position: ${positionCount}`, async () => {
                      const placeOrderResponse = await placeFavourableOrder({
                        instrument,
                        orderType: 'Market',
                        buySell: tradeDirection === 'Long' ? 'Buy' : 'Sell',
                        quote,
                      })
                      expect(placeOrderResponse).toBeDefined()

                      // After placing the order, we wait for the position to be filled
                      await waitForPortfolioState({
                        positions: ['=', positionCount],
                        timeout: 5_000,
                      })

                      const netPositionsAfterFirstPosition = await toArray(appSimulation.portfolio.netPositions.get({
                        ClientKey: client.ClientKey,
                      }))

                      expect(netPositionsAfterFirstPosition).toBeDefined()
                      expect(netPositionsAfterFirstPosition).toHaveLength(1) // We always expect only to get 1 net position, since we only have positions for the same instrument
                    })
                  }
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
