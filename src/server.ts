import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import { getAccount } from '~/utils/web3.util'
import { appConfig } from './configs/app.config'
import instadappRouter from './instadapp/route.instadapp'
import apiMiddlewareRouter from './middlewares/api.middleware'
import accountMiddleware from './middlewares/account.middleware'
import { apiNotFoundHandler, generalErrorHandler } from './utils/error.util'
import logger from './utils/logger.util'

export const startServer = async () => {
  const app = express()
  app.use(compression())
  app.use(express.json())
  app.use(helmet())

  // Custom middlewares
  const account = await getAccount()
  app.use(accountMiddleware(account))
  app.use('/api', apiMiddlewareRouter)

  // API routes
  app.use('/', instadappRouter)

  // Error handlers
  app.all('/api/*', apiNotFoundHandler)
  app.use(generalErrorHandler)

  app.listen(appConfig.port)

  logger.info(`Node Version: ${process.version}`)
  logger.info(`NODE_ENV: ${process.env.NODE_ENV ?? ''}`)
  logger.info(`Running express server on port ${appConfig.port}`)
}
