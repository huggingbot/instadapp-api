export const HTTP_CODE = {
  ok: 200,
  found: 302,
  temporaryRedirect: 307,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  internalServerError: 500,
  tooManyRequests: 429,
} as const

// Default API result code
export const API_RESULT_CODE = {
  success: 1,
  failure: -1,
} as const
