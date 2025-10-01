"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandling = exports.conflictException = exports.NotFoundRequestException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    statusCode;
    constructor(message, statusCode = 400, cause) {
        super(message, { cause });
        this.statusCode = statusCode;
        (this.name = this.constructor.name),
            Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationException = ApplicationException;
class BadRequestException extends ApplicationException {
    constructor(message, cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends ApplicationException {
    constructor(message, cause) {
        super(message, 401, cause);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends ApplicationException {
    constructor(message, cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundRequestException extends ApplicationException {
    constructor(message, cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundRequestException = NotFoundRequestException;
class conflictException extends ApplicationException {
    constructor(message, cause) {
        super(message, 409, cause);
    }
}
exports.conflictException = conflictException;
const globalErrorHandling = (error, req, res, next) => {
    return res.status(error.statusCode || 500).json({
        err_message: error.message || "something went wrong !!",
        stack: process.env.MOOD === "development" ? error.stack : undefined,
        cause: error.cause,
        error,
    });
};
exports.globalErrorHandling = globalErrorHandling;
