import { GzipStream } from 'https://deno.land/x/compress@v0.4.6/mod.ts'
import { dirname, join } from 'jsr:@std/path'

export interface WriteFileOptions extends Deno.WriteFileOptions {
  /** If true, creates any directories in the path that do not exist. */
  readonly mkdir?: undefined | boolean
}

export type FilesystemType =
  | 'BlockDevice'
  | 'CharacterDevice'
  | 'Directory'
  | 'Fifo'
  | 'File'
  | 'Socket'
  | 'SymbolicLink'

export const FS = {
  dirname(filePath: string | URL): string {
    return dirname(filePath instanceof URL ? filePath.pathname : filePath)
  },

  async exists(filePath: string | URL): Promise<boolean> {
    try {
      await Deno.stat(filePath)
      return true
    } catch {
      return false
    }
  },

  async mkdir(
    filePath: string | URL,
    options?: undefined | { readonly recursive?: undefined | boolean },
  ): Promise<void> {
    await Deno.mkdir(filePath, { recursive: options?.recursive ?? false })
  },

  async remove(
    filePath: string | URL,
    options?: undefined | { readonly recursive?: undefined | boolean },
  ): Promise<boolean> {
    try {
      await Deno.remove(filePath, { recursive: options?.recursive ?? false })

      return true
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return false
      }

      throw error
    }
  },

  async writeFile(
    filePath: string | URL,
    data: string | Uint8Array | ReadableStream<Uint8Array>,
    options: undefined | WriteFileOptions = {},
  ): Promise<void> {
    const { mkdir, ...writeOptions } = options

    if (mkdir === true) {
      const directory = FS.dirname(filePath)
      const directoryStatus = await FS.typeOf(directory)

      if (directoryStatus === undefined) {
        await FS.mkdir(directory, { recursive: true })
      } else if (directoryStatus !== 'Directory') {
        throw new Error(`Path is ${directoryStatus}: ${directory}`)
      }
    }

    if (typeof data === 'string') {
      await Deno.writeTextFile(filePath, data, writeOptions)
    } else {
      await Deno.writeFile(filePath, data, writeOptions)
    }
  },

  async typeOf(path: string): Promise<undefined | FilesystemType> {
    try {
      const stats = await Deno.stat(path)

      return getFileInfoType(stats)
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return undefined
      }

      throw error
    }
  },

  async readdir(
    path: string,
    options?:
      | undefined
      | {
        readonly dot?: undefined | boolean
        readonly recursive?: undefined | boolean
        readonly types?: undefined | ReadonlyArray<FilesystemType>
        readonly extensions?: undefined | readonly string[]
      },
  ): Promise<ReadonlyArray<{ readonly name: string; readonly path: string; readonly type: FilesystemType }>> {
    const includeDot = options?.dot === true
    const recursive = options?.recursive === true
    const types = options?.types
    const extensions = options?.extensions?.map((extension) =>
      extension.startsWith('.') ? extension.slice(1) : extension
    )

    let result = await readDir(path, { recursive })

    if (includeDot === false) {
      result = result.filter((item) => item.name.startsWith('.') === false)
    }

    if (types !== undefined && types.length > 0) {
      result = result.filter((item) => types.includes(item.type))
    }

    if (extensions !== undefined && extensions.length > 0) {
      // extensions as 1 regex. 1) starting with a dot. 2) case insensitive. 3) ends with the extension
      // eslint-disable-next-line security/detect-non-literal-regexp, sonarjs/no-nested-template-literals -- allowed
      const regex = new RegExp(
        `${extensions.map((extension) => `\\.${extension}`).join('|')}$`,
        'i',
      )

      result = result.filter((item) => {
        const match = regex.test(item.name)

        regex.lastIndex = 0

        return match
      })
    }

    return result.sort((left, right) => left.name.localeCompare(right.name))
  },

  /**
   * Compresses a file using gzip to a specified output file.
   * @param inputFilePath Path to the file to be compressed.
   * @param gzipOutputPath Path where the compressed gzip file will be saved.
   */
  async compressFileToGzip(
    inputFilePath: string,
    gzipOutputPath: string,
    options?:
      | undefined
      | { readonly progress?: undefined | ((progress: string) => void) },
  ): Promise<void> {
    const gzip = new GzipStream()

    if (options?.progress !== undefined) {
      gzip.on('progress', options.progress)
    }

    await gzip.compress(inputFilePath, gzipOutputPath)
  },

  /**
   * Uncompresses a gzip file to a specified output file.
   * @param gzipFilePath Path to the gzip file to be uncompressed.
   * @param outputPath Path where the uncompressed file will be saved.
   */
  async uncompressGzipFile(
    gzipFilePath: string,
    outputPath: string,
    options?:
      | undefined
      | { readonly progress?: undefined | ((progress: string) => void) },
  ): Promise<void> {
    const gzip = new GzipStream()

    if (options?.progress !== undefined) {
      gzip.on('progress', options.progress)
    }

    await gzip.uncompress(gzipFilePath, outputPath)
  },

  async *readLines(filePath: string): AsyncGenerator<string, void, unknown> {
    let lastLine = ''

    const file = await Deno.open(filePath)

    const decoder = new TextDecoderStream()
    const lineStream = file.readable.pipeThrough(decoder).pipeThrough(
      new TransformStream<string, string>({
        transform(chunk, controller) {
          const lines = chunk.split('\n')
          lines[0] = lastLine + lines[0]
          lastLine = lines.pop()!
          lines.forEach((line) => controller.enqueue(line))
        },
        flush(controller) {
          if (lastLine.length > 0) {
            controller.enqueue(lastLine)
          }
        },
        start() {
          lastLine = ''
        },
      }),
    )

    const reader = lineStream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        yield value
      }
    } finally {
      reader.releaseLock()

      try {
        file.close()
      } catch {
        // ignore
      }
    }
  },
}

function getFileInfoType(item: Deno.FileInfo): FilesystemType {
  if (item.isDirectory) {
    return 'Directory'
  }

  if (item.isFile) {
    return 'File'
  }

  if (item.isSymlink) {
    return 'SymbolicLink'
  }

  if (item.isFifo) {
    return 'Fifo'
  }

  if (item.isSocket) {
    return 'Socket'
  }

  if (item.isCharDevice) {
    return 'CharacterDevice'
  }

  if (item.isBlockDevice) {
    return 'BlockDevice'
  }

  throw new Error('Unknown file type')
}

function getDirEntryType(item: Deno.DirEntry): FilesystemType {
  if (item.isDirectory) {
    return 'Directory'
  }

  if (item.isFile) {
    return 'File'
  }

  if (item.isSymlink) {
    return 'SymbolicLink'
  }

  throw new Error('Unknown file type')
}

async function readDir(
  path: string,
  options?: undefined | { readonly recursive?: boolean },
): Promise<
  Array<{
    readonly path: string
    readonly name: string
    readonly type: FilesystemType
  }>
> {
  const recursive = options?.recursive === true

  const entries: {
    readonly path: string
    readonly name: string
    readonly type: FilesystemType
  }[] = []

  for await (const entry of Deno.readDir(path)) {
    if (recursive && entry.isDirectory) {
      const subEntries = await readDir(join(path, entry.name), options)

      entries.push(...subEntries)
    } else {
      entries.push({
        path: join(path, entry.name),
        name: entry.name,
        type: getDirEntryType(entry),
      })
    }
  }

  return entries.sort((left, right) => left.path.localeCompare(right.path))
}
