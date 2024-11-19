import { describe, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

describe('root/subscriptions', () => {
  test('deleting a non-existing context-id does not throw errors', async () => {
    using app = new SaxoBankApplication()

    await app.rootServices.subscriptions.delete({
      ContextId: 'some-context',
    })
  })
})
