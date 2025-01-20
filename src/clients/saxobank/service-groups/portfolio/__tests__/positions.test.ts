import { toArray } from '../../../../../utils/async-iterable.ts'
import { extractEntries } from '../../../../../utils/object.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'
import { SaxoBankRandom } from '../../../saxobank-random.ts'

describe('portfolio/positions', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const { getFirstClient } = new TestingUtilities({ app: appLive })

    test('response passes guard', async () => {
      const { ClientKey } = await getFirstClient()

      const positions = await toArray(appLive.portfolio.positions.get({
        ClientKey,
      }))
      expect(positions).toBeDefined()
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

    test('response passes guard, with no orders or positions', async () => {
      const { ClientKey } = await getFirstClient()

      const positions = await toArray(appSimulation.portfolio.positions.get({
        ClientKey,
      }))
      expect(positions).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const { ClientKey } = await getFirstClient()

      const initialPositions = await toArray(appSimulation.portfolio.positions.get({
        ClientKey,
      }))
      expect(initialPositions).toBeDefined()
      expect(initialPositions).toHaveLength(0)

      await appSimulation.trading.orders.post({
        AssetType: 'FxSpot',
        BuySell: 'Buy',
        Amount: 50_000,
        OrderType: 'Market',
        OrderDuration: { DurationType: 'DayOrder' },
        ManualOrder: false,
        Uic: 21, // EUR/USD
        RequestId: SaxoBankRandom.requestID(),
        ExternalReference: SaxoBankRandom.orderID(),
      })

      await waitForPortfolioState({
        orders: ['=', 0],
      })

      const updatedPositions = await toArray(appSimulation.portfolio.positions.get({
        ClientKey,
      }))
      expect(updatedPositions).toBeDefined()
      expect(updatedPositions).toHaveLength(1)
    })

    test('response passes guard for different order types', async ({ step }) => {
      const { ClientKey } = await getFirstAccount()
      const limit = 50

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
                  // Before we start, we should reset the simulation account, so we have no leftover orders
                  await resetSimulationAccount()

                  // Then we place the order
                  const placeOrderResponse = await placeFavourableOrder({
                    instrument,
                    orderType: 'Market',
                    buySell: tradeDirection === 'Long' ? 'Buy' : 'Sell',
                    quote,
                  })
                  expect(placeOrderResponse).toBeDefined()

                  const externalReference = placeOrderResponse.ExternalReference

                  // After placing the order, we wait for the position to be filled
                  await waitForPortfolioState({
                    // orders: ['=', 0],
                    positions: ['=', 1],
                    timeout: 10_000,
                  })

                  // After the order has been placed, we should be able to find it
                  const positions = await toArray(appSimulation.portfolio.positions.get({
                    ClientKey,
                  }))

                  expect(positions).toBeDefined()
                  expect(positions).toHaveLength(1)

                  const positionMatching = positions.find((candidate) =>
                    candidate.PositionBase.ExternalReference === externalReference
                  )
                  expect(positionMatching).toBeDefined()
                  expect(positionMatching?.PositionBase.AssetType).toStrictEqual(instrument.AssetType)
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
