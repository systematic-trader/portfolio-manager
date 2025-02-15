/**
 * The Interactive Brokers API returns sparse data with null-values.
 *
 * This function removes does the following:
 *  - Removes null-values
 *  - Trims all strings (whitespace pre- and postfixes are removed)
 *  - Removes empty strings
 */
export function sanitize(value: unknown): unknown {
  switch (typeof value) {
    case 'object': {
      if (value === null) {
        return undefined
      }

      if (Array.isArray(value)) {
        const arrayValue = value.reduce((accumulation, item) => {
          const sanitizedItem = sanitize(item)

          if (sanitizedItem !== undefined) {
            accumulation.push(sanitizedItem)
          }

          return accumulation
        }, [])

        return arrayValue.length > 0 ? arrayValue : undefined
      }

      const record = value as Record<string, unknown>

      const sanitizedRecord = {} as Record<string, unknown>

      let hasDefinedProperty = false

      const propertyKeys = Object.keys(record).sort()

      for (const propertyKey of propertyKeys) {
        const propertyValue = record[propertyKey]

        const sanitizedValue = sanitize(propertyValue)

        if (sanitizedValue !== undefined) {
          hasDefinedProperty = true
          sanitizedRecord[propertyKey] = sanitizedValue
        }
      }

      return hasDefinedProperty ? sanitizedRecord : undefined
    }

    case 'string': {
      const trimmed = value.trim()

      if (trimmed === '') {
        return undefined
      }

      return trimmed
    }

    default: {
      return value
    }
  }
}
