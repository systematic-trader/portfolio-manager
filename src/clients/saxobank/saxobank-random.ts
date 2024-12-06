const MAX_LENGTH = 50

const LETTERS = [...'abcdefghijklmnopqrstuvwxyz0123456789']

const TimestampSet = {
  timestamp: 0,
  set: new Set<string>(),
}

const placeholder: string[] = new Array(4) // Pre-allocated reusable array for performance.

function createPrefixedId(prefix: string): string {
  const now = Date.now()

  if (now !== TimestampSet.timestamp) {
    TimestampSet.timestamp = now
    TimestampSet.set.clear()
  }

  let uniqueSuffix: undefined | string = undefined

  while (true) {
    for (let i = 0; i < placeholder.length; i++) {
      placeholder[i] = LETTERS[Math.floor(Math.random() * LETTERS.length)]!
    }

    uniqueSuffix = placeholder.join('')

    if (TimestampSet.set.has(uniqueSuffix) === false) {
      TimestampSet.set.add(uniqueSuffix)
      break
    }
  }

  const suffix = '-' + uniqueSuffix + now
  const fixedPrefix = prefix.toLowerCase().substring(0, MAX_LENGTH - suffix.length)

  return fixedPrefix + suffix
}

function createdInfixedId(prefix: string, ...infixes: ReadonlyArray<number | string>): string {
  let concatenation = prefix

  for (let i = 0; i < infixes.length; i++) {
    const infix = infixes[i]

    if (infix !== undefined) {
      concatenation += '-' + infix
    }
  }

  return createPrefixedId(concatenation)
}

export const SaxoBankRandom = {
  stream: {
    contextId: createPrefixedId.bind(undefined, 'stream-ctx'),
    referenceId: createdInfixedId.bind(undefined, 'stream-ref'),
  },
  order: {
    requestId: createdInfixedId.bind(undefined, 'order-req'),
    referenceId: createdInfixedId.bind(undefined, 'order-ref'),
  },
}
