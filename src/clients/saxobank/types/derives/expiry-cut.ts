import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type ExpiryCut = GuardType<typeof ExpiryCut>

export const ExpiryCut = enums([
  /** BD: Option is expired/exercised manually. Priced as NY */
  'Budapest',

  /** Mexico cut (MX): Option is expired/exercised manually. Priced as NY */
  'Mexico',

  /** Moscow cut (MW): Option is expired/exercised manually. Priced as NY */
  'Moscow',

  /**
   * Not specified.
   * Usually option trade with this type of expiration has invalid state or not initialized.
   */
  'None',

  /** Option will be expired on the New-York time */
  'NY',

  /** Precious metals cut (PM): Option is expired/exercised manually. Priced as NY */
  'PreciousMetals',

  /** Option will be expired on the Tokyo time */
  'TK',

  /** Turkish cut (TR): Option is expired/exercised manually. Priced as NY */
  'Turkey',

  /** Unknown cut: (UX): Option is expired/exercised manually. Priced as NY */
  'Unknown',

  /** WR: Option is expired/exercised manually. Priced as NY */
  'Warsaw',
])
