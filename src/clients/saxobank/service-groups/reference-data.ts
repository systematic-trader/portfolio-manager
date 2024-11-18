import type { ServiceGroupClient } from '../service-group-client.ts'
import { AlgoStrategies } from './reference-data/algostrategies.ts'
import { Countries } from './reference-data/countries.ts'
import { Cultures } from './reference-data/cultures.ts'
import { Currencies } from './reference-data/currencies.ts'
import { CurrencyPairs } from './reference-data/currency-pairs.ts'
import { Exchanges } from './reference-data/exchanges.ts'
import { Instruments } from './reference-data/instruments.ts'
import { IsAlive } from './reference-data/is-alive.ts'
import { Languages } from './reference-data/languages.ts'
import { StandardDates } from './reference-data/standard-dates.ts'
import { TimeZones } from './reference-data/time-zones.ts'

export class ReferenceData {
  readonly isAlive: IsAlive
  readonly algostrategies: AlgoStrategies
  readonly countries: Countries
  readonly cultures: Cultures
  readonly currencies: Currencies
  readonly currencyPairs: CurrencyPairs
  readonly exchanges: Exchanges
  readonly instruments: Instruments
  readonly languages: Languages
  readonly standarddates: StandardDates
  readonly timezones: TimeZones

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('ref')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
    this.algostrategies = new AlgoStrategies({ client: serviceGroupClient })
    this.countries = new Countries({ client: serviceGroupClient })
    this.cultures = new Cultures({ client: serviceGroupClient })
    this.currencies = new Currencies({ client: serviceGroupClient })
    this.currencyPairs = new CurrencyPairs({ client: serviceGroupClient })
    this.exchanges = new Exchanges({ client: serviceGroupClient })
    this.instruments = new Instruments({ client: serviceGroupClient })
    this.languages = new Languages({ client: serviceGroupClient })
    this.standarddates = new StandardDates({ client: serviceGroupClient })
    this.timezones = new TimeZones({ client: serviceGroupClient })
  }
}
