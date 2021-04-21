export abstract class HttpError extends Error {
  httpCode: number;

  constructor(httpCode: number) {
    super();
    this.httpCode = httpCode;
  }
}

/**
 * Exception for 400 HTTP error.
 */
export class BadRequestError extends HttpError {
  constructor(message?: string) {
    super(400);
    this.name = BadRequestError.name;
    this.message = message!;
  }
}

/**
 * Exception for 401 HTTP error.
 */
export class UnauthorizedError extends HttpError {
  constructor(message?: string) {
    super(401);
    this.name = UnauthorizedError.name;
    this.message = message!;
  }
}

/**
 * Exception for 403 HTTP error.
 */
export class ForbiddenError extends HttpError {
  constructor(message?: string) {
    super(403);
    this.name = ForbiddenError.name;
    this.message = message!;
  }
}

/**
 * Exception for 404 HTTP error.
 */
export class NotFoundError extends HttpError {
  constructor(message?: string) {
    super(404);
    this.name = NotFoundError.name;
    this.message = message!;
  }
}

/**
 * Exception for 409 HTTP error.
 */
export class ConflictError extends HttpError {
  constructor(message?: string) {
    super(409);
    this.name = ConflictError.name;
    this.message = message!;
  }
}

/**
 * Exception for 422 HTTP error.
 */
export class UnprocessableEntityError extends HttpError {
  constructor(message?: string) {
    super(422);
    this.name = UnprocessableEntityError.name;
    this.message = message!;
  }
}

/**
 * Exception for 500 HTTP error.
 */
export class InternalServerError extends HttpError {
  constructor(message?: string) {
    super(500);
    this.name = InternalServerError.name;
    this.message = message!;
  }
}
