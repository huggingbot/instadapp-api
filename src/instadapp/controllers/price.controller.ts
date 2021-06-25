import { Request, Response } from 'express'
import { BaseController } from '~/base/controller.base'
import { TRANSACTION_TYPE } from '~/configs/logger.config'
import { IApiResponse, IApiResult } from '~/types/api.type'
import { InstadappError } from '../error.instadapp'
import { INSTADAPP_PRICE_URL } from '../config.instadapp'
import axios from 'axios'
import { IPrice } from '../type.instadapp'

export class Price extends BaseController {
  public constructor(req: Request, res: Response) {
    super(req, res)
  }

  protected async doRequest(_: Request): Promise<IApiResult<IApiResponse>> {
    try {
      const res = await axios.get<IPrice>(INSTADAPP_PRICE_URL)
      return this.success({ ...res.data }, 'Called prices successful')
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
