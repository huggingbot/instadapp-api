export const TX_RESULT = { success: 'SUCCESS', failure: 'FAILURE' } as const

export const LOG_TYPE = {
  transaction: 'TRANSACTION',
  validation: 'VALIDATION',
} as const

export const TRANSACTION_TYPE = {
  instadapp: {
    strategy: 'INSTADAPP_STRATEGY',
  },
}

export const VALIDATION_TYPE = {
  instadapp: 'INSTADAPP_REQUEST_FAILURE',
}
