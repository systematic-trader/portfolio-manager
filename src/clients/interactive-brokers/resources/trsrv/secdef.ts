import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Schedule } from './secdef/schedule.ts'

export class Secdef {
  readonly #client: InteractiveBrokersResourceClient

  readonly schedule: Schedule

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('secdef')

    this.schedule = new Schedule(this.#client)
  }
}
