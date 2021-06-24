import { EInstadappErrorType, InstadappError } from '../error.instadapp'
import { IStrategyReqBody } from '../type.instadapp'
import { BaseInstadappService } from './instadapp-service.base'

export abstract class BaseStrategyService extends BaseInstadappService {
  public abstract callStrategy(arg: IStrategyReqBody): Promise<string | undefined>

  protected handleError(err: Error): void {
    throw new InstadappError(EInstadappErrorType.StrategyError, err.message)
  }
}
