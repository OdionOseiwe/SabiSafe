export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) =>
  new AppError(400, "BAD_REQUEST", message, details);

export const unauthorized = (message = "Please sign in to continue.") =>
  new AppError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "You do not have access to this resource.") =>
  new AppError(403, "FORBIDDEN", message);

export const notFound = (message = "We could not find what you were looking for.") =>
  new AppError(404, "NOT_FOUND", message);

export const conflict = (message) => new AppError(409, "CONFLICT", message);

export const upstream = (message = "A service we rely on is unavailable right now.") =>
  new AppError(502, "UPSTREAM_UNAVAILABLE", message);

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
