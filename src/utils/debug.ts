// deno-lint-ignore-file no-console
import { Environment } from './environment.ts'

export interface WriteDebugLine {
  (...messages: unknown[]): void
}

export interface Debug {
  (category: string): WriteDebugLine
}

const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

const writeNothing = ((): void => {}) as WriteDebugLine

function debugCategory(
  category: string,
  write: WriteDebugLine,
): WriteDebugLine {
  return write.bind(undefined, BOLD + category + RESET)
}

export function initializeDebug(
  pattern: undefined | string = Environment['DEBUG'],
  write: undefined | WriteDebugLine = console.log,
): Debug {
  if (pattern === undefined || pattern.length === 0) {
    return function debugNothing(): WriteDebugLine {
      return writeNothing
    }
  }

  const multiPatterns = pattern
    .split(';')
    .filter((pattern) => pattern.length > 0)
    .map((pattern) =>
      pattern
        .split(':')
        .filter((category) => category.length > 0)
        .map((category) =>
          category === '*'
            ? /.*/
            : category.includes('*')
            ? new RegExp(category.replace(/\*/g, '.*'))
            : new RegExp(`^${category}$`)
        )
    )
    .filter((regexes) => regexes.length > 0)

  return function debug(category: string): WriteDebugLine {
    if (category.length === 0) {
      throw new Error('Debug category must not be empty')
    }

    if (pattern === '*') {
      return debugCategory(category, write)
    }

    const categoryParts = category.split(':')

    for (const regexes of multiPatterns) {
      for (let i = 0; i < regexes.length; i++) {
        if (i >= categoryParts.length) {
          break
        }

        const regex = regexes[i] as RegExp
        const categoryPart = categoryParts[i]

        if (categoryPart === undefined || regex.test(categoryPart) === false) {
          break
        }

        if (i === regexes.length - 1) {
          return debugCategory(category, write)
        }
      }
    }

    return writeNothing
  }
}

export const Debug: Debug = initializeDebug()
