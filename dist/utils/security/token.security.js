"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokeToken = exports.decodedToken = exports.createLoginCredentials = exports.getSigneture = exports.detectSignetureLevel = exports.verifeyToken = exports.genrateToken = exports.logoutEnum = exports.tokenEnum = exports.signetureLevelEnum = void 0;
const uuid_1 = require("uuid");
const jsonwebtoken_1 = require("jsonwebtoken");
const User_model_1 = require("../../DB/model/User.model");
const error_response_1 = require("../response/error.response");
const userModel_repository_1 = require("../../DB/repository/userModel.repository");
const token_model_1 = require("../../DB/model/token.model");
const token_repository_1 = require("../../DB/repository/token.repository");
var signetureLevelEnum;
(function (signetureLevelEnum) {
    signetureLevelEnum["Bearer"] = "Bearer";
    signetureLevelEnum["System"] = "System";
})(signetureLevelEnum || (exports.signetureLevelEnum = signetureLevelEnum = {}));
var tokenEnum;
(function (tokenEnum) {
    tokenEnum["access"] = "access";
    tokenEnum["refresh"] = "refresh";
})(tokenEnum || (exports.tokenEnum = tokenEnum = {}));
var logoutEnum;
(function (logoutEnum) {
    logoutEnum["only"] = "only";
    logoutEnum["all"] = "all";
})(logoutEnum || (exports.logoutEnum = logoutEnum = {}));
const genrateToken = async ({ payload, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) }, }) => {
    return (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.genrateToken = genrateToken;
const verifeyToken = async ({ token, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, }) => {
    return (0, jsonwebtoken_1.verify)(token, secret);
};
exports.verifeyToken = verifeyToken;
const detectSignetureLevel = async (role = User_model_1.RoleEnum.user) => {
    let signetureLevel = signetureLevelEnum.Bearer;
    switch (role) {
        case User_model_1.RoleEnum.admin:
            signetureLevel = signetureLevelEnum.System;
            break;
        default:
            signetureLevel = signetureLevelEnum.Bearer;
            break;
    }
    return signetureLevel;
};
exports.detectSignetureLevel = detectSignetureLevel;
const getSigneture = async (signetureLevel = signetureLevelEnum.Bearer) => {
    let signetures = {
        access_signatures: "",
        refresh_signeatures: "",
    };
    switch (signetureLevel) {
        case signetureLevelEnum.System:
            signetures.access_signatures = process.env
                .ACCESS_SYSTEM_TOKEN_SIGNATURE;
            signetures.refresh_signeatures = process.env
                .REFRESH_SYSTEM_TOKEN_SIGNATURE;
            break;
        default:
            signetures.access_signatures = process.env
                .ACCESS_USER_TOKEN_SIGNATURE;
            signetures.refresh_signeatures = process.env
                .REFRESH_USER_TOKEN_SIGNATURE;
            break;
    }
    return signetures;
};
exports.getSigneture = getSigneture;
const createLoginCredentials = async (user) => {
    const jwtid = (0, uuid_1.v4)();
    const signetureLevel = await (0, exports.detectSignetureLevel)(user.role);
    const signetures = await (0, exports.getSigneture)(signetureLevel);
    const accessToken = await (0, exports.genrateToken)({
        payload: { _id: user._id },
        secret: signetures.access_signatures,
        options: { expiresIn: Number(process.env.Access_TOKEN_EXPIRES_IN), jwtid },
    });
    const refreshToken = await (0, exports.genrateToken)({
        payload: { _id: user._id },
        secret: signetures.refresh_signeatures,
        options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN), jwtid },
    });
    return { accessToken, refreshToken };
};
exports.createLoginCredentials = createLoginCredentials;
const decodedToken = async ({ authorization, tokentype = tokenEnum.access, }) => {
    const userModel = new userModel_repository_1.UserRepository(User_model_1.UserModel);
    const tokenmodel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    const [bearerkey, token] = authorization.split(" ");
    if (!bearerkey || !token) {
        throw new error_response_1.unauthorizedException("missing token parts");
    }
    const signetures = await (0, exports.getSigneture)(bearerkey);
    const decoded = await (0, exports.verifeyToken)({
        token,
        secret: tokentype === tokenEnum.refresh
            ? signetures.refresh_signeatures
            : signetures.access_signatures,
    });
    if (!decoded?._id) {
        throw new error_response_1.BadRequestException("invalid token payload");
    }
    if (await tokenmodel.findOne({ filter: { jti: decoded.jti } })) {
        throw new error_response_1.unauthorizedException("invlid or old credentials");
    }
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user) {
        throw new error_response_1.BadRequestException("not registered account");
    }
    if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
        throw new error_response_1.unauthorizedException("invlid or old credentials");
    }
    return { user, decoded };
};
exports.decodedToken = decodedToken;
const createRevokeToken = async (decoded) => {
    const tokenModel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    const [result] = (await tokenModel.create({
        data: [
            {
                jti: decoded.jti,
                expiresIn: decoded.iat +
                    Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                userId: decoded._id,
            },
        ],
    })) || [];
    if (!result) {
        throw new error_response_1.BadRequestException("Fail to revoke this token");
    }
    return result;
};
exports.createRevokeToken = createRevokeToken;
