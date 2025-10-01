"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokeToken = exports.decodedToken = exports.createLoginCredentials = exports.getSignature = exports.detectSignature = exports.VerifyToken = exports.generateToken = exports.LogoutEnum = exports.TokenEnum = exports.signatureLevelEnum = void 0;
const uuid_1 = require("uuid");
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../../DB/model/user.model");
const error_response_1 = require("../response/error.response");
const repository_1 = require("../../DB/repository/");
const token_model_1 = require("../../DB/model/token.model");
var signatureLevelEnum;
(function (signatureLevelEnum) {
    signatureLevelEnum["bearer"] = "Bearer";
    signatureLevelEnum["system"] = "System";
})(signatureLevelEnum || (exports.signatureLevelEnum = signatureLevelEnum = {}));
var TokenEnum;
(function (TokenEnum) {
    TokenEnum["access"] = "access";
    TokenEnum["refresh"] = "refresh";
})(TokenEnum || (exports.TokenEnum = TokenEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum["only"] = "only";
    LogoutEnum["all"] = "all";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
const generateToken = async ({ payload, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, options = {
    expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
}, }) => {
    return (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const VerifyToken = async ({ token, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, }) => {
    return (0, jsonwebtoken_1.verify)(token, secret);
};
exports.VerifyToken = VerifyToken;
const detectSignature = async (role = user_model_1.RoleEnum.user) => {
    let signatureLevel = signatureLevelEnum.bearer;
    switch (role) {
        case user_model_1.RoleEnum.admin:
        case user_model_1.RoleEnum.superAdmin:
            signatureLevel = signatureLevelEnum.system;
            break;
        default:
            signatureLevel = signatureLevelEnum.bearer;
            break;
    }
    return signatureLevel;
};
exports.detectSignature = detectSignature;
const getSignature = async (signatureLevel = signatureLevelEnum.bearer) => {
    let signatures = {
        access_signature: "",
        refresh_signature: "",
    };
    switch (signatureLevel) {
        case signatureLevelEnum.system:
            signatures.access_signature = process.env
                .ACCESS_SYSTEM_TOKEN_SIGNATURE;
            signatures.refresh_signature = process.env
                .REFRESH_SYSTEM_TOKEN_SIGNATURE;
            break;
        default:
            signatures.access_signature = process.env
                .ACCESS_USER_TOKEN_SIGNATURE;
            signatures.refresh_signature = process.env
                .REFRESH_USER_TOKEN_SIGNATURE;
            break;
    }
    return signatures;
};
exports.getSignature = getSignature;
const createLoginCredentials = async (user) => {
    const signatureLevel = await (0, exports.detectSignature)(user.role);
    const signatures = await (0, exports.getSignature)(signatureLevel);
    console.log(signatures);
    const jwtid = (0, uuid_1.v4)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.access_signature,
        options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN), jwtid },
    });
    const refresh_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.refresh_signature,
        options: {
            expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
            jwtid,
        },
    });
    return { access_token, refresh_token };
};
exports.createLoginCredentials = createLoginCredentials;
const decodedToken = async ({ authorization, tokenType = TokenEnum.access, }) => {
    const userModel = new repository_1.userRepository(user_model_1.UserModel);
    const tokenModel = new repository_1.TokenRepository(token_model_1.TokenModel);
    const [bearerKey, token] = authorization.split(" ");
    if (!bearerKey || !token) {
        throw new error_response_1.UnauthorizedException("Missing Token Parts");
    }
    const signatures = await (0, exports.getSignature)(bearerKey);
    const decoded = await (0, exports.VerifyToken)({
        token,
        secret: tokenType === TokenEnum.refresh
            ? signatures.refresh_signature
            : signatures.access_signature,
    });
    if (!decoded._id || !decoded.iat) {
        throw new error_response_1.BadRequestException("Invalid Token Payload");
    }
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } })) {
        throw new error_response_1.UnauthorizedException("Invalid Or Old Login Credentials");
    }
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user) {
        throw new error_response_1.BadRequestException("Not Register Account");
    }
    if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
        throw new error_response_1.UnauthorizedException("Invalid Or Old Login Credentials");
    }
    return { user, decoded };
};
exports.decodedToken = decodedToken;
const createRevokeToken = async (decoded) => {
    const tokenModel = new repository_1.TokenRepository(token_model_1.TokenModel);
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
        throw new error_response_1.BadRequestException("Fail To Revoke This Token");
    }
    return result;
};
exports.createRevokeToken = createRevokeToken;
