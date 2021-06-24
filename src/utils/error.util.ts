import { Request, Response, NextFunction } from 'express'
import { BaseError } from '~/base/error.base'
import logger from './logger.util'
import { getRequestUrl } from './server.util'

const GENERAL_ERROR_MESSAGES = {
  syntax: 'There are issue(s) with the request syntax, please rectify it and try again.',
  otherError: 'There are issue(s) with the request, please rectify and try again.',
  notFound: 'Not Found',
} as const

export const apiNotFoundHandler = (req: Request, res: Response) => {
  res.status(404)
  res.json({ message: GENERAL_ERROR_MESSAGES.notFound })
  const metadata = { path: new URL(getRequestUrl(req)).pathname }
  logger.error(`[404] [No matching API] ${GENERAL_ERROR_MESSAGES.notFound}`, metadata)
}

export const generalErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError) {
    res.status(400)
    res.json({ message: GENERAL_ERROR_MESSAGES.syntax })

    const metadata = {
      errorStack: error.stack,
      path: new URL(getRequestUrl(req)).pathname,
    }
    logger.error(`[400] [SyntaxError] ${GENERAL_ERROR_MESSAGES.syntax}`, metadata)
  } else if (error) {
    let message: string = GENERAL_ERROR_MESSAGES.otherError

    if (error instanceof BaseError) {
      message = `${error.type} ${error.message}`
    }
    res.status(400)
    res.json({ message })

    const metadata = {
      errorStack: error.stack,
      path: new URL(getRequestUrl(req)).pathname,
    }
    logger.error(`[400] [OtherError] ${message}`, metadata)
  } else {
    next()
  }
}
