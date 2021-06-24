import { Request, Response } from 'express'
import { API_RESULT_CODE, HTTP_CODE } from '~/configs/api.config'
import {
  IApiResponse,
  IApiResult,
  IErrorResponse,
  IErrorResult,
  ILogContext,
  ISuccessResponse,
  ISuccessResult,
} from '~/types/api.type'
import logger, { generateLogContext, logFailure, logSuccess } from '~/utils/logger.util'
import { BaseError } from './error.base'

export type InputTransFn = (req: Request) => Promise<Request> | Request
export type OutputTransFn = <T>(res: IApiResult<T>) => Promise<IApiResult<T>> | IApiResult<T>

interface IController {
  handleRequest(req: Request, res: Response): Promise<void>
}

abstract class AbstractController<ResBody> implements IController {
  protected req: Request
  protected res: Response
  protected logContext: ILogContext
  protected readonly reqId: string

  /**
   * Mainly use for api migration. to transform request object before being handled by doRequest
   */
  public inputTransFn?: InputTransFn
  /**
   * Mainly use for api migration. to transform api result before being sent back to client
   */
  public outputTransFn?: OutputTransFn
  /**
   *  Override if needed
   */
  protected onSuccessLog?: (logContext: ILogContext) => void
  /**
   *  Override if needed
   */
  protected onFailureLog?: (logContext: ILogContext) => void

  public constructor(req: Request, res: Response) {
    this.req = req
    this.res = res
    if (!req.txContext?.uuid) {
      throw new Error('Request Id is undefined')
    }
    this.reqId = req.txContext.uuid
    this.logContext = this.generateLogContext()
  }

  public async handleRequest(): Promise<void> {
    try {
      if (this.inputTransFn) {
        this.req = await this.inputTransFn(this.req)
      }
      let apiResult = await this.doRequest(this.req)
      if (this.outputTransFn) {
        apiResult = await this.outputTransFn(apiResult)
      }
      this.processApiResult(apiResult)
    } catch (err: unknown) {
      this.processErrorCaught(err as Error)
    }
  }

  protected abstract doRequest(req: Request): Promise<IApiResult<ResBody>>
  /**
   * For logging at end of api req
   * @param req
   */
  protected abstract getTxType(req: Request): string

  protected generateLogContext(err?: BaseError): ILogContext {
    return generateLogContext(this.req, this.getTxType(this.req), err)
  }

  protected redirect(
    url: string,
    statusCode: typeof HTTP_CODE.found | typeof HTTP_CODE.temporaryRedirect = HTTP_CODE.found,
    contentType = 'json',
    err?: BaseError
  ): IApiResult<ResBody> {
    return {
      redirectUrl: url,
      statusCode,
      contentType,
      rawError: err,
    }
  }

  private logSuccess(): void {
    if (!this.onSuccessLog) {
      return
    }
    this.onSuccessLog(this.logContext)
  }
  private logFailure(errResponse: IErrorResponse, rawError?: Error): void {
    if (!this.onFailureLog) {
      return
    }
    this.logContext.error = rawError
    this.logContext.metadata.errorResponse = errResponse
    this.onFailureLog(this.logContext)
  }

  /**
   * It's most likely an unexpected error if we reach here.
   * Defaults to bad request if it's a custom error.
   * @param rawError
   */
  private processErrorCaught(rawError: Error): void {
    logger.debug('[processErrorCaught] ', rawError)
    const errorRes = this.constructErrorResponse(rawError)
    let statusCode: typeof HTTP_CODE[keyof typeof HTTP_CODE] = HTTP_CODE.internalServerError

    if (rawError instanceof BaseError) {
      statusCode = HTTP_CODE.badRequest
    }
    this.res.status(HTTP_CODE.internalServerError)
    this.res.json(errorRes)
    this.logFailure(errorRes, rawError)
  }

  protected constructErrorResponse(rawError: Error, msgOverride?: string): IErrorResponse {
    const genericCode = API_RESULT_CODE.failure
    let resultCode: typeof genericCode | string = genericCode
    let msg = 'Something unexpected went wrong'

    if (rawError instanceof BaseError) {
      resultCode = rawError.type
      msg = rawError.message
    }
    return {
      resultCode,
      error: {
        errorId: this.reqId,
        errorReason: msgOverride ? msgOverride : msg,
      },
    }
  }

  protected log(rawError?: BaseError): void {
    if (rawError) {
      logger.debug('[logFailure] ', rawError)
      this.logFailure(this.constructErrorResponse(rawError), rawError)
    } else {
      this.logSuccess()
    }
  }

  private processApiResult(apiResult: IApiResult<ResBody>): void {
    const statusCode = apiResult.statusCode
    if (statusCode === HTTP_CODE.found || statusCode === HTTP_CODE.temporaryRedirect) {
      const url = apiResult.redirectUrl
      if (!url) {
        throw new Error('Empty redirect Url')
      }
      logger.info(`Setting Redirection: ${url}`, this.reqId)

      this.res.setHeader('Location', url)
      this.res.status(statusCode)
      this.res.json({})
      this.log(apiResult.rawError)
      return
    }
    this.log(apiResult.rawError)
    this.res.status(statusCode)
    this.res.json(apiResult.resBody)
    return
  }
}

/**
 * Convenience class for standard API response
 */
export abstract class BaseController<Body = unknown> extends AbstractController<IApiResponse<Body>> {
  public constructor(req: Request, res: Response) {
    super(req, res)
    this.onSuccessLog = logSuccess('transaction').bind(this)
    this.onFailureLog = logFailure('transaction').bind(this)
  }

  protected success(
    body: Body,
    message = 'success',
    resultCode = API_RESULT_CODE.success
  ): Promise<ISuccessResult<ISuccessResponse<Body>>> {
    return Promise.resolve({
      statusCode: HTTP_CODE.ok,
      resBody: {
        resultCode,
        message,
        body,
      },
    })
  }

  protected unauthorized(err: BaseError, message?: string): Promise<IErrorResult<IErrorResponse>> {
    const res = this.processError(err, message)
    return Promise.resolve({
      statusCode: HTTP_CODE.unauthorized,
      resBody: res,
      rawError: err,
    })
  }

  protected badRequest(err: BaseError, message?: string): Promise<IErrorResult<IErrorResponse>> {
    const res = this.processError(err, message)
    return Promise.resolve({
      statusCode: HTTP_CODE.badRequest,
      resBody: res,
      rawError: err,
    })
  }

  protected forbidden(err: BaseError, message?: string): Promise<IErrorResult<IErrorResponse>> {
    const res = this.processError(err, message)
    return Promise.resolve({
      statusCode: HTTP_CODE.forbidden,
      resBody: res,
      rawError: err,
    })
  }

  protected notFound(err: BaseError, message?: string): Promise<IErrorResult<IErrorResponse>> {
    const res = this.processError(err, message)
    return Promise.resolve({
      statusCode: HTTP_CODE.notFound,
      resBody: res,
      rawError: err,
    })
  }

  protected internalServerError(err: BaseError, message?: string): Promise<IErrorResult<IErrorResponse>> {
    const res = this.processError(err, message)
    return Promise.resolve({
      statusCode: HTTP_CODE.internalServerError,
      resBody: res,
      rawError: err,
    })
  }

  /**
   * err comes from BaseError object. message will override err.message
   * @param err
   * @param message
   */
  private processError(err: BaseError, message?: string): IErrorResponse {
    return super.constructErrorResponse(err, message)
  }
}
