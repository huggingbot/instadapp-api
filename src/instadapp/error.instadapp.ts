import { Request } from 'express'
import { BaseError } from '~/base/error.base'

export enum EInstadappErrorType {
  ProtocolError = 'ProtocolError',
  StrategyError = 'StrategyError',
  MethodError = 'MethodError',
}

export class InstadappError extends BaseError {
  type: EInstadappErrorType

  constructor(type: EInstadappErrorType, message?: string) {
    super(type, message)
  }

  private composeError(req: Request) {
    return {
      resultCode: this.type,
      error: {
        errorId: req.txContext.uuid,
        errorReason: this.message,
      },
    }
  }

  toObject(req: Request) {
    return this.composeError(req)
  }

  toString(req: Request) {
    return JSON.stringify(this.composeError(req))
  }
}
