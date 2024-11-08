import {
  type GuardType,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { LanguageCode } from '../derives/language-code.ts'

export const LanguageDetails = props({
  /**
   * The ISO 639-1 two-letter language code. (Except for zh-cn and zh-tw).
   * This list only includes languages for which Saxo has full or partial support for translation of texts.
   */
  LanguageCode: LanguageCode,

  /** The name of the language (in English) */
  LanguageName: string(),

  /** The name of the language (in native language) */
  NativeName: string(),
})

export interface LanguageDetails extends GuardType<typeof LanguageDetails> {}
