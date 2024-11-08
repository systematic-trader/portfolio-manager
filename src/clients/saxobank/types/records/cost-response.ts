import {
  array,
  enums,
  type GuardType,
  integer,
  literal,
  number,
  optional,
  props,
  record,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { BuySell } from '../derives/buy-sell.ts'
import { CostAssumption } from '../derives/cost-assumption.ts'
import { Currency3 } from '../derives/currency.ts'
import { PriceDisplayFormatType } from '../derives/price-display-format-type.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'
import { InstrumentMarginRequirements } from './instrument-margin-requirements.ts'
import { LongShortCost } from './long-short-cost.ts'
import { MarginTierRequirement } from './margin-tier-requirement.ts'

const CostResponseBase = props({
  /** Currency of the selected account, used when listing currency conversion fees for the selected instrument back to the account currency */
  AccountCurrency: Currency3,

  /** Unique ID of the account */
  AccountID: string(),

  /** Number of instrument */
  Amount: number(),

  /** Calculation Assumptions */
  CostCalculationAssumptions: array(CostAssumption),

  /**
   * Includes Symbol and formatting info.
   * (standard object also used in most other service groups)
   */
  DisplayAndFormat: InstrumentDisplayAndFormat.merge({
    Format: optional(PriceDisplayFormatType),
    OrderDecimals: optional(integer()),
  }),

  /** Holding period in days */
  HoldingPeriodInDays: integer(),

  /** Description of instrument */
  Instrument: string(),

  /** Price of instrument */
  Price: number(),

  /** Instrument UIC */
  Uic: integer(),
})

interface CostResponseBase extends GuardType<typeof CostResponseBase> {}

export const CostResponseBond = CostResponseBase.merge({
  AssetType: literal('Bond'),
  Cost: props({
    Long: LongShortCost,
  }),
})

export interface CostResponseBond extends GuardType<typeof CostResponseBond> {}

export const CostResponseCfdOnCompanyWarrant = CostResponseBase.merge({
  AssetType: literal('CfdOnCompanyWarrant'),
  Cost: props({
    Long: LongShortCost,
  }),
  InstrumentMarginRequirements,
})

export interface CostResponseCfdOnCompanyWarrant extends GuardType<typeof CostResponseCfdOnCompanyWarrant> {}

export const CostResponseCfdOnEtc = CostResponseBase.merge({
  AssetType: literal('CfdOnEtc'),
  Cost: props({
    Long: LongShortCost,
    Short: optional(LongShortCost),
  }),
  InstrumentMarginRequirements,
})

export interface CostResponseCfdOnEtc extends GuardType<typeof CostResponseCfdOnEtc> {}

export const CostResponseCfdOnEtf = CostResponseBase.merge({
  AssetType: literal('CfdOnEtf'),
  Cost: props({
    Long: LongShortCost,
    Short: optional(LongShortCost),
  }),
  InstrumentMarginRequirements,
})

export interface CostResponseCfdOnEtf extends GuardType<typeof CostResponseCfdOnEtf> {}

export const CostResponseCfdOnEtn = CostResponseBase.merge({
  AssetType: literal('CfdOnEtn'),
  Cost: props({
    Long: LongShortCost,
  }),
  InstrumentMarginRequirements,
})

export interface CostResponseCfdOnEtn extends GuardType<typeof CostResponseCfdOnEtn> {}

export const CostResponseCfdOnFund = CostResponseBase.merge({
  AssetType: literal('CfdOnFund'),
  Cost: props({
    Long: LongShortCost,
    Short: optional(LongShortCost),
  }),
  InstrumentMarginRequirements,
})

export interface CostResponseCfdOnFund extends GuardType<typeof CostResponseCfdOnFund> {}

export const CostResponseCfdOnFutures = CostResponseBase.merge({
  AssetType: literal('CfdOnFutures'),
  Cost: props({
    Long: LongShortCost,
    Short: LongShortCost,
  }),
  InstrumentMarginRequirements,
})

export interface CostResponseCfdOnFutures extends GuardType<typeof CostResponseCfdOnFutures> {}

export const CostResponseCfdOnIndex = CostResponseBase.merge({
  AssetType: literal('CfdOnIndex'),
  Cost: props({
    Long: LongShortCost,
    Short: LongShortCost,
  }),
  InstrumentMarginRequirements,
})

export interface CostResponseCfdOnIndex extends GuardType<typeof CostResponseCfdOnIndex> {}

export const CostResponseCfdOnRights = CostResponseBase.merge({
  AssetType: literal('CfdOnRights'),
  Cost: props({
    Long: LongShortCost,
  }),
})

export interface CostResponseCfdOnRights extends GuardType<typeof CostResponseCfdOnRights> {}

export const CostResponseCfdOnStock = CostResponseBase.merge({
  AssetType: literal('CfdOnStock'),
  Cost: props({
    Long: LongShortCost,
    Short: optional(LongShortCost),
  }),
  InstrumentMarginRequirements,
})

export interface CostResponseCfdOnStock extends GuardType<typeof CostResponseCfdOnStock> {}

export const CostResponseCompanyWarrant = CostResponseBase.merge({
  AssetType: literal('CompanyWarrant'),
  Cost: props({
    Long: LongShortCost,
  }),
})

export interface CostResponseCompanyWarrant extends GuardType<typeof CostResponseCompanyWarrant> {}

export const CostResponseContractFutures = CostResponseBase.merge({
  AssetType: literal('ContractFutures'),
  Cost: props({
    Long: LongShortCost,
    Short: LongShortCost,
  }),
  InstrumentMarginRequirements,
})

export interface CostResponseContractFutures extends GuardType<typeof CostResponseContractFutures> {}

export const CostResponseEtc = CostResponseBase.merge({
  AssetType: literal('Etc'),
  Cost: props({
    Long: LongShortCost,
  }),
})

export interface CostResponseEtc extends GuardType<typeof CostResponseEtc> {}

export const CostResponseEtf = CostResponseBase.merge({
  AssetType: literal('Etf'),
  Cost: props({
    Long: LongShortCost,
  }),
})

export interface CostResponseEtf extends GuardType<typeof CostResponseEtf> {}

export const CostResponseEtn = CostResponseBase.merge({
  AssetType: literal('Etn'),
  Cost: props({
    Long: LongShortCost,
  }),
})

export interface CostResponseEtn extends GuardType<typeof CostResponseEtn> {}

export const CostResponseFund = CostResponseBase.merge({
  AssetType: literal('Fund'),
  Cost: props({
    Long: LongShortCost,
  }),
})

export interface CostResponseFund extends GuardType<typeof CostResponseFund> {}

export const CostResponseFuturesOption = CostResponseBase.merge({
  AssetType: literal('FuturesOption'),
  Cost: props({
    Long: LongShortCost,
    Short: LongShortCost,
  }),
})

export interface CostResponseFuturesOption extends GuardType<typeof CostResponseFuturesOption> {}

export const CostResponseFxForwards = CostResponseBase.merge({
  AssetType: literal('FxForwards'),
  Cost: props({
    Long: LongShortCost,
    Short: LongShortCost,
  }),
  MarginTierRequirement,
})

export interface CostResponseFxForwards extends GuardType<typeof CostResponseFxForwards> {}

export const CostResponseFxNoTouchOption = CostResponseBase.merge({
  AssetType: literal('FxNoTouchOption'),
  Cost: record(
    enums(['Long', 'Short']),
    props({
      BuySell,
      Currency: Currency3,
      TotalCost: literal(0),
    }),
  ),
  MarginTierRequirement,
})

export interface CostResponseFxNoTouchOption extends GuardType<typeof CostResponseFxNoTouchOption> {}

export const CostResponseFxOneTouchOption = CostResponseBase.merge({
  AssetType: literal('FxOneTouchOption'),
  Cost: record(
    enums(['Long', 'Short']),
    props({
      BuySell,
      Currency: Currency3,
      TotalCost: literal(0),
    }),
  ),
  MarginTierRequirement,
})

export interface CostResponseFxOneTouchOption extends GuardType<typeof CostResponseFxOneTouchOption> {}

export const CostResponseFxSpot = CostResponseBase.merge({
  AssetType: literal('FxSpot'),
  Cost: props({
    Long: LongShortCost,
    Short: LongShortCost,
  }),
  MarginTierRequirement,
})

export interface CostResponseFxSpot extends GuardType<typeof CostResponseFxSpot> {}

export const CostResponseFxSwap = CostResponseBase.merge({
  AssetType: literal('FxSwap'),
  Cost: record(
    enums(['Long', 'Short']),
    LongShortCost.omit(['TotalCostPct']),
  ),
  MarginTierRequirement,
})

export interface CostResponseFxSwap extends GuardType<typeof CostResponseFxSwap> {}

export const CostResponseFxVanillaOption = CostResponseBase.merge({
  AssetType: literal('FxVanillaOption'),
  Cost: record(
    enums(['Long', 'Short']),
    LongShortCost.omit(['TotalCostPct']),
  ),
  MarginTierRequirement,
})

export interface CostResponseFxVanillaOption extends GuardType<typeof CostResponseFxVanillaOption> {}

export const CostResponseRights = CostResponseBase.merge({
  AssetType: literal('Rights'),
  Cost: props({
    Long: LongShortCost,
  }),
})

export interface CostResponseRights extends GuardType<typeof CostResponseRights> {}

export const CostResponseStock = CostResponseBase.merge({
  AssetType: literal('Stock'),
  Cost: props({
    Long: LongShortCost,
  }),
})

export interface CostResponseStock extends GuardType<typeof CostResponseStock> {}

export const CostResponseStockIndexOption = CostResponseBase.merge({
  AssetType: literal('StockIndexOption'),
  Cost: props({
    Long: LongShortCost,
    Short: LongShortCost,
  }),
})

export interface CostResponseStockIndexOption extends GuardType<typeof CostResponseStockIndexOption> {}

export const CostResponseStockOption = CostResponseBase.merge({
  AssetType: literal('StockOption'),
  Cost: props({
    Long: LongShortCost,
    Short: LongShortCost,
  }),
})

export interface CostResponseStockOption extends GuardType<typeof CostResponseStockOption> {}

export const CostResponse = {
  Bond: CostResponseBond,
  CfdOnCompanyWarrant: CostResponseCfdOnCompanyWarrant,
  CfdOnEtc: CostResponseCfdOnEtc,
  CfdOnEtf: CostResponseCfdOnEtf,
  CfdOnEtn: CostResponseCfdOnEtn,
  CfdOnFund: CostResponseCfdOnFund,
  CfdOnFutures: CostResponseCfdOnFutures,
  CfdOnIndex: CostResponseCfdOnIndex,
  CfdOnRights: CostResponseCfdOnRights,
  CfdOnStock: CostResponseCfdOnStock,
  CompanyWarrant: CostResponseCompanyWarrant,
  ContractFutures: CostResponseContractFutures,
  Etc: CostResponseEtc,
  Etf: CostResponseEtf,
  Etn: CostResponseEtn,
  Fund: CostResponseFund,
  FuturesOption: CostResponseFuturesOption,
  FxForwards: CostResponseFxForwards,
  FxNoTouchOption: CostResponseFxNoTouchOption,
  FxOneTouchOption: CostResponseFxOneTouchOption,
  FxSpot: CostResponseFxSpot,
  FxSwap: CostResponseFxSwap,
  FxVanillaOption: CostResponseFxVanillaOption,
  Rights: CostResponseRights,
  Stock: CostResponseStock,
  StockIndexOption: CostResponseStockIndexOption,
  StockOption: CostResponseStockOption,
} as const

export type CostResponse = {
  Bond: CostResponseBond
  CfdOnCompanyWarrant: CostResponseCfdOnCompanyWarrant
  CfdOnEtc: CostResponseCfdOnEtc
  CfdOnEtf: CostResponseCfdOnEtf
  CfdOnEtn: CostResponseCfdOnEtn
  CfdOnFund: CostResponseCfdOnFund
  CfdOnFutures: CostResponseCfdOnFutures
  CfdOnIndex: CostResponseCfdOnIndex
  CfdOnRights: CostResponseCfdOnRights
  CfdOnStock: CostResponseCfdOnStock
  CompanyWarrant: CostResponseCompanyWarrant
  ContractFutures: CostResponseContractFutures
  Etc: CostResponseEtc
  Etf: CostResponseEtf
  Etn: CostResponseEtn
  Fund: CostResponseFund
  FuturesOption: CostResponseFuturesOption
  FxForwards: CostResponseFxForwards
  FxNoTouchOption: CostResponseFxNoTouchOption
  FxOneTouchOption: CostResponseFxOneTouchOption
  FxSpot: CostResponseFxSpot
  FxSwap: CostResponseFxSwap
  FxVanillaOption: CostResponseFxVanillaOption
  Rights: CostResponseRights
  Stock: CostResponseStock
  StockIndexOption: CostResponseStockIndexOption
  StockOption: CostResponseStockOption
}
