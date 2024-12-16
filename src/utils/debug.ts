// deno-lint-ignore-file no-console
import { Environment } from './environment.ts'

/**
 * A function that writes one or more messages for debugging purposes.
 * @param messages - The messages to write as part of the debug output.
 */
export interface WriteDebugLine {
  /**
   * Write one or more messages for debugging purposes.
   */
  (...messages: unknown[]): void
}

/**
 * Represents a function that, given a category string, returns a `WriteDebugLine` function.
 * If the category matches a configured debug pattern, `WriteDebugLine` will output messages.
 * Otherwise, it will do nothing.
 */
export interface Debug {
  /**
   * Given a category string, returns a `WriteDebugLine` function.
   */
  (category: string): WriteDebugLine
}

const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

const writeNothing = ((): void => {}) as WriteDebugLine

/**
 * Returns a no-op debug logging function. Useful when no categories are enabled or debug is not desired.
 * @returns A `WriteDebugLine` function that does nothing.
 */
function debugNothing(): WriteDebugLine {
  return writeNothing
}

/**
 * Binds the provided write function to the specified category. When invoked, it will prepend
 * the category in bold and reset formatting afterwards.
 *
 * @param category - The debug category name.
 * @param write - The underlying function that writes debug lines.
 * @returns A `WriteDebugLine` function bound to the given category.
 */
function debugCategory(
  category: string,
  write: WriteDebugLine,
): WriteDebugLine {
  return write.bind(undefined, BOLD + category + RESET)
}

/**
 * Converts a given pattern (potentially containing '*' wildcards) into a RegExp object that matches
 * the entire string. The pattern can be something like "abc:*", which would match any category
 * starting with "abc:" followed by any characters.
 *
 * **Algorithm:**
 * - Escape all regex special characters except '*'.
 * - Replace '*' with '.*' to allow arbitrary sequences of characters.
 * - Add `^` and `$` anchors to ensure full-string matching.
 *
 * @param pattern - The original string pattern, which may contain `*` wildcards.
 * @returns A RegExp object constructed to fully match any string conforming to the pattern.
 */
function patternToRegex(pattern: string): RegExp {
  // Escape regex chars, but leave * as is for now
  const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
  // Now replace * with .*
  const regexString = '^' + escaped.replace(/\*/g, '.*') + '$'
  return new RegExp(regexString)
}

/**
 * Initializes a debug function configured with a given set of category patterns.
 * If the `DEBUG` environment variable or the `pattern` argument is set to something like
 * "abc:*;xyz", then any category starting with `abc:` or exactly `xyz` will produce output.
 *
 * Multiple patterns can be separated by `;`. Each pattern can contain zero or more `*` wildcards.
 *
 * @param pattern - A string of debug patterns separated by `;`. Defaults to `Environment.DEBUG`.
 * @param write - A function to write debug lines. Defaults to `console.debug`.
 * @returns A `Debug` function that, when given a category, returns a `WriteDebugLine` function
 *          that either logs with the given category or does nothing, depending on the match.
 *
 * @example
 * ```typescript
 * const debug = createDebug('api:*;db', console.debug)
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
  pattern: undefined | string = Environment['DEBUG'],
  write: undefined | WriteDebugLine = console.debug,
): Debug {
  if (pattern === undefined || pattern.length === 0) {
    return debugNothing
  }

  // Split by ';' to allow multiple pattern segments
  const multiPatterns = pattern.split(';').filter((part) => part.length > 0)

  // Convert each pattern into a regex
  const regexes = multiPatterns.map((p) => patternToRegex(p))

  return function debug(category: string): WriteDebugLine {
    if (category.length === 0) {
      throw new Error('Debug category must not be empty')
    }

    // Check if the category matches any of the patterns
    for (const regex of regexes) {
      if (regex.test(category)) {
        return debugCategory(category, write)
      }
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
