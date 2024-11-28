const MAX_LENGTH = 50

const LETTERS = [...'abcdefghijklmnopqrstuvwxyz0123456789']

const TimestampSet = {
  timestamp: 0,
  set: new Set<string>(),
}

const placeholder: string[] = new Array(4) // Pre-allocated reusable array for performance.

function createId(prefix: string): string {
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

  const suffix = '-' + uniqueSuffix + '-' + now
  const fixedPrefix = prefix.toLowerCase().substring(0, MAX_LENGTH - suffix.length)

  return fixedPrefix + suffix
}

export function createStreamContextId(): string {
  return createId('stream-ctx')
}

export function createStreamReferenceId(
  identifier: number | string,
  ...identifiers: ReadonlyArray<number | string>
): string {
  let ident = String(identifier)

  for (let i = 0; i < identifiers.length; i++) {
    ident += '-' + identifiers[i]
  }

  return createId('stream-ref-' + ident)
}
