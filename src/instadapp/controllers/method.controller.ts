import { Request, Response } from 'express'
import { BaseController } from '~/base/controller.base'
import { TRANSACTION_TYPE } from '~/configs/logger.config'
import { IApiResponse, IApiResult } from '~/types/api.type'
import { InstadappError } from '../error.instadapp'
import { AaveMethodService } from '../aave/method-service.aave'
import { IMethodReqBody, TProtocolName } from '../type.instadapp'
import { PROTOCOL_PARAM } from '../config.instadapp'
import { BaseMethodService } from '../base/method-service.base'

export class Method extends BaseController {
  private methodService: BaseMethodService

  public constructor(req: Request, res: Response) {
    super(req, res)
    const protocolName = req.params[PROTOCOL_PARAM] as TProtocolName

    if (protocolName === 'aave') {
      this.methodService = new AaveMethodService(this.logContext)
    }
  }

  protected async doRequest(
    req: Request<unknown, unknown, IMethodReqBody, unknown>
  ): Promise<IApiResult<IApiResponse>> {
    const { methodName, methodArg } = req.body
    try {
      const txHash = await this.methodService.callMethod({ methodName, methodArg })
      return this.success({ txHash }, 'Called method successful')
    } catch (err) {
      if (err instanceof InstadappError) {
        return this.badRequest(err)
      }
      throw err
    }
  }

  protected getTxType(): string {
    return TRANSACTION_TYPE.instadapp.strategy
  }
}
