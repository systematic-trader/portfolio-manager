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
