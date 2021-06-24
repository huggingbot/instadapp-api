import { Request } from 'express'
import { BaseError } from '~/base/error.base'
import { API_RESULT_CODE } from '~/configs/api.config'
import { LOG_TYPE } from '~/configs/logger.config'
import { DeepRequired } from './utility.type'

export interface ITxContext {
  uuid?: string
  startTime?: Date
  sourceIp?: string
}

export interface ILogContext {
  txContext: ITxContext
  txType: string
  metadata: {
    reqBody: Request['body']
    reqParams: Request['params']
    reqQuery: Request['query']
    logType?: typeof LOG_TYPE[keyof typeof LOG_TYPE]
    errorResponse?: IErrorResponse
    errorStack?: string
  }
  error?: Error | string
}

export interface IApiResult<ResBody = unknown> {
  statusCode: number
  resBody?: ResBody
  redirectUrl?: string
  rawError?: BaseError
  contentType?: string
}

export interface IApiResponse<Body = unknown> {
  resultCode?: string | typeof API_RESULT_CODE.success | typeof API_RESULT_CODE.failure
  message?: string
  body?: Body
  error?: {
    errorId?: string
    errorReason?: string
  }
}

export type ISuccessResult<T> = Required<Pick<IApiResult<T>, 'statusCode' | 'resBody'>>
export type ISuccessResponse<T> = Required<Pick<IApiResponse<T>, 'resultCode' | 'message' | 'body'>>

export type IErrorResult<T> = Required<Pick<IApiResult<T>, 'statusCode' | 'resBody' | 'rawError'>>
export type IErrorResponse = DeepRequired<Pick<IApiResponse, 'resultCode' | 'error'>>
