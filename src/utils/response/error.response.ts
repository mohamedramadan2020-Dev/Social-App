import { NextFunction, Request, Response } from "express";

export interface IError extends Error {
  cause?: unknown;
  statusCode: number;
}
// Genral-ApplicationException
export class ApplicationException extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    cause?: unknown
  ) {
    super(message, {cause} );
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
// Bad-Request-ApplicationException
export class BadRequestException extends ApplicationException {
  constructor(message: string, cause?: unknown) {
    super(message, 400, cause );
  }
}
// Not-Found-ApplicationException
export class NotFoundException extends ApplicationException {
  constructor(message: string, cause?: unknown) {
    super(message, 404,  cause );
  }
}

export const globalErrorHandling = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(error.statusCode||500).json({
    err_message: error.message || "something went wrong",
    stack: process.env.MOOD === "development" ? error.stack : "undefiend",
    error,
    cause: error.cause,
  });
};
