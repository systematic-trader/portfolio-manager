import { createDebug, type DebugOptions } from '../debug.ts'
import { assertSpyCall, assertSpyCalls, spy, test } from '../testing.ts'

const writeLog = (..._messages: unknown[]): void => {}

const debugOptions = (pattern: string, write: DebugOptions['write']): DebugOptions => ({
  pattern,
  write,
  timestamp: false,
  colors: false,
})

test('*', () => {
  const writeLogSpy = spy(writeLog)

  const debug = createDebug(debugOptions('*', writeLogSpy))

  debug('abc')('msg1')

  assertSpyCall(writeLogSpy, 0, { args: ['abc', 'msg1'] })
  assertSpyCalls(writeLogSpy, 1)
})

test('abc', () => {
  const writeLogSpy = spy(writeLog)

  const debug = createDebug(debugOptions('abc', writeLogSpy))

  debug('not')('msg1')

  assertSpyCalls(writeLogSpy, 0)

  debug('abc')('msg2')

  assertSpyCall(writeLogSpy, 0, { args: ['abc', 'msg2'] })
  assertSpyCalls(writeLogSpy, 1)
})

test('abc:*', () => {
  const writeLogSpy = spy(writeLog)

  const debug = createDebug(debugOptions('abc:*', writeLogSpy))

  debug('not')('msg1')
  debug('abc')('msg2')

  assertSpyCalls(writeLogSpy, 0)

  debug('abc:edf')('msg3')
  debug('abc:edf:ghi')('msg4')

  assertSpyCall(writeLogSpy, 0, { args: ['abc:edf', 'msg3'] })
  assertSpyCall(writeLogSpy, 1, { args: ['abc:edf:ghi', 'msg4'] })
  assertSpyCalls(writeLogSpy, 2)
})

test('abc*:xyz', () => {
  const writeLogSpy = spy(writeLog)

  const debug = createDebug(debugOptions('abc*:xyz', writeLogSpy))

  debug('not')('msg1')

  assertSpyCalls(writeLogSpy, 0)

  debug('abc:xyz')('msg2')
  debug('abcd:xyz')('msg3')

  assertSpyCall(writeLogSpy, 0, { args: ['abc:xyz', 'msg2'] })
  assertSpyCall(writeLogSpy, 1, { args: ['abcd:xyz', 'msg3'] })
  assertSpyCalls(writeLogSpy, 2)
})

test('a*c:xyz', () => {
  const writeLogSpy = spy(writeLog)

  const debug = createDebug(debugOptions('a*c:xyz', writeLogSpy))

  debug('not')('msg1')

  assertSpyCalls(writeLogSpy, 0)

  debug('abc:xyz')('msg2')
  debug('abbc:xyz')('msg3')

  assertSpyCall(writeLogSpy, 0, { args: ['abc:xyz', 'msg2'] })
  assertSpyCall(writeLogSpy, 1, { args: ['abbc:xyz', 'msg3'] })
  assertSpyCalls(writeLogSpy, 2)
})

test('a*c:xy*', () => {
  const writeLogSpy = spy(writeLog)

  const debug = createDebug(debugOptions('a*c:xy*', writeLogSpy))

  debug('not')('msg1')

  assertSpyCalls(writeLogSpy, 0)

  debug('abc:xyz')('msg2')
  debug('abbc:xyzz')('msg3')

  assertSpyCall(writeLogSpy, 0, { args: ['abc:xyz', 'msg2'] })
  assertSpyCall(writeLogSpy, 1, { args: ['abbc:xyzz', 'msg3'] })
  assertSpyCalls(writeLogSpy, 2)
})
