"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentcation = void 0;
const token_security_1 = require("../../utils/security/token.security");
const error_response_1 = require("../../utils/response/error.response");
const authentcation = (tokentype = token_security_1.tokenEnum.access) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequestException("validation error", {
                key: "headers",
                issues: [{ path: "authorization", message: "missing authorization" }],
            });
        }
        const { decoded, user } = await (0, token_security_1.decodedToken)({ authorization: req.headers.authorization, tokentype });
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentcation = authentcation;
const authorization = (accessRoles = [], tokentype = token_security_1.tokenEnum.access) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequestException("validation error", {
                key: "headers",
                issues: [{ path: "authorization", message: "missing authorization" }],
            });
        }
        const { decoded, user } = await (0, token_security_1.decodedToken)({ authorization: req.headers.authorization, tokentype });
        if (!accessRoles.includes(user.role)) {
            throw new error_response_1.forbiddenException("not autherized account");
        }
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authorization = authorization;
