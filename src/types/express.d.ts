import Web3 from 'web3'
import { ITxContext } from '~/types/api.type'

/**
 * Extension of express request typing
 */
declare module 'express-serve-static-core' {
  interface Request {
    txContext: ITxContext
    web3: Web3
    account: {
      id: number
      address: string
      version: number
    }
  }
}
