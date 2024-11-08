import {
  array,
  type GuardType,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface StringErrorResponse extends GuardType<typeof StringErrorResponse> {}

export const StringErrorResponse = props({
  /** ErrorCode */
  ErrorCode: string(),

  /** Optional Textual information about the error to aid the developer */
  Message: string(),

  /** Represent pre trades disclaimers not accepted by user */
  PreTradeDisclaimers: props({
    /** Unique id of the request of pre check */
    DisclaimerContext: string(),

    /** Array of not accepted disclaimers tokens */
    DisclaimerTokens: array(string()),
  }),
})
