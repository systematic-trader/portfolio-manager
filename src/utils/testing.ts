export { expect } from 'jsr:@std/expect'
export { afterAll, afterEach, beforeAll, beforeEach, describe, it as test } from 'jsr:@std/testing/bdd'

import { Timeout } from './timeout.ts'

Timeout.unref = false
