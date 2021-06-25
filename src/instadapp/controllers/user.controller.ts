import { Request, Response } from 'express'
import { BaseController } from '~/base/controller.base'
import { TRANSACTION_TYPE } from '~/configs/logger.config'
import { IApiResponse, IApiResult } from '~/types/api.type'
import { InstadappError } from '../error.instadapp'
import { IPosition, IStrategyReqBody, TProtocolName } from '../type.instadapp'
import { INSTADAPP_AAVE_POSITION_URL, PROTOCOL_PARAM, USER_QUERY } from '../config.instadapp'
import axios, { AxiosResponse } from 'axios'

export class User extends BaseController {
  private user: string
  private protocolName: TProtocolName

  public constructor(req: Request, res: Response) {
    super(req, res)
    this.protocolName = req.params[PROTOCOL_PARAM] as TProtocolName
    this.user = req.query[USER_QUERY] as string
  }

  protected async doRequest(req: Request): Promise<IApiResult<IApiResponse>> {
    try {
      let res: AxiosResponse<IPosition> | undefined
      const params = { user: this.user }

      if (this.protocolName === 'aave') {
        res = await axios.get<IPosition>(INSTADAPP_AAVE_POSITION_URL, { params })
      }
      return this.success({ ...res?.data }, 'Called user position successful')
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
