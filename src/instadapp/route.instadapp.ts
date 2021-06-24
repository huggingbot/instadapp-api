import express, { Request, Response } from 'express'
import { Strategy } from './controllers/strategy.controller'
import { INSTADAPP_API_VERSION, PROTOCOL_PARAM } from './config.instadapp'
import { strategyValidationMiddleware } from './validator.instadapp'
import { Method } from './controllers/method.controller'

const instadappApiBaseRoute = `/api/instadapp/v${INSTADAPP_API_VERSION}`

const instadappRouter = express.Router()
instadappRouter.post(
  `${instadappApiBaseRoute}/:${PROTOCOL_PARAM}/strategy`,
  strategyValidationMiddleware,
  (req: Request, res: Response) => void new Strategy(req, res).handleRequest()
)
instadappRouter.post(
  `${instadappApiBaseRoute}/:${PROTOCOL_PARAM}/method`,
  (req: Request, res: Response) => void new Method(req, res).handleRequest()
)

export default instadappRouter
