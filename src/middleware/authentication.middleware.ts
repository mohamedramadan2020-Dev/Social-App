import type { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  ForbiddenException,
} from "../utils/response/error.response";
import { decodedToken, TokenEnum } from "../utils/security/token.security";
import { RoleEnum } from "../DB/model/user.model";

export const authentication = (tokenType: TokenEnum = TokenEnum.access) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      throw new BadRequestException("Validation Error", {
        key: "headers",
        issues: [{ path: "authorization", message: "Missing Authorization " }],
      });
    }
    const { decoded, user } = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
    });
    req.user = user;
    req.decoded = decoded;
    next();
  };
};

export const authorization = (
  accessRoles: RoleEnum[] = [],
  tokenType: TokenEnum = TokenEnum.access
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      throw new BadRequestException("Validation Error", {
        key: "headers",
        issues: [{ path: "authorization", message: "Missing Authorization " }],
      });
    }

    const { decoded, user } = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
    });

    if (accessRoles.length && !accessRoles.includes(user.role)) {
      throw new ForbiddenException("Not Authorized Account");
    }

    req.user = user;
    req.decoded = decoded;
    next();
  };
};
