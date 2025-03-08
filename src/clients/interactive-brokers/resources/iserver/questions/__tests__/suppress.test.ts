import { Debug } from '../../../../../../utils/debug.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../../client.ts'
import { SuppressibleMessageIdValues } from '../../../../types/derived/suppressible-message-ids.ts'

const debug = Debug('test')

describe('iserver/questions/suppress', () => {
  test('suppressing all questions', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    await client.iserver.accounts.get()

    const response = await client.iserver.questions.suppress.post({
      messageIds: SuppressibleMessageIdValues,
    })

    debug(response)
    expect(response).toBeDefined()
  })

  test('resetting question suppression', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    await client.iserver.accounts.get()

    await client.iserver.questions.suppress.post({
      messageIds: SuppressibleMessageIdValues,
    })

    const response = await client.iserver.questions.suppress.reset.post()

    debug(response)
    expect(response).toBeDefined()
  })
})
