import { ILogContext } from '~/types/api.type'

export class BaseService {
  protected logContext: ILogContext

  public constructor(logContext: ILogContext) {
    this.logContext = logContext
  }

  protected handleError(err: Error): void {
    throw err
  }
}
