import { Request, Response } from 'express'
import { BaseController } from '~/base/controller.base'
import { TRANSACTION_TYPE } from '~/configs/logger.config'
import { IApiResponse, IApiResult } from '~/types/api.type'
import { InstadappError } from '../error.instadapp'
import { AaveStrategyService } from '../aave/strategy-service.aave'
import { IStrategyReqBody, TProtocolName } from '../type.instadapp'
import { PROTOCOL_PARAM } from '../config.instadapp'
import { BaseStrategyService } from '../base/strategy-service.base'

export class Strategy extends BaseController {
  private strategyService: BaseStrategyService

  public constructor(req: Request, res: Response) {
    super(req, res)
    const protocolName = req.params[PROTOCOL_PARAM] as TProtocolName

    if (protocolName === 'aave') {
      this.strategyService = new AaveStrategyService(this.logContext, req)
    }
  }

  protected async doRequest(
    req: Request<unknown, unknown, IStrategyReqBody, unknown>
  ): Promise<IApiResult<IApiResponse>> {
    const { strategyName, strategyArg } = req.body
    try {
      const txHash = await this.strategyService.callStrategy({ strategyName, strategyArg })
      return this.success({ txHash }, 'Called strategy successful')
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
