import { isIterable } from './iterable.ts'

/**
 * Determines whether a given value is an AsyncIterable.
 *
 * @param value - The value to be checked.
 *
 * @returns A type guard indicating whether the value is an AsyncIterable of type T.
 *
 * @example
 * const asyncArray = async function*() { yield 1; };
 * console.log(isAsyncIterable(asyncArray()));  // Outputs: true
 *
 * console.log(isAsyncIterable([1, 2, 3]));  // Outputs: false
 */
export function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- intentional
  return typeof (value as Partial<AsyncIterable<T>>)?.[Symbol.asyncIterator] === 'function'
}

/**
 * Ensures that a given iterable is an AsyncIterable. If the input is already an AsyncIterable,
 * it returns the input as is. If the input is a regular Iterable, it transforms it into an AsyncIterable.
 *
 * @param iterable - The Iterable or AsyncIterable object.
 *
 * @returns An AsyncIterable based on the given Iterable or AsyncIterable.
 *
 * @example
 * const regularArray = [1, 2, 3];
 * const asyncIterable = ensureAsyncIterable(regularArray);
 * for await (const item of asyncIterable) {
 *   console.log(item);  // Outputs 1, 2, 3
 * }
 *
 * const asyncArray = async function*() { yield 1; yield 2; yield 3; };
 * const asyncIterable = ensureAsyncIterable(asyncArray());
 * for await (const item of asyncIterable) {
 *   console.log(item);  // Outputs 1, 2, 3
 * }
 */
export function ensureAsyncIterable<T>(iterable: AsyncIterable<T> | Iterable<T>): AsyncIterable<T> {
  if (isAsyncIterable(iterable)) {
    return iterable
  }

  return {
    async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
      for (const item of iterable) {
        yield item
      }
    },
  }
}

/**
 * Transforms a Promise resolving to an iterable into an AsyncIterable, making it possible to use asynchronous iteration constructs like for-await-of.
 *
 * @param promise - A Promise that resolves to an iterable of type T.
 * @param transform - An optional transform function applied to each item in the iterable. The function receives the current item and its index as parameters and should return a new item of type U.
 *
 * @returns An AsyncIterableIterator that allows asynchronous iteration over the items, transformed by the optional transform function.
 *
 * @example
 * const promise = Promise.resolve([1, 2, 3]);
 * for await (const item of asyncIteratorFromPromise(promise)) {
 *   console.log(item); // Outputs 1, then 2, then 3
 * }
 *
 * const promise = Promise.resolve([1, 2, 3]);
 * const transform = (x: number) => x * 2;
 * for await (const item of asyncIteratorFromPromise(promise, transform)) {
 *   console.log(item); // Outputs 2, then 4, then 6
 * }
 */
export async function* asyncIteratorFromPromise<T, U = T>(
  promise: Promise<Iterable<T>>,
  transform?: undefined | ((item: T, index: number) => U),
): AsyncIterableIterator<U> {
  const iterable = await promise

  if (transform === undefined) {
    for (const item of iterable) {
      yield item as unknown as U
    }
  } else {
    let index = 0

    for (const item of iterable) {
      yield transform(item, index)

      index += 1
    }
  }
}

const ErrorMessage = {
  reuseAsyncIterable:
    'Cannot create an async iterator more than once to ensure consistency and no undesired side effects. Use it as a Promise at first for support of later re-use.',
}

/**
 * Represents a promise that can be asynchronously iterated.
 * This class ensures that it is either turned into a Promise, or firstly iterated over and then becoming a promise.
 * Restrictions prevent inconsistency and undesired side effects.
 */
export class AsyncIterablePromise<R> implements AsyncIterable<R>, PromiseLike<readonly R[]> {
  readonly #iterable

  // eslint-disable-next-line functional/prefer-readonly-type -- mutable
  #iterator: undefined | AsyncIterator<R, undefined>
  // eslint-disable-next-line functional/prefer-readonly-type -- mutable
  #promise: undefined | Promise<readonly R[]>

  /**
   * Returns the class name as a string, useful for debugging.
   */
  get [Symbol.toStringTag](): string {
    return this.constructor.name
  }

  /**
   * Constructs an AsyncIterablePromise from an AsyncIterable.
   * @param iterable - The AsyncIterable that this class wraps.
   */
  constructor(iterable: AsyncIterable<R> | Iterable<R>) {
    if (isAsyncIterable(iterable)) {
      this.#iterable = iterable
    } else if (isIterable(iterable)) {
      this.#iterable = ensureAsyncIterable(iterable)
    } else {
      throw new TypeError('The provided iterable must be an Iterable or AsyncIterable.')
    }
  }

  /**
   * Resolves the AsyncIterable into a Promise, ensuring that it cannot be both iterated and resolved.
   * If iterated before, a TypeError is thrown to maintain consistency and prevent undesired side effects.
   * @private
   */
  // deno-lint-ignore require-await
  async #resolve(): Promise<readonly R[]> {
    if (this.#promise === undefined) {
      if (this.#iterator !== undefined) {
        throw new Error(ErrorMessage.reuseAsyncIterable)
      }

      this.#promise = (async () => {
        const results: R[] = []

        for await (const item of this) {
          results.push(item)
        }

        return results
      })()
    }

    return this.#promise
  }

  /**
   * Implements the AsyncIterator interface for the AsyncIterablePromise.
   * Can be used only once for a given instance.
   */
  [Symbol.asyncIterator](): AsyncIterator<R, undefined> {
    if (this.#promise !== undefined) {
      return asyncIteratorFromPromise(this.#promise)[Symbol.asyncIterator]()
    }

    if (this.#iterator !== undefined) {
      throw new Error(ErrorMessage.reuseAsyncIterable)
    }

    this.#iterator = this.#iterable[Symbol.asyncIterator]()

    return this.#iterator
  }

  /**
   * Returns a Promise that deals with rejected cases.
   * @param onRejected - Function called when the Promise is rejected.
   */
  // deno-lint-ignore require-await
  async catch<TResult = never>(
    onRejected?: null | undefined | ((reason: unknown) => PromiseLike<TResult> | TResult),
  ): Promise<TResult | readonly R[]> {
    return this.#resolve().catch(onRejected)
  }

  /**
   * Returns a Promise and executes the given function when the Promise is settled (either fulfilled or rejected).
   * @param onFinally - Function to be called when the Promise is settled.
   */
  // deno-lint-ignore require-await
  async finally(onFinally?: null | undefined | (() => void)): Promise<readonly R[]> {
    return this.#resolve().finally(onFinally)
  }

  /**
   * Returns a Promise that resolves to the value when the Promise is fulfilled.
   * @param onFulfilled - Function called when the Promise is fulfilled.
   * @param onRejected - Function called when the Promise is rejected.
   */
  // deno-lint-ignore require-await
  async then<TResult1 = readonly R[], TResult2 = never>(
    onFulfilled?: null | undefined | ((value: readonly R[]) => PromiseLike<TResult1> | TResult1),
    onRejected?: null | undefined | ((reason: unknown) => PromiseLike<TResult2> | TResult2),
  ): Promise<TResult1 | TResult2> {
    return this.#resolve().then(onFulfilled, onRejected)
  }
}

export const toArray = async <T>(iterable: AsyncIterable<T>): Promise<T[]> => {
  if (isAsyncIterable(iterable)) {
    const array: T[] = []

    for await (const item of iterable) {
      array.push(item)
    }

    return array
  }

  throw new TypeError('Expected an AsyncIterable.')
}
