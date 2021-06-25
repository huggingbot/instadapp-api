import { EInstadappErrorType, InstadappError } from '../error.instadapp'
import { IStrategyReqBody } from '../type.instadapp'
import { BaseInstadappService } from './instadapp-service.base'

export abstract class BaseStrategyService extends BaseInstadappService {
  public abstract callStrategy(arg: IStrategyReqBody): Promise<string | undefined>
  protected abstract depositAndBorrow(arg: unknown): unknown
  protected abstract paybackAndWithdraw(arg: unknown): unknown
  protected abstract leverage(arg: unknown): unknown
  protected abstract save(arg: unknown): unknown
  protected abstract collateralSwap(arg: unknown): unknown
  protected abstract debtSwap(arg: unknown): unknown

  protected handleError(err: Error): void {
    throw new InstadappError(EInstadappErrorType.StrategyError, err.message)
  }
}
