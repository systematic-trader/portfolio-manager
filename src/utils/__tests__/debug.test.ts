import { initializeDebug } from '../debug.ts'
import { assertSpyCall, assertSpyCalls, spy, test } from '../testing.ts'

const bold = (category: string) => `\x1b[1m${category}\x1b[0m`
const writeLog = (..._messages: unknown[]): void => {}

test('*', () => {
  const writeLogSpy = spy(writeLog)

  const debug = initializeDebug('*', writeLogSpy)

  debug('abc')('msg1')

  assertSpyCall(writeLogSpy, 0, { args: [bold('abc'), 'msg1'] })
  assertSpyCalls(writeLogSpy, 1)
})

test('abc', () => {
  const writeLogSpy = spy(writeLog)

  const debug = initializeDebug('abc', writeLogSpy)

  debug('not')('msg1')

  assertSpyCalls(writeLogSpy, 0)

  debug('abc')('msg2')

  assertSpyCall(writeLogSpy, 0, { args: [bold('abc'), 'msg2'] })
  assertSpyCalls(writeLogSpy, 1)
})

test('abc:*', () => {
  const writeLogSpy = spy(writeLog)

  const debug = initializeDebug('abc:*', writeLogSpy)

  debug('not')('msg1')
  debug('abc')('msg2')

  assertSpyCalls(writeLogSpy, 0)

  debug('abc:edf')('msg3')

  assertSpyCall(writeLogSpy, 0, { args: [bold('abc:edf'), 'msg3'] })
  assertSpyCalls(writeLogSpy, 1)
})

test('abc*:xyz', () => {
  const writeLogSpy = spy(writeLog)

  const debug = initializeDebug('abc*:xyz', writeLogSpy)

  debug('not')('msg1')

  assertSpyCalls(writeLogSpy, 0)

  debug('abc:xyz')('msg2')
  debug('abcd:xyz')('msg3')

  assertSpyCall(writeLogSpy, 0, { args: [bold('abc:xyz'), 'msg2'] })
  assertSpyCall(writeLogSpy, 1, { args: [bold('abcd:xyz'), 'msg3'] })
  assertSpyCalls(writeLogSpy, 2)
})
