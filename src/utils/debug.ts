import { Environment } from './environment.ts'

/**
 * A function that writes one or more messages for debugging purposes.
 * @param messages - The messages to write as part of the debug output.
 */
export interface WriteDebug {
  /**
   * Write one or more messages for debugging purposes.
   */
  (...messages: unknown[]): void

  /**
   * Extends the current namespace by appending an additional segment, creating a new debug function for the extended namespace.
   * @param name - The name of the sub-namespace to append.
   * @returns A function bound to the extended namespace.
   */
  extend(name: string): WriteDebug

  enabled: boolean
}

/**
 * Represents a function that, given a category string, returns a `WriteDebug` function.
 * If the category matches a configured debug pattern, `WriteDebug` will output messages.
 * Otherwise, it will do nothing.
 */
export interface Debug {
  /**
   * Given a category string, returns a `WriteDebugLine` function.
   */
  (category: string): WriteDebug
}

export interface DebugOptions {
  /**
   * The debug pattern to use for filtering categories (e.g. "api:*,db").
   */
  readonly pattern?: undefined | string

  /**
   * The function to write debug lines. Defaults to `console.debug`.
   */
  readonly write?: undefined | ((...messages: unknown[]) => void)

  /**
   * Whether to include a timestamp in the debug output. Defaults to `true`.
   */
  readonly timestamp?: undefined | boolean

  /**
   * Whether to include colors in the debug output. Defaults to `true`.
   */
  readonly colors?: undefined | boolean
}

/**
 * Internal normalized debug options with all defaults resolved.
 */
interface NormalizedDebugOptions extends Required<Omit<DebugOptions, 'pattern'>> {}

const writeNothing = ((): void => {}) as WriteDebug
writeNothing.extend = (): WriteDebug => writeNothing
writeNothing.enabled = false

/**
 * Returns a no-op debug write function. Useful when no namespaces are enabled or debug is not desired.
 */
function debugNothing(): WriteDebug {
  return writeNothing
}

const GREY = '\x1b[90m'
const RESET = '\x1b[0m'

/**
 * Returns a colored string using a 256-color escape code.
 *
 * @param content - The string content to colorize.
 * @param color - The 256-color code to use.
 * @returns The colorized string.
 */
function colorize(content: string, color: number): string {
  return `\x1b[38;5;${color}m${content}${RESET}`
}

/**
 * Selects a color index based on a hash of the namespace string.
 *
 * @param name - The namespace name to hash.
 * @returns A 256-color index to use for coloring.
 */
function selectColor(name: string): number {
  const FNV_OFFSET = 0x811c9dc5
  const FNV_PRIME = 0x01000193
  let hash = FNV_OFFSET

  let length = name.indexOf(':')

  if (length === -1) {
    length = name.length
  }

  for (let i = 0; i < length; i++) {
    hash ^= name.charCodeAt(i)
    hash = Math.imul(hash, FNV_PRIME)
  }

  // Convert to a positive 32-bit integer and modulo by Colors.length for indexing
  const index = Math.abs(hash >>> 0) % Colors.length
  return Colors[index] as number
}

/**
 * Creates a function for a given namespace and options.
 *
 * @param name - The debug namespace.
 * @param options - The normalized debug options.
 * @returns A function bound to the given namespace.
 */
function namespace(
  name: string,
  options: NormalizedDebugOptions,
): WriteDebug {
  // color of category where colon is grey and not bold

  const selectedColor = selectColor(name)
  const coloredName = options.colors === false
    ? name
    : name.split(':').map((part) => colorize(part, selectedColor)).join(':')

  const prependMessages: unknown[] = []
  const unshift = Array.prototype.unshift
  const write = options.write

  const writeDebug: WriteDebug = (...messages: unknown[]): void => {
    try {
      if (options.timestamp) {
        if (options.colors) {
          prependMessages.push(`${GREY}${new Date().toISOString()}${RESET}`)
        } else {
          prependMessages.push(new Date().toISOString())
        }
      }

      prependMessages.push(coloredName)

      unshift.apply(messages, prependMessages)

      write.apply(undefined, messages)
    } finally {
      prependMessages.length = 0
    }
  }

  writeDebug.extend = (subName: string): WriteDebug => {
    return namespace(name + ':' + subName, options)
  }

  writeDebug.enabled = true

  return writeDebug
}

/**
 * Converts a combined pattern string (e.g. "api:*,db" or "websocket:*,-websocket:open*")
 * into a single RegExp that matches if:
 * - The input matches at least one inclusion pattern (or `*` for all), AND
 * - The input does NOT match any exclusion pattern.
 *
 * Steps:
 * - Split the input pattern by `,` to handle multiple patterns.
 * - For each pattern:
 *   - If it starts with `-`, treat as exclusion pattern (remove the `-`).
 *   - Otherwise, treat as inclusion pattern.
 * - If `'*'` is included in the inclusions, that means "match everything except excludes".
 * - Construct a combined regex using a negative look-ahead for excludes and then
 *   either `.*` (if `'*'`) or an alternation of the inclusion patterns.
 *
 * @param pattern - A string of debug patterns separated by `,`.
 * @returns A RegExp object that matches if the input string matches the include rules and not the exclude rules.
 */
function patternToRegex(pattern: string): RegExp {
  const parts = pattern
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  if (parts.length === 0) {
    // No patterns provided: never match
    return /^$/
  }

  const includes: string[] = []
  const excludes: string[] = []

  for (const p of parts) {
    if (p.startsWith('-')) {
      excludes.push(p.slice(1))
    } else {
      includes.push(p)
    }
  }

  // If includes contain '*', it means match everything unless excluded
  const hasStar = includes.includes('*')

  // Convert patterns to regex fragments
  const escapeAndConvert = (p: string) => {
    const escaped = p.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
    return escaped.replace(/\*/g, '.*')
  }

  const excludeRegexPart = excludes.length > 0 ? excludes.map(escapeAndConvert).map((r) => `(?:${r})`).join('|') : ''

  let excludeLookahead = ''
  if (excludeRegexPart) {
    // Negative look-ahead to ensure not matching any exclude pattern
    excludeLookahead = `(?!${excludeRegexPart})`
  }

  if (hasStar) {
    // If we have '*', match everything except what is excluded
    return new RegExp(`^${excludeLookahead}.*$`)
  } else {
    if (includes.length === 0) {
      // No includes and no '*', never match
      return /^$/
    }
    const includeRegexPart = includes
      .map(escapeAndConvert)
      .map((r) => `(?:${r})`)
      .join('|')

    return new RegExp(`^${excludeLookahead}(?:${includeRegexPart})$`)
  }
}

function isEnvironmentTrue(value: undefined | string, fallback = false): boolean {
  if (value === undefined) {
    return fallback
  }

  switch (value.toLowerCase().trim()) {
    case '1':
    case 'on':
    case 'true':
    case 'yes': {
      return true
    }

    default: {
      return false
    }
  }
}

/**
 * Initializes a debug function configured with given patterns and options.
 *
 * For example, if `pattern` = "api:*,db", any category starting with "api:" or exactly "db"
 * will produce output. Others will not.
 *
 * @param options - Configuration for debug pattern, output, colors, and timestamp.
 * @returns A `Debug` function that, given a category, returns a `WriteDebug` function.
 *
 * @example
 * ```typescript
 * const debug = createDebug({ pattern: 'api:*,db', write: console.debug })
 *
 * // Matches 'api:users', will output messages
 * debug('api:users')('request started', { userId: 123 })
 *
 * // Matches 'db', will output messages
 * debug('db')('query executed', { sql: 'SELECT * FROM table' })
 *
 * // Does not match, no output
 * debug('auth')('login attempt')
 * ```
 */
export function createDebug(
  // pattern: undefined | string = Environment['DEBUG'],
  // write: undefined | WriteDebugLine = console.debug.bind(console),
  {
    pattern = Environment['DEBUG'],
    write = console.debug.bind(console),
    colors = isEnvironmentTrue(Environment['DEBUG_COLORS'], true),
    timestamp = isEnvironmentTrue(Environment['DEBUG_TIMESTAMP'], true),
  }: DebugOptions = {},
): Debug {
  if (pattern === undefined || pattern.length === 0) {
    return debugNothing
  }

  // Only enable colors if stdout is a terminal and colors is true
  const colorEnabled = Deno.stdout.isTerminal() && colors

  // Convert each pattern into a regex
  const regex = patternToRegex(pattern)

  return function debug(category: string): WriteDebug {
    if (category.length === 0) {
      throw new Error('Debug category must not be empty')
    }

    // Check if the category matches any of the patterns
    if (regex.test(category)) {
      return namespace(category, { colors: colorEnabled, timestamp, write })
    }

    return writeNothing
  }
}

/**
 * A default `Debug` instance constructed from the `Environment.DEBUG` variable and `console.debug`.
 * If no `Environment.DEBUG` is set, it returns a no-op debug function.
 *
 * @example
 * ```typescript
 * // If Environment.DEBUG = "foo:*"
 * Debug('foo:bar')('hello') // Will produce debug output
 *
 * Debug('bar')('no output') // Will not produce debug output
 * ```
 */
export const Debug: Debug = createDebug()

const Colors = [
  20,
  21,
  26,
  27,
  32,
  33,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  56,
  57,
  62,
  63,
  68,
  69,
  74,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  92,
  93,
  98,
  99,
  112,
  113,
  128,
  129,
  134,
  135,
  148,
  149,
  160,
  161,
  162,
  163,
  164,
  165,
  166,
  167,
  168,
  169,
  170,
  171,
  172,
  173,
  178,
  179,
  184,
  185,
  196,
  197,
  198,
  199,
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  209,
  214,
  215,
  220,
  221,
]
