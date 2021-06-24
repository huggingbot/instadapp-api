import express, { RequestHandler } from 'express'
import { extractSourceIp, generateApiTxId, generateTxStartTime } from '~/utils/logger.util'

const apiMiddlewareRouter = express.Router()

apiMiddlewareRouter.use(((req, _, next) => {
  generateApiTxId(req)
  next()
}) as RequestHandler)
apiMiddlewareRouter.use(((req, _, next) => {
  generateTxStartTime(req)
  next()
}) as RequestHandler)
apiMiddlewareRouter.use(((req, _, next) => {
  extractSourceIp(req)
  next()
}) as RequestHandler)

export default apiMiddlewareRouter
