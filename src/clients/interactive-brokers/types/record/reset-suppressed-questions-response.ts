import {
  type GuardType,
  literal,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const ResetSuppressedQuestionsResponse = props({
  status: literal('submitted'),
})

export interface ResetSuppressedQuestionsResponse extends GuardType<typeof ResetSuppressedQuestionsResponse> {}
