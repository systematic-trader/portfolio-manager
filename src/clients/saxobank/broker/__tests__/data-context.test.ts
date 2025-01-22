import { describe, expect, test } from '../../../../utils/testing.ts'
import { DataContext, DataContextReader, DataContextReaderView } from '../data-context.ts'
import { SaxoBankBroker } from '../saxobank-broker.ts'

test.only('stockCost', async () => {
  const accountKey = await SaxoBankBroker.options({ type: 'Simulation' }).then((options) =>
    Object.keys(options.accounts)[0]!
  )
  const context = new DataContext({ type: 'Simulation' })

  try {
    const cost = await context.stockCost({
      accountKey,
      uic: 15629, // NOVOB
    })

    console.log('cost:', cost)

    // expect(stock.value.Uic).toBe(0)
  } finally {
    await context.dispose()
  }
})

describe('DataContextReader', () => {
  test('initial value', () => {
    const reader = new DataContextReader({
      dispose: () => {},
      read: () => 1,
      refresh: () => {},
    })

    expect(reader.value).toBe(1)
  })

  test('refresh', async () => {
    let value = 0

    const reader = new DataContextReader({
      dispose: () => {},
      read: () => value,
      refresh: () => {
        value++
      },
    })
    expect(reader.version).toBe(1)
    expect(reader.value).toBe(0)

    await reader.refresh()

    expect(reader.version).toBe(2)
    expect(reader.value).toBe(1)
  })

  test('merge', async () => {
    let value1 = 0

    const reader1 = new DataContextReader({
      dispose: () => {},
      read: () => value1,
      refresh: () => {
        value1++
      },
    })

    let value2 = 1

    const reader2 = new DataContextReader({
      dispose: () => {},
      read: () => value2,
      refresh: () => {
        value2++
      },
    })

    const merged = reader1.merge(reader2)

    expect(merged.value).toStrictEqual([0, 1])

    await reader1.refresh()

    expect(reader1.version).toBe(2)
    expect(reader1.value).toBe(1)
    expect(merged.value).toStrictEqual([1, 1])

    await reader2.refresh()

    expect(reader2.version).toBe(2)
    expect(reader2.value).toBe(2)
    expect(merged.value).toStrictEqual([1, 2])
  })

  test('view', () => {
    const reader = new DataContextReader({
      dispose: () => {},
      read: () => 1,
      refresh: () => {},
    })

    expect(reader.view((value) => value)).toBeInstanceOf(DataContextReaderView)
  })

  test('refresh view', async () => {
    let value = 0

    const reader = new DataContextReader({
      dispose: () => {},
      read: () => value,
      refresh: () => {
        value++
      },
    })

    const view = reader.view((value) => value + 1)

    expect(view.value).toBe(1)
    expect(view.version).toBe(1)

    await reader.refresh()

    expect(view.value).toBe(2)
    expect(view.version).toBe(2)
  })
})

describe('DataContextReaderView', () => {
  test('initial value', () => {
    const reader = new DataContextReaderView({ read: () => 1, version: () => 1 })

    expect(reader.value).toBe(1)
  })

  test('merge', async () => {
    let value1 = 0

    const reader1 = new DataContextReader({
      dispose: () => {},
      read: () => value1,
      refresh: () => {
        value1++
      },
    })

    let value2 = 0

    const reader2 = new DataContextReader({
      dispose: () => {},
      read: () => value2,
      refresh: () => {
        value2++
      },
    })

    const view1 = reader1.view((value) => value + 1)
    const view2 = reader2.view((value) => value + 2)

    expect(view1.version).toBe(1)

    const merged = view1.merge(view2)

    expect(merged.value).toStrictEqual([1, 2])

    await reader1.refresh()

    expect(view1.version).toBe(2)
    expect(view1.value).toBe(2)
    expect(merged.value).toStrictEqual([2, 2])

    await reader2.refresh()

    expect(view2.version).toBe(2)
    expect(view2.value).toBe(3)
    expect(merged.value).toStrictEqual([2, 3])
  })

  test('view', () => {
    const reader = new DataContextReaderView({ read: () => 1, version: () => 1 })

    expect(reader.view((value) => value)).toBeInstanceOf(DataContextReaderView)
  })
})
