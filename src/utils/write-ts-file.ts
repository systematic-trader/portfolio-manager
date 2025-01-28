import { Formatter } from 'https://deno.land/x/deno_fmt@0.1.5/mod.ts'
import { EOL } from 'jsr:@std/fs'
import { FS } from './filesystem.ts'

let fmt: undefined | Formatter.Wasm = undefined

function typeOf(value: unknown): 'null' | 'boolean' | 'number' | 'string' {
  if (value === null) {
    return 'null'
  }

  switch (typeof value) {
    case 'boolean':
      return 'boolean'
    case 'number':
      return 'number'
    case 'string':
      return 'string'
    default:
      throw new Error(`Unsupported type: ${typeof value}`)
  }
}

export class TSObject {
  readonly props: ReadonlyArray<TSProperty>
  readonly as: undefined | 'const'

  constructor(options: {
    readonly props: ReadonlyArray<TSProperty>
    readonly as?: undefined | 'const'
  }) {
    this.props = options.props
    this.as = options.as
  }

  toJSONString(): string {
    const props = this.props.map((property) => `${property.toJSONString(':')}`).join(`,`)

    if (this.as === 'const') {
      return `{${props}} as const`
    }

    return `{${props}}`
  }
}

export class TSClass {
  readonly props: ReadonlyArray<TSProperty>

  constructor(
    options: { readonly props: ReadonlyArray<TSProperty> },
  ) {
    this.props = options.props
  }

  toJSONString(): string {
    const props = this.props.map((property) => {
      return property.static ? `static ${property.toJSONString('=')}` : `${property.toJSONString(':')}`
    }).join(EOL)

    return `{${props}}`
  }
}

export class TSProperty {
  readonly key: string
  readonly static: boolean
  readonly value:
    | boolean
    | number
    | string
    | ReadonlyArray<boolean | number | string>
    | TSObject
    | TSValue
    | TSClass

  constructor(
    options: {
      readonly key: string
      readonly static?: boolean
      readonly value:
        | boolean
        | number
        | string
        | ReadonlyArray<boolean | number | string>
        | TSObject
        | TSValue
        | TSClass
    },
  ) {
    this.key = options.key
    this.static = options.static ?? false
    this.value = options.value
  }

  toJSONString(separator: string): string {
    if (this.value instanceof TSObject) {
      return `${JSON.stringify(this.key)}${separator} ${this.value.toJSONString()}`
    }

    if (this.value instanceof TSValue) {
      return `${JSON.stringify(this.key)}${separator} ${this.value.toJSONString()}`
    }

    if (this.value instanceof TSClass) {
      return `${JSON.stringify(this.key)}${separator} class ${this.value.toJSONString()}`
    }

    return `${JSON.stringify(this.key)}${separator} ${JSON.stringify(this.value)}`
  }
}

export class TSValue {
  readonly value: boolean | number | string | ReadonlyArray<boolean | number | string>
  readonly as: undefined | 'const' | 'typeof'

  constructor(
    options: {
      readonly value: boolean | number | string | ReadonlyArray<boolean | number | string>
      readonly as?: undefined | 'const' | 'typeof'
    },
  ) {
    this.value = options.value
    this.as = options.as
  }

  toJSONString(): string {
    if (Array.isArray(this.value)) {
      if (this.as === 'typeof') {
        const types = this.value.map((item) => typeOf(item)).join(' | ')
        return `${JSON.stringify(this.value)} as ${types}`
      } else if (this.as === 'const') {
        return `${JSON.stringify(this.value)} as const`
      } else {
        return JSON.stringify(this.value)
      }
    } else {
      if (this.as === 'typeof') {
        return `${JSON.stringify(this.value)} as ${typeOf(this.value)}`
      } else if (this.as === 'const') {
        return `${JSON.stringify(this.value)} as const`
      } else {
        return JSON.stringify(this.value)
      }
    }
  }
}

export interface WriteTSFileOptions {
  readonly filePath: string
  readonly constants: ReadonlyArray<{ readonly name: string; readonly content: TSObject | TSValue | TSClass }>
}

export async function convertTSContent(
  name: string,
  content: TSObject | TSValue | TSClass,
): Promise<string> {
  if (fmt === undefined) {
    fmt = await Formatter.init({
      options: {
        indentWidth: 2,
        useTabs: false,
        semiColons: false,
        singleQuote: true,
      },
    })
  }

  if (content instanceof TSClass) {
    return await fmt.format(`export class ${name} ${content.toJSONString()}${EOL}`)
  }

  return await fmt.format(`export const ${name} = ${content.toJSONString()}${EOL}`)
}

export async function writeTSFile(options: WriteTSFileOptions): Promise<void> {
  const content = (await Promise.all(
    options.constants.map(({ name, content }) => convertTSContent(name, content)),
  )).join(EOL)

  await writeTSFileContent({
    filePath: options.filePath,
    content,
  })
}

export interface WriteTSFileContentOptions {
  readonly filePath: string
  readonly content: string
}

export async function writeTSFileContent(options: WriteTSFileContentOptions): Promise<void> {
  if (fmt === undefined) {
    fmt = await Formatter.init({
      options: {
        indentWidth: 2,
        useTabs: false,
        semiColons: false,
        singleQuote: true,
      },
    })
  }

  const formatted = await fmt.format(options.content)

  await FS.writeFile(
    options.filePath,
    formatted,
    {
      create: true,
      mkdir: true,
    },
  )
}
