import { Request } from 'express'
import produce from 'immer'
import { createLogger, format, transports } from 'winston'
import { v4 as uuidv4 } from 'uuid'
import { retrieveIpAddress } from './server.util'
import { ILogContext, ITxContext } from '~/types/api.type'
import { LOG_TYPE, TX_RESULT } from '~/configs/logger.config'

export const generateApiTxId = (req: Request) => {
  req.txContext = { uuid: uuidv4() }
}

export const generateTxStartTime = (req: Request) => {
  req.txContext.startTime = new Date()
}

export const extractSourceIp = (req: Request) => {
  req.txContext.sourceIp = retrieveIpAddress(req)
}

export const generateLogContext = (req: Request, txType: string, error?: ILogContext['error']): ILogContext => {
  return {
    txContext: req.txContext,
    txType,
    metadata: {
      reqBody: req.body,
      reqParams: req.params,
      reqQuery: req.query,
    },
    error,
  }
}

const extractTxContext = (txContext: ITxContext) => {
  const txId = txContext.uuid ?? '-'
  const ipAddress = txContext.sourceIp ?? '-'
  const totalTime = txContext.startTime ? Date.now() - txContext.startTime.getTime() : 0
  return { txId, ipAddress, totalTime }
}

export const logSuccess = (logType: keyof typeof LOG_TYPE) => (logContext: ILogContext) => {
  const { txContext, txType, metadata: metadataInput } = logContext
  const { txId, ipAddress, totalTime } = extractTxContext(txContext)
  const txInfo = {
    txId,
    txType,
    txResult: TX_RESULT.success,
    totalTime,
    ipAddress,
  }
  const metadata = produce(metadataInput, draft => {
    draft.logType = LOG_TYPE[logType]
  })
  logger.info(JSON.stringify(txInfo), metadata)
  return { txInfo, metadata }
}

export const logFailure = (logType: keyof typeof LOG_TYPE) => (logContext: ILogContext) => {
  const { txContext, txType, metadata: metadataInput, error } = logContext
  const { txId, ipAddress, totalTime } = extractTxContext(txContext)
  let txResult = error

  if (typeof error === 'undefined') {
    txResult = TX_RESULT.failure
  } else if (error instanceof Error) {
    txResult = error.message
  }
  const txInfo = {
    txId,
    txType,
    txResult,
    totalTime,
    ipAddress,
  }
  const metadata = produce(metadataInput, draft => {
    draft.logType = LOG_TYPE[logType]
    draft.errorStack = error instanceof Error ? error.stack : undefined
  })
  logger.error(JSON.stringify(txInfo), metadata)
  return { txInfo, metadata }
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `instadapp-combined.log`.
    // - Write all logs error (and below) to `instadapp-error.log`.
    //
    new transports.File({ filename: 'instadapp-error.log', level: 'error' }),
    new transports.File({ filename: 'instadapp-combined.log' }),
  ],
})

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  )
}

export default logger
