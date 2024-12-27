import { EOL } from 'jsr:@std/fs'
import { describe, expect, test } from '../testing.ts'
import { convertTSContent, TSClass, TSObject, TSProperty, TSValue } from '../write-ts-file.ts'

describe('convertTSContent', () => {
  test('TSValue', async () => {
    const value = new TSValue({ value: 42 })

    expect(await convertTSContent('constant', value)).toBe(`export const constant = 42${EOL}`)
  })

  test('TSValue as const', async () => {
    const value = new TSValue({ value: 42, as: 'const' })

    expect(await convertTSContent('constant', value)).toBe(`export const constant = 42 as const${EOL}`)
  })

  test('TSValue as typeof', async () => {
    const value = new TSValue({ value: 42, as: 'typeof' })

    expect(await convertTSContent('constant', value)).toBe(`export const constant = 42 as number${EOL}`)
  })

  test('TSObject', async () => {
    const a1 = new TSProperty({ key: 'a1', value: new TSValue({ value: 42 }) })
    const a2 = new TSProperty({ key: 'a2', value: new TSValue({ value: 42, as: 'const' }) })
    const a3 = new TSProperty({ key: 'a3', value: new TSValue({ value: 42, as: 'typeof' }) })
    const c = new TSProperty({ key: 'c', value: new TSClass({ props: [a1, a2, a3] }) })
    const o = new TSObject({ props: [a1, a2, a3, c] })

    expect(await convertTSContent('constant', o)).toBe(
      `export const constant = {
  'a1': 42,
  'a2': 42 as const,
  'a3': 42 as number,
  'c': class {
    'a1' = 42
    'a2' = 42 as const
    'a3' = 42 as number
  },
}${EOL}`,
    )
  })

  test('TSClass', async () => {
    const a1 = new TSProperty({ key: 'a1', value: new TSValue({ value: 42 }) })
    const a2 = new TSProperty({ key: 'a2', value: new TSValue({ value: 42, as: 'const' }) })
    const a3 = new TSProperty({ key: 'a3', value: new TSValue({ value: 42, as: 'typeof' }) })
    const c = new TSClass({ props: [a1, a2, a3] })

    expect(await convertTSContent('constant', c)).toBe(
      `export class constant {
  'a1' = 42
  'a2' = 42 as const
  'a3' = 42 as number
}${EOL}`,
    )
  })
})
