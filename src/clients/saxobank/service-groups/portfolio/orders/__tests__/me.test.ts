import { toArray } from '../../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'

describe('portfolio/orders/me', () => {
  test('response passes guard', async () => {
    using app = new SaxoBankApplication()

    const me = await toArray(app.portfolio.orders.me.get())

    expect(me).toBeDefined()
  })
})
