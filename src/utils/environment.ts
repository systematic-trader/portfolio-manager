import { load } from 'jsr:@std/dotenv@0.225.3'

const record = { ...Deno.env.toObject(), ...(await load()) }

export const Environment = {
  keys: () => Object.keys(record),
  entries: () => Object.entries(record),
  get(key: string): string {
    const value = record[key]

    if (typeof value === 'string') {
      return value
    }

    throw new Error(`Environment variable ${key} is not defined`)
  },

  tryGet(key: string): string | undefined {
    return record[key]
  },
}
