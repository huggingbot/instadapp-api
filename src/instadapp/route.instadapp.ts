import express, { Request, Response } from 'express'
import { Strategy } from './controllers/strategy.controller'
import { INSTADAPP_API_VERSION, PROTOCOL_PARAM } from './config.instadapp'
import { strategyValidationMiddleware } from './validator.instadapp'
import { Method } from './controllers/method.controller'
import { User } from './controllers/user.controller'
import { Price } from './controllers/price.controller'

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

instadappRouter.get(
  `${instadappApiBaseRoute}/:${PROTOCOL_PARAM}/position`,
  (req: Request, res: Response) => void new User(req, res).handleRequest()
)

instadappRouter.get(
  `${instadappApiBaseRoute}/prices`,
  (req: Request, res: Response) => void new Price(req, res).handleRequest()
)

export default instadappRouter
