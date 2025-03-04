import { toArray } from '../../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { Timeout } from '../../../../../../utils/timeout.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { SaxoBankStream } from '../../../../../saxobank-stream.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'
import { SaxoBankRandom } from '../../../../saxobank-random.ts'

const assetTypeCandidates = [
  'Bond',
  'CfdOnEtc',
  'CfdOnEtf',
  'CfdOnEtn',
  'CfdOnFund',
  'CfdOnFutures',
  'CfdOnIndex',
  'CfdOnStock',
  'ContractFutures',
  'Etc',
  'Etf',
  'Etn',
  'Fund',
  'FxForwards',
  'FxSpot',
  'Stock',
] as const

describe('trading/info-prices/subscriptions', () => {
  test('Creating info-price-subscriptions for different asset type', async ({ step }) => {
    using app = new SaxoBankApplication({
      type: 'Live',
    })

    const {
      createTestSubscriptionContext,
      findTradableInstruments,
    } = new TestingUtilities({ app })

    const limit = 500

    for (const assetType of assetTypeCandidates) {
      await step(assetType, async ({ step }) => {
        const instruments = findTradableInstruments({
          assetType,
          limit,
        })

        let count = 0

        for await (const { instrument } of instruments) {
          const progres = `${count + 1}/${limit}`
          await step(`${progres}: ${instrument.Description} (UIC ${instrument.Uic})`, async () => {
            count++

            await using context = createTestSubscriptionContext()

            switch (assetType) {
              case 'Bond':
              case 'CfdOnEtc':
              case 'CfdOnEtf':
              case 'CfdOnEtn':
              case 'CfdOnFund':
              case 'CfdOnFutures':
              case 'CfdOnIndex':
              case 'CfdOnStock':
              case 'ContractFutures':
              case 'Etc':
              case 'Etf':
              case 'Etn':
              case 'Fund':
              case 'FxSpot':
              case 'Stock': {
                const response = await app.trading.infoPrices.subscriptions.post({
                  Arguments: {
                    AssetType: assetType,
                    Uics: [instrument.Uic],
                  },
                  ContextId: context.id,
                  ReferenceId: SaxoBankRandom.stream.referenceID(),
                  Format: 'application/json',
                  RefreshRate: 1000,
                })

                expect(response).toBeDefined()
                break
              }

              case 'FxForwards': {
                const forwardDates = await toArray(app.referenceData.standarddates.forwardTenor.get({
                  Uic: instrument.Uic,
                }))

                const [earliestForwardStandardDate] = forwardDates.sort((left, right) =>
                  left.Date.localeCompare(right.Date)
                )
                if (earliestForwardStandardDate === undefined) {
                  throw new Error('Could not determine forward date')
                }

                const response = await app.trading.infoPrices.subscriptions.post({
                  Arguments: {
                    AssetType: assetType,
                    Uics: [instrument.Uic],
                    ForwardDate: earliestForwardStandardDate.Date,
                  },
                  ContextId: context.id,
                  ReferenceId: SaxoBankRandom.stream.referenceID(),
                  Format: 'application/json',
                  RefreshRate: 1000,
                })

                expect(response).toBeDefined()
                break
              }

              default: {
                throw new TypeError('Unsupported asset type')
              }
            }
          })
        }

        if (count === 0) {
          throw new Error(`Could not find any ${assetType} instruments to base test on`)
        }
      })
    }
  })

  test('Streaming messages', async ({ step }) => {
    using app = new SaxoBankApplication({
      type: 'Live',
    })
    await using stream = new SaxoBankStream({ app })

    const { findTradableInstruments } = new TestingUtilities({ app })

    const messageLimit = 10
    const instrumentLimit = 5

    for (const assetType of assetTypeCandidates) {
      await step(assetType, async ({ step }) => {
        const instruments = findTradableInstruments({
          assetType,
          limit: instrumentLimit,
          sessions: ['AutomatedTrading'], // I would assume that the most activity happens during trading hours
        })

        let instrumentCount = 0
        for await (const { instrument } of instruments) {
          instrumentCount++

          await step(`${instrument.Description}: (UIC ${instrument.Uic})`, async ({ step }) => {
            let stepCount = 0

            const infoPriceSubscription = await stream.infoPrice({
              AssetType: instrument.AssetType,
              Uic: instrument.Uic,
            })

            let firstMessage: unknown = undefined
            let lastMessage: unknown = undefined

            infoPriceSubscription.addListener('message', (message) => {
              stepCount++

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
              if (stream.state.status === 'failed') {
                // deno-lint-ignore no-console
                console.error(stream.state.error)
                throw stream.state.error
              }

              if (infoPriceSubscription.status === 'disposed') {
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
    }
  })

  test('Streaming messages for FxForwards', async ({ step }) => {
    using app = new SaxoBankApplication({
      type: 'Live',
    })
    await using stream = new SaxoBankStream({ app })

    const { findTradableInstruments } = new TestingUtilities({ app })

    const messageLimit = 100
    const instrumentLimit = 20

    const instruments = findTradableInstruments({
      assetType: 'FxForwards',
      limit: instrumentLimit,
      sessions: ['AutomatedTrading'], // I would assume that the most activity happens during trading hours
    })

    let instrumentCount = 0
    for await (const { instrument } of instruments) {
      instrumentCount++

      const [_, earliestDate] = await toArray(app.referenceData.standarddates.forwardTenor.get({
        Uic: instrument.Uic,
      }))

      if (earliestDate === undefined) {
        throw new Error('Could not determine forward date')
      }

      await step(`${instrument.Description}: (UIC ${instrument.Uic}, ${earliestDate.Date})`, async ({ step }) => {
        let stepCount = 0

        const infoPriceSubscription = await stream.infoPrice({
          AssetType: instrument.AssetType,
          Uic: instrument.Uic,
          ForwardDate: earliestDate.Date,
        })

        let firstMessage: unknown = undefined
        let lastMessage: unknown = undefined

        infoPriceSubscription.addListener('message', (message) => {
          stepCount++

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
          if (stream.state.status === 'failed') {
            // deno-lint-ignore no-console
            console.error(stream.state.error)
            throw stream.state.error
          }

          if (infoPriceSubscription.status === 'disposed') {
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
