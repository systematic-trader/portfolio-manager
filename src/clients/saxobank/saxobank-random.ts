const MAX_LENGTH = 50

const LETTERS = [...'abcdefghijklmnopqrstuvwxyz0123456789']

const TimestampSet = {
  timestamp: 0,
  set: new Set<string>(),
}

const placeholder: string[] = new Array(4)

function createId(prefix: string): string {
  if (prefix === 'context') {
    throw new Error('Prefix cannot be "context". It is reserved for the contextId')
  }

  const now = Date.now()

  if (now !== TimestampSet.timestamp) {
    TimestampSet.timestamp = now
    TimestampSet.set.clear()
  }

  let random: undefined | string = undefined

  while (true) {
    for (let i = 0; i < placeholder.length; i++) {
      placeholder[i] = LETTERS[Math.floor(Math.random() * LETTERS.length)]!
    }

    random = placeholder.join('')

    if (TimestampSet.set.has(random) === false) {
      TimestampSet.set.add(random)
      break
    }
  }

  const suffix = '-' + random + '-' + now.toString()

  return prefix.toLowerCase().substring(0, MAX_LENGTH - suffix.length) + suffix
}

export function createStreamContextId(): string {
  return createId('stream-ctx')
}

export function createStreamReferenceId(prefix: string): string {
  return createId('stream-ref-' + prefix)
}
