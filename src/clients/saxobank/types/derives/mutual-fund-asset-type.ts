import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type MutualFundAssetType = GuardType<typeof MutualFundAssetType>

// Not documented
export const MutualFundAssetType = enums([
  'Agressive Multi-asset',
  'Alternative',
  'Balanced Multi-asset',
  'Biotech',
  'Conservative Multi-asset',
  'Consumer Staples',
  'Convertible F.I.',
  'Corporate F.I.',
  'Currencies',
  'Derivative Commodities',
  'Discretionary Consumer',
  'Emerging F.I.',
  'Energy',
  'Event Driven',
  'Finance',
  'Flexible Multi-asset',
  'General Eq.',
  'General F.I.',
  'Global Macro',
  'Gold and Mining',
  'Government F.I.',
  'Healthcare',
  'High Yield F.I.',
  'Indirect Real Estate',
  'Industrial',
  'Inflation-linked F.I.',
  'Long Term F.I.',
  'Long/Short Equity',
  'Managed Futures',
  'Market Neutral Equity',
  'Money Market',
  'Multi Strategies',
  'Multi-asset Others',
  'Natural Resources',
  'Others',
  'Relative Value',
  'Sector Others',
  'Short Term F.I.',
  'Small/ Mid Cap. Eq.',
  'Target Maturity',
  'Technology',
  'Telecommunications',
  'Utilities',
])
