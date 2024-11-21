export type SearchParam = undefined | boolean | number | string | ReadonlyArray<number | string>

export type SearchParamsRecord = Record<string, SearchParam>

export class ServiceGroupRequestSearchParams {
  readonly #searchParams: URLSearchParams

  get length(): number {
    return this.#searchParams.toString().length
  }

  constructor(searchParamsRecord?: undefined | SearchParamsRecord) {
    this.#searchParams = new URLSearchParams()

    if (searchParamsRecord !== undefined) {
      const status = this.setRecord(searchParamsRecord)

      if (status === false) {
        throw new Error(`Search parameters too long: ${this.#searchParams.toString()}`) // todo throw a specific error
      }
    }
  }

  setRecord(record: undefined | SearchParamsRecord): boolean {
    if (record === undefined) {
      return true
    }

    for (const [key, value] of Object.entries(record)) {
      if (value === undefined) {
        continue
      }

      if (this.set(key, value) === false) {
        return false
      }
    }

    return true
  }

  /**
   * Set the value for a given search parameter, overwriting any existing value.
   * @param key The key of the search parameter to set
   * @param value The value of the search parameter to set
   * @returns true if the value was set, false if the value was not set because it would make the search parameters too long
   */
  set(key: string, value: undefined | SearchParam): boolean {
    const newValue = String(value)

    if (newValue === '') {
      return true // don't include empty values
    }

    const currentValue = this.get(key)

    this.#searchParams.set(key, newValue)

    if (this.length > 2048) { // todo load from config
      if (currentValue === undefined) {
        this.delete(key)
        return false
      } else {
        this.#searchParams.set(key, currentValue)
        return false
      }
    }

    return true
  }

  get(key: string): undefined | string {
    return this.#searchParams.get(key) ?? undefined
  }

  has(key: string): boolean {
    return this.#searchParams.has(key)
  }

  delete(key: string): boolean {
    const deleted = this.has(key)
    this.#searchParams.delete(key)
    return deleted
  }

  clear(): void {
    this.#searchParams.forEach((_, key) => {
      this.#searchParams.delete(key)
    })
  }

  toString(): string {
    return this.#searchParams.toString()
  }
}
