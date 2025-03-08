export function extractKeys<T extends object>(object: T): ReadonlyArray<keyof T> {
  return Object.keys(object) as unknown as ReadonlyArray<keyof T>
}

export function extractValues<T extends object>(
  object: {
    readonly [K in keyof T]: T[K]
  },
): ReadonlyArray<T[keyof T]> {
  return Object.values<T[keyof T]>(object)
}

export function extractEntries<T extends Record<keyof never, unknown>>(
  object: {
    readonly [K in keyof T]: T[K]
  },
): ReadonlyArray<{ readonly [K in keyof T]: readonly [K, T[K]] }[keyof T]> {
  return Object.entries(object)
}

export function fromEntries<T extends readonly [keyof never, unknown]>(
  entries: readonly T[],
): { readonly [key in T[0]]: Extract<T, readonly [key, unknown]>[1] } {
  return Object.fromEntries(entries) as { readonly [key in T[0]]: Extract<T, readonly [key, unknown]>[1] }
}

export function invertRecord<T extends Record<string, string>>(record: T): {
  readonly [K in keyof T as T[K]]: K
} {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [value, key])) as {
    readonly [K in keyof T as T[K]]: K
  }
}

export function pick<T extends object, K extends keyof T>(
  object: T,
  keys: readonly K[],
): { readonly [P in keyof Pick<T, K>]: Pick<T, K>[P] } {
  const output = {} as Record<K, unknown>

  for (const key of keys) {
    if (key in object) {
      output[key] = object[key]
    }
  }

  return output as { readonly [P in keyof Pick<T, K>]: Pick<T, K>[P] }
}
