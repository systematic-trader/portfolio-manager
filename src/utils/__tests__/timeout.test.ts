import { expect, test } from '../testing.ts'
import { Timeout } from '../timeout.ts'

test('wait', async () => {
  const now = Date.now()

  await Timeout.wait(100)

  expect(Date.now() - now).toBeGreaterThanOrEqual(100)
})

test('defer', async () => {
  const now = Date.now()

  const timeout = await Timeout.defer(100, () => {
    return 'hello'
  })

  expect(timeout).toBe('hello')
  expect(Date.now() - now).toBeGreaterThanOrEqual(100)
})

test('run', async () => {
  const now = Date.now()

  const timeout = await Timeout.run(101, () => {
    return new Promise<string>((resolve) => {
      setTimeout(() => resolve('hello'), 100)
    })
  })

  expect(timeout).toBe('hello')
  expect(Date.now() - now).toBeGreaterThanOrEqual(100)
})

test('repeat', async () => {
  const now = Date.now()

  let count = 0

  const timeout = Timeout.repeat(100, () => {
    count++

    if (count > 3) {
      timeout.abort()
    }
  })

  await timeout

  expect(count).toBe(4)
  expect(Date.now() - now).toBeGreaterThanOrEqual(300)
})
