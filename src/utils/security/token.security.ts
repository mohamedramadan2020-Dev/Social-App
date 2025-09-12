import {v4 as uuid} from"uuid"
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { sign, verify } from "jsonwebtoken";
import { HUserDoucment, RoleEnum, UserModel } from "../../DB/model/User.model";

import {
  BadRequestException,
  unauthorizedException,
} from "../response/error.response";
import { UserRepository } from "../../DB/repository/userModel.repository";
import { HTokenDocument, TokenModel } from "../../DB/model/token.model";
import { TokenRepository } from "../../DB/repository/token.repository";
export enum signetureLevelEnum {
  Bearer = "Bearer",
  System = "System",
}
export enum tokenEnum {
  access = "access",
  refresh = "refresh",
}
export enum logoutEnum {
  only= "only",
all= "all",
}

export const genrateToken = async ({
  payload,
  secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
  options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) },
}: {
  payload: object;
  secret?: Secret;
  options?: SignOptions;
}): Promise<string> => {
  return sign(payload, secret, options);
};
export const verifeyToken = async ({
  token,
  secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
}: {
  token: string;
  secret: Secret;
}): Promise<JwtPayload>=> {
  return verify(token, secret) as JwtPayload;
};

export const detectSignetureLevel = async (
  role: RoleEnum = RoleEnum.user
): Promise<signetureLevelEnum> => {
  let signetureLevel: signetureLevelEnum = signetureLevelEnum.Bearer;
  switch (role) {
    case RoleEnum.admin:
      signetureLevel = signetureLevelEnum.System;
      break;
    default:
      signetureLevel = signetureLevelEnum.Bearer;
      break;
  }
  return signetureLevel;
};

export const getSigneture = async (
  signetureLevel: signetureLevelEnum = signetureLevelEnum.Bearer
): Promise<{ access_signatures: string; refresh_signeatures: string }> => {
  let signetures: { access_signatures: string; refresh_signeatures: string } = {
    access_signatures: "",
    refresh_signeatures: "",
  };
  switch (signetureLevel) {
    case signetureLevelEnum.System:
      signetures.access_signatures = process.env
        .ACCESS_SYSTEM_TOKEN_SIGNATURE as string;
      signetures.refresh_signeatures = process.env
        .REFRESH_SYSTEM_TOKEN_SIGNATURE as string;
      break;
    default:
      signetures.access_signatures = process.env
        .ACCESS_USER_TOKEN_SIGNATURE as string;
      signetures.refresh_signeatures = process.env
        .REFRESH_USER_TOKEN_SIGNATURE as string;
      break;
  }
  return signetures;
};
export const createLoginCredentials = async (user: HUserDoucment) => {
  const jwtid= uuid()
  const signetureLevel = await detectSignetureLevel(user.role);
  const signetures = await getSigneture(signetureLevel);
  const accessToken = await genrateToken({
    payload: { _id: user._id },
    secret: signetures.access_signatures,
    options: { expiresIn: Number(process.env.Access_TOKEN_EXPIRES_IN),jwtid },
  });
  const refreshToken = await genrateToken({
    payload: { _id: user._id },
    secret: signetures.refresh_signeatures,
    options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),jwtid },
  });
  return { accessToken, refreshToken };
};

export const decodedToken = async ({
  authorization,
  tokentype = tokenEnum.access,
}: {
  authorization: string;
  tokentype?: tokenEnum;
}) => {
  const userModel = new UserRepository(UserModel);
  const tokenmodel = new TokenRepository(TokenModel);
  const [bearerkey, token] = authorization.split(" ");
  if (!bearerkey || !token) {
    throw new unauthorizedException("missing token parts");
  }

  const signetures = await getSigneture(bearerkey as signetureLevelEnum);
  const decoded = await verifeyToken({
    token,
    secret:
      tokentype === tokenEnum.refresh
        ? signetures.refresh_signeatures
        : signetures.access_signatures,
  });

  if (!decoded?._id) {
    throw new BadRequestException("invalid token payload");
  }
if (await  tokenmodel.findOne({filter:{jti:decoded.jti}})){
throw new unauthorizedException("invlid or old credentials")

}
  const user = await userModel.findOne({ filter: { _id: decoded._id } });
  if (!user) {
    throw new BadRequestException("not registered account");
  }

  if ((user.changeCredentialsTime?.getTime()||0 )> (decoded.iat as number) *1000){
throw new unauthorizedException("invlid or old credentials")}
  return { user, decoded };
};



export const createRevokeToken = async (decoded: JwtPayload):Promise<HTokenDocument> => {
  const tokenModel = new TokenRepository(TokenModel);

  const [result] = (
    await tokenModel.create({
      data: [
        {
          jti: decoded.jti as string,
          expiresIn:
            (decoded.iat as number) +
            Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
          userId: decoded._id,
        },
      ],
    })
  ) || [];

  if (!result) {
    throw new BadRequestException("Fail to revoke this token");
  }

  return result;
};
