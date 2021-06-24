import { Request, RequestHandler } from 'express'
import {
  body,
  CustomValidator,
  DynamicMessageCreator,
  param,
  ValidationError,
  validationResult,
} from 'express-validator'
import { VALIDATION_TYPE } from '~/configs/logger.config'
import { generateLogContext, logFailure } from '~/utils/logger.util'
import { typeOf } from '~/utils/misc.util'
import { PROTOCOL, PROTOCOL_PARAM } from './config.instadapp'
import { EInstadappErrorType, InstadappError } from './error.instadapp'
import { EStrategyName, EStrategyReqBodyName } from './type.instadapp'

export const strategyValidationMiddleware: RequestHandler = async (req, res, next) => {
  await param(PROTOCOL_PARAM).custom(validateProtocolName).run(req)
  await body(EStrategyReqBodyName.StrategyName)
    .exists()
    .withMessage(strategyUndefinedMsg('name'))
    .custom(validateStrategyName)
    .run(req)
  await body(EStrategyReqBodyName.StrategyArg)
    .exists()
    .withMessage(strategyUndefinedMsg('argument'))
    .custom(validateStrategyArg)
    .run(req)

  const result = validationResult(req).formatWith(errorFormatter)
  if (!result.isEmpty()) {
    const resultArr = result.array({ onlyFirstError: true })
    const logContext = generateLogContext(req, VALIDATION_TYPE.instadapp, JSON.stringify(resultArr))
    logFailure('validation')(logContext)
    return res.json({ errors: resultArr })
  }
  return next()
}

const errorFormatter = (error: ValidationError) => {
  try {
    return JSON.parse(error.msg)
  } catch (err) {
    return error.msg
  }
}

const strategyUndefinedMsg =
  (type: 'name' | 'argument'): DynamicMessageCreator =>
  (_, { req }) =>
    new InstadappError(EInstadappErrorType.StrategyError, `Strategy ${type} is undefined`).toObject(req as Request)

const validateProtocolName: CustomValidator = (val: string, { req }): true | never => {
  const enabledProtocols = Object.keys(PROTOCOL)

  if (!enabledProtocols.includes(val)) {
    throw new InstadappError(
      EInstadappErrorType.ProtocolError,
      `Protocol '${val}' is not listed in [${enabledProtocols}]`
    ).toString(req as Request)
  }
  return true
}

const validateStrategyName: CustomValidator = (val: string, { req }): true | never => {
  if (!(Object.values(EStrategyName) as string[]).includes(val)) {
    throw new InstadappError(
      EInstadappErrorType.StrategyError,
      `Strategy name '${val}' is not listed in [${Object.values(EStrategyName)}]`
    ).toString(req as Request)
  }
  return true
}

const validateStrategyArg: CustomValidator = (val: string, { req }): true | never => {
  let isObj = false
  try {
    if (typeOf(val) === 'object') {
      isObj = true
    }
  } finally {
    if (!isObj) {
      throw new InstadappError(
        EInstadappErrorType.StrategyError,
        `Strategy argument '${val}' is not an object`
      ).toString(req as Request)
    }
  }
  return true
}
