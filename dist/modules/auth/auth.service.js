"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_model_1 = require("../../DB/model/User.model");
const error_response_1 = require("../../utils/response/error.response");
const userModel_repository_1 = require("../../DB/repository/userModel.repository");
const hash_security_1 = require("../../utils/security/hash.security");
const email_event_1 = require("../../utils/event/email.event");
const otp_1 = require("../../utils/otp");
const token_security_1 = require("../../utils/security/token.security");
const google_auth_library_1 = require("google-auth-library");
class AuthenticationService {
    userModel = new userModel_repository_1.UserRepository(User_model_1.UserModel);
    constructor() { }
    async verifyGmailAccount(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_ID?.split(",") || [],
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new error_response_1.BadRequestException("fail to verfiy this google account ");
        }
        return payload;
    }
    loginWIthGmail = async (req, res) => {
        const { idToken } = req.body;
        const { email } = await this.verifyGmailAccount(idToken);
        const user = await this.userModel.findOne({
            filter: { email, provider: User_model_1.providerEnum.google },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("email not exist or not registered");
        }
        const credentials = await (0, token_security_1.createLoginCredentials)(user);
        return res.status(200).json({ message: "done", data: { credentials } });
    };
    signupWIthGmail = async (req, res) => {
        const { idToken } = req.body;
        const { email, name, family_name, given_name, picture } = await this.verifyGmailAccount(idToken);
        const user = await this.userModel.findOne({ filter: { email } });
        if (user) {
            if (user.provider === User_model_1.providerEnum.google) {
                return await this.loginWIthGmail(req, res);
            }
            throw new error_response_1.conflictException(`email exist with another provider::${user.provider}`);
        }
        const [newUser] = (await this.userModel.create({
            data: [
                {
                    firstName: given_name,
                    email: email,
                    lastName: family_name,
                    profilImage: picture,
                    confirmedAt: new Date(),
                    provider: User_model_1.providerEnum.google,
                },
            ],
        })) || [];
        if (!newUser) {
            throw new error_response_1.BadRequestException("fail to signup with gmail try again later");
        }
        const credentials = await (0, token_security_1.createLoginCredentials)(newUser);
        return res.status(201).json({ message: "done", data: { credentials } });
    };
    signup = async (req, res) => {
        let { username, email, password } = req.body;
        const checkUserExist = await this.userModel.findOne({
            filter: { email },
            select: "email",
            options: { lean: false },
        });
        const otp = (0, otp_1.genrateNumperOtp)();
        console.log({ checkUserExist });
        if (checkUserExist) {
            throw new error_response_1.conflictException("email exist");
        }
        const user = await this.userModel.createUser({
            data: [
                {
                    username,
                    email,
                    password: await (0, hash_security_1.genrateHash)(password),
                    confirmEmailOtp: await (0, hash_security_1.genrateHash)(String(otp)),
                },
            ],
            options: { validateBeforeSave: true },
        });
        if (!user) {
            throw new error_response_1.BadRequestException("fail to signUp");
        }
        email_event_1.emailEvent.emit("confirmEmail", { to: email, otp });
        return res
            .status(201)
            .json({ message: "user created sucssefuly", data: { user } });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                confirmEmailOtp: { $exists: true },
                confirmedAt: { $exists: false },
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("Invalid account Or already confirmed");
        }
        if (!(await (0, hash_security_1.compareHash)(otp, user.confirmEmailOtp))) {
            throw new error_response_1.conflictException("invalid confirmation code");
        }
        await this.userModel.updateOne({
            filter: { email },
            update: { confirmedAt: new Date(), $unset: { confirmEmailOtp: 1 } },
        });
        return res.status(200).json({ message: "Email Confirmed ✔" });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, provider: User_model_1.providerEnum.system },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("invlaid login data");
        }
        if (!user.confirmedAt) {
            throw new error_response_1.BadRequestException("verifey your account first");
        }
        if (!(await (0, hash_security_1.compareHash)(password, user.password))) {
            throw new error_response_1.BadRequestException("invlaid login data");
        }
        const credentials = await (0, token_security_1.createLoginCredentials)(user);
        return res
            .status(200)
            .json({ message: "logedin ✔", data: { credentials } });
    };
    sendForgotCode = async (req, res) => {
        const { email } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: User_model_1.providerEnum.system,
                confirmedAt: { $exists: true },
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("invlaid account");
        }
        const otp = (0, otp_1.genrateNumperOtp)();
        const result = await this.userModel.updateOne({
            filter: { email },
            update: { resetPasswordOtp: await (0, hash_security_1.genrateHash)(String(otp)) },
        });
        if (!result.matchedCount) {
            throw new error_response_1.BadRequestException(`fail to send reset password code`);
        }
        email_event_1.emailEvent.emit("resetPassword", { to: email, otp });
        return res.json({ message: "Done ✔" });
    };
    verifyForgotCode = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: User_model_1.providerEnum.system,
                resetPasswordOtp: { $exists: true }
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("invlaid account");
        }
        if (!await (0, hash_security_1.compareHash)(otp, user.resetPasswordOtp)) {
            throw new error_response_1.conflictException(`invalid otp`);
        }
        return res.json({ message: "Done ✔" });
    };
    resetForgotCode = async (req, res) => {
        const { email, otp, password } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: User_model_1.providerEnum.system,
                resetPasswordOtp: { $exists: true }
            },
        });
        if (!user) {
            throw new error_response_1.NotFoundException("invlaid account");
        }
        if (!await (0, hash_security_1.compareHash)(otp, user.resetPasswordOtp)) {
            throw new error_response_1.conflictException(`invalid otp`);
        }
        const result = await this.userModel.updateOne({
            filter: { email },
            update: { password: await (0, hash_security_1.genrateHash)(password), changeCredentialsTime: new Date(), $unset: { resetPasswordOtp: 1 } },
        });
        if (!result.matchedCount) {
            throw new error_response_1.BadRequestException(`fail to  reset acccount password`);
        }
        return res.json({ message: "Done ✔" });
    };
}
exports.default = new AuthenticationService();
