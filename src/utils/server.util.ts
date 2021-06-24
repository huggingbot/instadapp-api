import { Request } from 'express'

export const getRequestUrl = (req: Request): string => {
  return req.protocol + '://' + (req.headers.host as string) + req.originalUrl
}

export const retrieveIpAddress = (req: Request) => {
  return req.headers && req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']) : req.ip
}
