/**
 * Splits the elements of an array into two roughly equal sized arrays.
 * @param array The array to split, which must have at least two elements.
 * @returns A tuple containing two arrays, the first containing the first half of the elements and the second containing the second half.
 */
export function bifurcateArray<T>(array: T[]): readonly [readonly T[], readonly T[]] {
  if (array.length === 0 || array.length === 1) {
    throw new Error('Array must have at least two elements')
  }

  const middle = Math.ceil(array.length / 2)

  const left = array.slice(0, middle)
  const right = array.slice(middle)

  return [left, right]
}
