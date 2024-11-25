export type SearchParamValue = undefined | boolean | number | string | ReadonlyArray<number | string>

export type SearchParamRecord = Record<string, SearchParamValue>

/**
 * Error indicating that the length of search parameters exceeds the limit for Saxo Bank's OpenAPI.
 *
 * The API has a poorly documented limit of 2048 characters for search parameters, confirmed via support.
 * It is uncertain whether this limit is global or varies by endpoint.
 *
 * When this limit is exceeded, the API responds with an HTTP 404 status and an HTML body.
 * While counter-intuitive, this behavior has been confirmed by support to be intentional.
 *
 * To avoid encountering this error, ensure search parameters stay within the limit.
 * If this error is thrown, consider reducing the search parameter length by splitting a single request
 * into multiple smaller ones. For example, when retrieving instrument details for a list of UICs, split
 * the list into smaller chunks and perform multiple requests.
 *
 * Utility classes such as `ServiceGroupRequestSearchParams` can assist in constructing search parameters.
 */
export class SearchParamsMaxLengthExceededError extends Error {
  readonly searchParams: URLSearchParams

  readonly maxLength: number

  constructor(
    searchParams: URLSearchParams,
    maxLength: number,
  ) {
    const searchParamsString = searchParams.toString()

    const errorMessage = [
      'The length of the search parameters exceeds the maximum allowed limit.',
      `Length of provided parameters: ${searchParamsString.length}. Maximum allowed: ${maxLength}.`,
      'Provided parameters:',
      searchParamsString,
    ].join('\n')

    super(errorMessage)

    this.name = this.constructor.name
    this.searchParams = new URLSearchParams(searchParams)
    this.maxLength = maxLength
  }
}

export class ServiceGroupSearchParams {
  #searchParams: URLSearchParams
  readonly #maxLength: number

  /**
   * The length of the search parameters as a string.
   */
  get length(): number {
    return this.#searchParams.toString().length
  }

  /**
   * Constructs a new instance of the ServiceGroupRequestSearchParams class.
   *
   * @param values
   * The initial search parameters to set.
   * If a search parameter is set to `undefined`, it will be ignored.
   *
   * @param maxLength
   * The maximum length of the search parameters.
   * If the search parameters exceed this length, a `SearchParamsTooLongError` will be thrown.
   *
   * @throws `SearchParamsMaxLengthExceededError` if the initial search parameter record exceeds the given limit
   */
  constructor({ values, maxLength }: {
    readonly values?: undefined | SearchParamRecord
    readonly maxLength: number
  }) {
    this.#searchParams = new URLSearchParams()
    this.#maxLength = maxLength

    if (values !== undefined) {
      let success = true

      for (const [key, value] of Object.entries(values)) {
        if (value === undefined) {
          continue
        }

        success &&= this.#set(key, value, true)
      }

      if (success === false) {
        throw new SearchParamsMaxLengthExceededError(this.#searchParams, this.#maxLength)
      }
    }
  }

  #set(key: string, value: undefined | SearchParamValue, force = false): boolean {
    const newValue = String(value)

    if (newValue === '') {
      return true // don't include empty values
    }

    const previousValue = this.get(key)

    this.#searchParams.set(key, newValue)

    // If the length of the search parameters is within the maximum length, return true
    if (this.length <= this.#maxLength) {
      return true
    }

    // If we are forcing the change, we don't need to revert the change
    if (force === true) {
      return false
    }

    // Otherwise, we need to revert the change
    if (previousValue === undefined) {
      this.delete(key)
      return false
    } else {
      this.#searchParams.set(key, previousValue)
      return false
    }
  }

  /**
   * Set the value for a given search parameter, overwriting any existing value.
   *
   * @param key The key of the search parameter to set
   * @param value The value of the search parameter to set
   *
   * @returns true if the value was set, false if the value was not set because it would make the search parameters too long
   */
  set(key: string, value: undefined | SearchParamValue): boolean {
    return this.#set(key, value)
  }

  /**
   * Sets the search parameters to the given record.
   * This will overwrite any existing search parameters.
   *
   * @param values
   * The search parameters to set.
   * If a search parameter is set to `undefined`, it will be ignored.
   * If the search parameters exceed the maximum length, they will not be set.
   *
   * @returns
   *  - `true` if the search parameters were set successfully.
   *  - `false` if the search parameters would exceed the maximum length.
   */
  setValues(values: SearchParamRecord): boolean {
    const previousSearchParams = new URLSearchParams(this.#searchParams)

    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) {
        continue
      }

      if (this.set(key, value) === false) {
        this.#searchParams = previousSearchParams
        return false
      }
    }

    return true
  }

  /**
   * Get the first value associated to the given search parameter.
   * @returns The value of the search parameter, or `undefined` if the search parameter does not exist.
   */
  get(key: string): undefined | string {
    return this.#searchParams.get(key) ?? undefined
  }

  /**
   * Get all the values association with a given search parameter.
   * @returns An array of values associated with the search parameter, or an empty array if the search parameter does not exist.
   */
  getAll(key: string): string[] {
    return this.#searchParams.getAll(key)
  }

  /**
   * Check if a given search parameter exists.
   * @returns `true` if the search parameter exists, `false` if it does not.
   */
  has(key: string): boolean {
    return this.#searchParams.has(key)
  }

  /**
   * Deletes the given search parameter, and its associated value, from the list of all search parameters.
   * @param key The key of the search parameter to delete.
   * @returns `true` if the search parameter was deleted, `false` if it did not exist.
   */
  delete(key: string): boolean {
    const deleted = this.has(key)
    this.#searchParams.delete(key)
    return deleted
  }

  /**
   * Clear all search parameters.
   */
  clear(): void {
    this.#searchParams = new URLSearchParams()
  }

  /**
   * Returns a string containing a query string suitable for use in a URL.
   * Does not include the question mark.
   */
  toString(): string {
    return this.#searchParams.toString()
  }
}
