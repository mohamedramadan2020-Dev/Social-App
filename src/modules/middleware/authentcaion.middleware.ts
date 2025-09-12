import { NextFunction, Request, Response } from "express";
import { decodedToken, tokenEnum } from "../../utils/security/token.security";
import {
  BadRequestException,
  forbiddenException,
} from "../../utils/response/error.response";
import { HUserDoucment, RoleEnum } from "../../DB/model/User.model";
import { JwtPayload } from "jsonwebtoken";
export interface IAuthReq extends Request {
  user: HUserDoucment;
  decoded: JwtPayload;
}
export const authentcation = (tokentype:tokenEnum=tokenEnum.access) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      throw new BadRequestException("validation error", {
        key: "headers",
        issues: [{ path: "authorization", message: "missing authorization" }],
      });
    }
    
    const { decoded, user } = await decodedToken({ authorization: req.headers.authorization ,tokentype});
    req.user = user;
    req.decoded = decoded;

    next();
  };
};
export const authorization = (accessRoles: RoleEnum[] = [],tokentype:tokenEnum=tokenEnum.access) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      throw new BadRequestException("validation error", {
        key: "headers",
        issues: [{ path: "authorization", message: "missing authorization" }],
      });
    }
   
    const { decoded, user } = await decodedToken({ authorization: req.headers.authorization,tokentype });

    if (!accessRoles.includes(user.role)) {
      throw new forbiddenException("not autherized account");
    }

    req.user = user;
    req.decoded = decoded;

    next();
  };
};
