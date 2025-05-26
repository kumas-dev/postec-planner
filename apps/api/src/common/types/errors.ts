export class HttpError extends Error {
  status: number
  error?: object
  code?: string

  constructor({
    name,
    status,
    message,
    error,
    code,
  }: {
    name: string
    status: number
    message?: string
    error?: object
    code?: string
  }) {
    super(message)
    this.name = name
    this.status = status
    this.error = error
    this.code = code
  }
}

export class BadRequestError extends HttpError {
  constructor({
    message,
    error,
    code,
  }: { message?: string; error?: object; code?: string } = {}) {
    super({ status: 400, name: 'BadRequest', message, error, code })
  }
}

export class UnauthorizedError extends HttpError {
  constructor({
    message,
    error,
    code,
  }: { message?: string; error?: object; code?: string } = {}) {
    super({ status: 401, name: 'Unauthorized', message, error, code })
  }
}

export class ForbiddenError extends HttpError {
  constructor({
    message,
    error,
    code,
  }: { message?: string; error?: object; code?: string } = {}) {
    super({ status: 403, name: 'Forbidden', message, error, code })
  }
}

export class NotFoundError extends HttpError {
  constructor({
    message,
    error,
    code,
  }: { message?: string; error?: object; code?: string } = {}) {
    super({ status: 404, name: 'NotFound', message, error, code })
  }
}

export class InternalServerError extends HttpError {
  constructor({
    message,
    error,
    code,
  }: { message?: string; error?: object; code?: string } = {}) {
    super({ status: 500, name: 'InternalServerError', message, error, code })
  }
}
