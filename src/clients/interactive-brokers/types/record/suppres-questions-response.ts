import {
  type GuardType,
  literal,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const SuppressQuestionsResponse = props({
  status: literal('submitted'),
})

export interface SuppressQuestionsResponse extends GuardType<typeof SuppressQuestionsResponse> {}
