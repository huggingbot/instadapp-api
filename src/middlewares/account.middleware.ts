import { RequestHandler } from 'express'

const accountMiddleware =
  (account: any): RequestHandler =>
  (req, _, next) => {
    req.account = account
    next()
  }

export default accountMiddleware
