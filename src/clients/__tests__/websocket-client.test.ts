import { ensureError } from '../../utils/error.ts'
import { describe, expect, test } from '../../utils/testing.ts'
import { WebSocketClient } from '../websocket-client.ts'

const ECHO_URL = 'wss://ws.postman-echo.com/raw'
const INVALID_URL = 'wss://invalid.url'
const INVALID_FRAME = new Uint8Array([0x00, 0x00, 0xff])

test('state', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  expect(websocket.state).toStrictEqual({ status: 'closed', error: undefined })
})

test('url', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  expect(websocket.url).toBe(ECHO_URL)
})

test('binaryType', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  expect(websocket.binaryType).toBe('blob')
})

test('bufferedAmount', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  expect(websocket.bufferedAmount).toBe(0)
})

test('protocol', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  expect(websocket.protocol).toBe('')
})

test('extensions', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  expect(websocket.extensions).toBe('')
})

test('openedAt', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  expect(websocket.openedAt).toBe(-1)
})

test('closedAt', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  expect(websocket.closedAt).toBe(-1)
})

test('errorAt', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  expect(websocket.errorAt).toBe(-1)
})

test('messageAt', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  expect(websocket.messageAt).toBe(-1)
})

test('send', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  let error: unknown = undefined

  try {
    websocket.send('Hello, WebSocket!')
  } catch (sendError) {
    error = sendError
  }

  expect(error).toBeInstanceOf(Error)
})

test('listener', async () => {
  await using websocket = new WebSocketClient({ url: ECHO_URL })

  const callback = () => {}

  expect(websocket.hasListener('message', callback)).toBe(false)

  websocket.addListener('message', callback)

  expect(websocket.hasListener('message', callback)).toBe(true)

  websocket.removeListener('message', callback)

  expect(websocket.hasListener('message', callback)).toBe(false)
})

describe(`URL ${ECHO_URL}`, () => {
  test('connect', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })

    let error: undefined | Error = undefined

    try {
      await websocket.connect()
    } catch (connectError) {
      error = ensureError(connectError)
    }

    expect(error).toBeUndefined()
  })

  test('state', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.state).toStrictEqual({ status: 'open', error: undefined })
  })

  test('state', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.state).toStrictEqual({ status: 'open', error: undefined })
  })

  test('url', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.url).toBe(ECHO_URL)
  })

  test('binaryType', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.binaryType).toBe('blob')
  })

  test('bufferedAmount', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.bufferedAmount).toBe(0)
  })

  test('protocol', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.protocol).toBe('')
  })

  test('extensions', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.extensions).toBe('')
  })

  test('openedAt', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.openedAt).not.toBe(-1)
  })

  test('closedAt', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.closedAt).toBe(-1)
  })

  test('errorAt', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.errorAt).toBe(-1)
  })

  test('messageAt', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()

    expect(websocket.messageAt).toBe(-1)
  })

  test('close', async () => {
    await using websocket = new WebSocketClient({ url: ECHO_URL })
    await websocket.connect()
    await websocket.close()

    expect(websocket.state).toStrictEqual({ status: 'closed', error: undefined })
  })

  describe('event', () => {
    test('open', async () => {
      await using websocket = new WebSocketClient({ url: ECHO_URL })

      const { promise: eventPromise, reject, resolve } = Promise.withResolvers<Event>()

      websocket.addListener('open', resolve, { once: true })
      websocket.addListener('error', reject, { once: true })

      await websocket.connect()

      const event = await eventPromise

      expect(event).toBeInstanceOf(Event)
    })

    test('close', async () => {
      await using websocket = new WebSocketClient({ url: ECHO_URL })

      const { promise: eventPromise, reject, resolve } = Promise.withResolvers<Event>()

      websocket.addListener('close', resolve, { once: true })
      websocket.addListener('error', reject, { once: true })

      await websocket.connect()
      await websocket.close()

      const event = await eventPromise

      expect(event).toBeInstanceOf(CloseEvent)
    })

    test('message', async () => {
      await using websocket = new WebSocketClient({ url: ECHO_URL })
      await websocket.connect()

      const { promise: eventPromise, reject, resolve } = Promise.withResolvers<Event>()

      websocket.addListener('message', resolve, { once: true })
      websocket.addListener('error', reject, { once: true })

      const message = 'Hello, WebSocket!'

      websocket.send(message)

      const event = await eventPromise

      expect(event).toBeInstanceOf(MessageEvent)
      expect((event as MessageEvent).data).toBe(message)
    })

    test('error', async () => {
      await using websocket = new WebSocketClient({ url: ECHO_URL })
      await websocket.connect()

      const { promise: eventPromise, reject, resolve } = Promise.withResolvers<Event>()

      websocket.addListener('message', resolve, { once: true })
      websocket.addListener('error', reject, { once: true })

      websocket.send(INVALID_FRAME)

      let messageEvent: Event | undefined = undefined
      let errorEvent: Event | undefined = undefined

      try {
        messageEvent = await eventPromise
      } catch (error) {
        errorEvent = error as Event
      }

      expect(messageEvent).toBeUndefined()
      expect(errorEvent).toBeInstanceOf(ErrorEvent)
    })

    test('inactivity', async () => {
      await using websocket = new WebSocketClient({ url: ECHO_URL })
      await websocket.connect()

      const { promise, resolve } = Promise.withResolvers<void>()

      websocket.inactivity.add(resolve, 25)

      const now = Date.now()

      await promise

      expect(Date.now() - now).toBeGreaterThanOrEqual(25)
    })
  })
})

describe(`URL ${INVALID_URL}`, () => {
  test('connect', async () => {
    await using websocket = new WebSocketClient({ url: INVALID_URL })

    let error: undefined | Error = undefined

    try {
      await websocket.connect()
    } catch (connectError) {
      error = ensureError(connectError)
    }

    expect(error).toBeInstanceOf(Error)
  })

  test('state', async () => {
    await using websocket = new WebSocketClient({ url: INVALID_URL })
    await websocket.connect().catch(() => {})

    expect(websocket.state).toStrictEqual({ status: 'closed', error: undefined })
  })
})
