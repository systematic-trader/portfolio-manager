import type { Currency3 } from '../types/derives/currency.ts'

export class SaxoBankBrokerOptionsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class SaxoBankDefaultCurrencyMismatchError extends Error {
  constructor(expectedCurrency: string, actualCurrency: string) {
    super(`SaxoBank default currency mismatch: expected "${expectedCurrency}" but got "${actualCurrency}"`)
    this.name = this.constructor.name
  }
}

export class SaxoBankAccountNotFoundError extends Error {
  constructor(accountID: string) {
    super(`SaxoBank account not found: "${accountID}"`)
    this.name = this.constructor.name
  }
}

export class SaxoBankAccountCurrencyMismatchError extends Error {
  constructor(accountID: string, expectedCurrency: string, actualCurrency: string) {
    super(
      `SaxoBank account currency mismatch: "${accountID}" expected "${expectedCurrency}" but got "${actualCurrency}"`,
    )
    this.name = this.constructor.name
  }
}

export class SaxoBankClientBalancePropertyUndefinedError extends Error {
  constructor(property: string) {
    super(`SaxoBank client balance property undefined: "${property}"`)
    this.name = this.constructor.name
  }
}

export class SaxoBankAccountBalancePropertyUndefinedError extends Error {
  constructor(accountID: string, property: string) {
    super(`SaxoBank account "${accountID}" property undefined:  "${property}"`)
    this.name = this.constructor.name
  }
}

export class SaxoBankAccountTransferPermissionError extends Error {
  constructor({ fromAccountID, toAccountID }: { readonly fromAccountID: string; readonly toAccountID: string }) {
    super(`The account ${fromAccountID} is not allowed to transfer cash to ${toAccountID}.`)
    this.name = this.constructor.name
  }
}

export class SaxoBankAccountTransferInsufficientCashError extends Error {
  constructor({
    account,
    withdraw,
  }: {
    readonly account: { readonly ID: string; readonly currency: Currency3; readonly cash: number }
    readonly withdraw: number
  }) {
    super(
      `Insufficient cash in account ${account.ID} where ${account.currency} ${account.cash} is available and ${account.currency} ${withdraw} cannot be withdrawn.`,
    )
    this.name = this.constructor.name
  }
}

export class SaxoBankMarketClosedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export abstract class SaxoBankInstrumentNotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class SaxoBankInstrumentUICNotFoundError extends SaxoBankInstrumentNotFoundError {
  constructor(assetType: string, uic: number) {
    super(`SaxoBank "${assetType}" instrument with UIC ${uic} not found.`)
  }
}

export class SaxoBankInstrumentUICNotTradableError extends SaxoBankInstrumentNotFoundError {
  constructor(assetType: string, uic: number) {
    super(`SaxoBank "${assetType}" instrument with UIC ${uic} is not tradable.`)
  }
}

export class SaxoBankInstrumentSymbolNotFoundError extends SaxoBankInstrumentNotFoundError {
  constructor(assetType: string, symbol: string) {
    super(`SaxoBank "${assetType}" instrument with symbol "${symbol}" not found.`)
  }
}

export class SaxoBankInstrumentSymbolsNotFoundError extends SaxoBankInstrumentNotFoundError {
  constructor(assetType: string, symbols: readonly string[]) {
    super(`SaxoBank "${assetType}" instruments with symbols "${symbols.join(', ')}" not found.`)
  }
}

export class SaxoBankInstrumentUICAssetTypeMismatchError extends SaxoBankInstrumentNotFoundError {
  constructor(expectedAssetType: string, actualAssetType: string, uic: number) {
    super(
      `SaxoBank "${expectedAssetType}" instrument with UIC ${uic} not found, but found "${actualAssetType}" instrument.`,
    )
  }
}

export class SaxoBankInstrumentSymbolAssetTypeMismatchError extends SaxoBankInstrumentNotFoundError {
  constructor(expectedAssetType: string, actualAssetType: string, symbol: string) {
    super(
      `SaxoBank "${expectedAssetType}" instrument with symbol "${symbol}" not found, but found "${actualAssetType}" instrument.`,
    )
  }
}
