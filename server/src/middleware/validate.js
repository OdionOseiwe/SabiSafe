import { AppError, badRequest } from "../utils/errors.js";

/**
 * Validate req.body/query/params against a Zod schema.
 * We replace the parsed value with the sanitized output.
 */
export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      const fields = parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || source,
        message: issue.message,
      }));
      return next(badRequest("Some of the information needs checking.", fields));
    }
    req[source] = parsed.data;
    next();
  };
}

export function errorHandler(error, req, res, _next) {
  if (res.headersSent) return;

  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
        requestId: req.id,
      },
    });
  }

  // Prisma unique constraint
  if (error?.code === "P2002") {
    return res.status(409).json({
      error: {
        code: "ALREADY_EXISTS",
        message: "That information is already saved.",
        requestId: req.id,
      },
    });
  }

  if (error?.code === "P2025") {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "We could not find that item.", requestId: req.id },
    });
  }

  // Database not reachable (often a paused Render instance or a cold start).
  if (
    error?.name === "PrismaClientInitializationError" ||
    ["P1000", "P1001", "P1002", "P1017", "P2024"].includes(error?.code)
  ) {
    return res.status(503).json({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "The database is not reachable right now. Please try again in a moment.",
        requestId: req.id,
      },
    });
  }

  console.error(
    JSON.stringify({
      time: new Date().toISOString(),
      level: "error",
      message: "Unhandled request error",
      requestId: req.id,
      error: error?.message,
    }),
  );

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong on our side. Please try again.",
      requestId: req.id,
    },
  });
}
