function isObject(value: unknown): value is { readonly [key: string]: unknown } {
  return value !== null && typeof value === 'object' && Array.isArray(value) === false
}

/**
 * Merges a base object with a delta compressed object.
 * This is done by iterating over the keys of the delta compressed object and setting the value of the base object to the value of the delta compressed object.
 *
 * @returns A new object with the merged values.
 */
export function mergeDeltaCompressedValue(
  base: { [key: string]: unknown },
  deltaCompressed: { [key: string]: unknown },
): { [key: string]: unknown } {
  const result = { ...base }

  for (const key of Object.keys(deltaCompressed)) {
    const baseValue = base[key]
    const deltaCompressedValue = deltaCompressed[key]

    if (isObject(baseValue) && isObject(deltaCompressedValue)) {
      result[key] = mergeDeltaCompressedValue(baseValue, deltaCompressedValue)
    } else {
      result[key] = deltaCompressedValue
    }
  }

  return result
}
