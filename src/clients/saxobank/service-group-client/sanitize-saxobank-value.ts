/**
 * The Saxo Bank API returns garbage data in some cases.
 * This function sanitizes the data and removes the garbage.
 */
export function sanitizeSaxobankValue(value: unknown): unknown {
  switch (typeof value) {
    case 'object': {
      if (value === null) {
        return undefined
      }

      if (Array.isArray(value)) {
        const arrayValue = value.reduce((accumulation, item) => {
          const sanitizedItem = sanitizeSaxobankValue(item)

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

        const sanitizedValue = sanitizeSaxobankValue(propertyValue)

        if (sanitizedValue !== undefined) {
          hasDefinedProperty = true
          sanitizedRecord[propertyKey] = sanitizedValue
        }
      }

      return hasDefinedProperty ? sanitizedRecord : undefined
    }

    case 'string': {
      let trimmedValue = value.trim()

      if (
        trimmedValue.length > 1 &&
        trimmedValue.at(-1) === '.' &&
        trimmedValue.at(-2) === ' '
      ) {
        // remove whitespaces preceeding the dot, but keep the dot
        trimmedValue = trimmedValue.replace(/\s*\.$/, '.')
      }

      if (trimmedValue === '') {
        return undefined
      }

      if (trimmedValue === '.') {
        return undefined
      }

      if (trimmedValue === 'Undefined') {
        return undefined
      }

      return trimmedValue
    }

    default: {
      return value
    }
  }
}
