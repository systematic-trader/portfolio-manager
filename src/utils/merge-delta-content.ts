function isDeltaObject(value: unknown): value is { readonly [key: string]: unknown } {
  return value !== null && typeof value === 'object' && Array.isArray(value) === false
}

/**
 * Merges a base object with a delta.
 * This is done by iterating over the keys of the delta and setting the value of the base object to the value of the delta.
 *
 * @returns A new object with the merged values.
 */
export function mergeDeltaContent(
  base: { [key: string]: unknown },
  delta: unknown,
): { [key: string]: unknown } {
  if (isDeltaObject(delta) === false) {
    throw new Error(`Expected object, got ${delta}`)
  }

  const result = { ...base }

  for (const key of Object.keys(delta)) {
    const baseValue = base[key]
    const deltaCompressedValue = delta[key]

    if (isDeltaObject(baseValue) && isDeltaObject(deltaCompressedValue)) {
      result[key] = mergeDeltaContent(baseValue, deltaCompressedValue)
    } else {
      result[key] = deltaCompressedValue
    }
  }

  return result
}
