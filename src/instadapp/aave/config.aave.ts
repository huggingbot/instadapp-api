import { TOKEN } from '../config.instadapp'

export const RATE_MODE = {
  fixed: 1,
  variable: 2,
} as const

export const EXTRA_GAS_PRICE_IN_GWEI = 0.5
// export const FLASH_LOAN_FACTOR = 2.2
export const FLASH_LOAN_FACTOR_WITH_SWAP = 3.3
export const FLASH_BORROW_TOKEN = TOKEN.amWmatic
export const ENABLE_COLLATERAL_TOKEN = TOKEN.wmatic
