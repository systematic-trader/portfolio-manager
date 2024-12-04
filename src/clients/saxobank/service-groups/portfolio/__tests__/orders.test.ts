import { toArray } from '../../../../../utils/async-iterable.ts'
import { extractEntries } from '../../../../../utils/object.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'

function filterOrderTypes<T extends string>(
  candidate: T,
): candidate is Exclude<T, 'TriggerBreakout' | 'TriggerLimit' | 'TriggerStop'> {
  return ['TriggerBreakout', 'TriggerLimit', 'TriggerStop'].includes(candidate) === false
}

describe('portfolio/orders', () => {
  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const {
      findTradableInstruments,
      getFirstAccount,
      placeFavourableOrder,
      resetSimulationAccount,
    } = new TestingUtilities({ app: appSimulation })

    beforeEach(resetSimulationAccount)
    afterAll(resetSimulationAccount)

    test('response passes guard with no orders', async () => {
      const { ClientKey } = await getFirstAccount()

      const orders = await toArray(appSimulation.portfolio.orders.get({
        ClientKey,
      }))
      expect(orders).toBeDefined()
      expect(orders).toHaveLength(0)
    })

    test('response passes guard for different order types', async ({ step }) => {
      const { ClientKey } = await getFirstAccount()
      const limit = 5

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
            // uics: [1351],
            // supportedOrderTypes: ['Market', 'Limit', 'Stop', 'StopIfTraded'],
            // supportedTradeDirections: ['Sell'],
            sessions: ['Closed'], // using closed will make sure that our orders are not executed
            limit,
          })

          let count = 0

          for await (const { instrument, quote, tradeDirections: supportedTradeDirections } of tradeableInstruments) {
            const progres = `${count + 1}/${limit}`
            await step(`${progres}: ${instrument.Description} (UIC ${instrument.Uic})`, async ({ step }) => {
              const orderTypesToTest = instrument.SupportedOrderTypes.filter(filterOrderTypes)

              const tradeDirections = supportedTradeDirections.filter((tradeDirection) =>
                tradeDirectionsToTest.includes(tradeDirection)
              )
              for (const tradeDirection of tradeDirections) {
                await step(tradeDirection, async ({ step }) => {
                  for (const orderType of orderTypesToTest) {
                    await step(orderType, async () => {
                      // Before we start, we should reset the simulation account, so we have no leftover orders
                      await resetSimulationAccount()

                      // Then we place the order
                      const placeOrderResponse = await placeFavourableOrder({
                        instrument,
                        orderType,
                        buySell: tradeDirection === 'Long' ? 'Buy' : 'Sell',
                        quote,
                      })
                      expect(placeOrderResponse).toBeDefined()

                      const externalReference = placeOrderResponse.ExternalReference

                      // After the order has been placed, we should be able to find it
                      const orders = await toArray(appSimulation.portfolio.orders.get({
                        ClientKey,
                      }))

                      expect(orders).toBeDefined()
                      expect(orders).toHaveLength(1)

                      const orderMatchingExternalReference = orders.find((candidate) =>
                        candidate.ExternalReference === externalReference
                      )
                      expect(orderMatchingExternalReference).toBeDefined()
                      expect(orderMatchingExternalReference?.AssetType).toStrictEqual(instrument.AssetType)
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
