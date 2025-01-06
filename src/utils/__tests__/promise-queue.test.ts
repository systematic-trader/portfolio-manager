import { PromiseQueue } from '../promise-queue.ts'
import { expect, test } from '../testing.ts'
import { Timeout } from '../timeout.ts'

test('call', async () => {
  const { promise, reject, resolve } = Promise.withResolvers<void>()

  const queue = new PromiseQueue(reject)

  const order: number[] = []

  for (let i = 0; i < 5; i++) {
    queue.call(async () => {
      await Timeout.wait(Math.max(1, 10 - (i * 2)))
      order.push(i)
    })
  }

  queue.call(() => {
    resolve()
    order.push(order.length)
  })

  await queue.drain()
  await promise

  expect(order).toStrictEqual([0, 1, 2, 3, 4, 5])
})

test('call immediately', async () => {
  const { promise, reject, resolve } = Promise.withResolvers<void>()

  const queue = new PromiseQueue(reject)

  const order: number[] = []

  queue.call(() => {
    order.push(1)
  })

  queue.call(() => {
    order.push(2)
    resolve()
  }, { immediately: true })

  await queue.drain()
  await promise

  expect(order).toStrictEqual([2, 1])
})

test('call with error', async () => {
  const { promise, reject } = Promise.withResolvers<void>()

  const queue = new PromiseQueue(reject)
  const error = new Error('error')

  queue.call(() => {
    throw error
  })

  await queue.drain()
  await expect(promise).rejects.toBe(error)
})
