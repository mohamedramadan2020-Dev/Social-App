"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_security_1 = require("../../utils/security/token.security");
const User_model_1 = require("../../DB/model/User.model");
const userModel_repository_1 = require("../../DB/repository/userModel.repository");
const token_repository_1 = require("../../DB/repository/token.repository");
const token_model_1 = require("../../DB/model/token.model");
class UserService {
    userModel = new userModel_repository_1.UserRepository(User_model_1.UserModel);
    tokenModel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    constructor() { }
    profile = async (req, res) => {
        return res.json({
            message: "done",
            data: { user: req.user, decoded: req.decoded },
        });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        let statusCode = 200;
        const update = {};
        switch (flag) {
            case token_security_1.logoutEnum.all:
                update.changeCredentialsTime = new Date();
                break;
            default:
                await (0, token_security_1.createRevokeToken)(req.decoded);
                statusCode = 201;
                break;
        }
        await this.userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update,
        });
        return res.status(statusCode).json({
            message: "done",
            data: { user: req.user, decoded: req.decoded },
        });
    };
    refreshToken = async (req, res) => {
        const Credentials = await (0, token_security_1.createLoginCredentials)(req.user);
        await (0, token_security_1.createRevokeToken)(req.decoded);
        return res.status(201).json({ message: "done", data: { Credentials } });
    };
}
exports.default = new UserService();
