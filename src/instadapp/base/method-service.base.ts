import { EInstadappErrorType, InstadappError } from '../error.instadapp'
import { IMethodReqBody } from '../type.instadapp'
import { BaseInstadappService } from './instadapp-service.base'

export abstract class BaseMethodService extends BaseInstadappService {
  public abstract callMethod(arg: IMethodReqBody): Promise<string | undefined>

  protected handleError(err: Error): void {
    throw new InstadappError(EInstadappErrorType.MethodError, err.message)
  }
}
