"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_model_1 = require("../../DB/model/User.model");
const error_response_1 = require("../../utils/response/error.response");
const userModel_repository_1 = require("../../DB/repository/userModel.repository");
const hash_security_1 = require("../../utils/security/hash.security");
const email_event_1 = require("../../utils/event/email.event");
const otp_1 = require("../../utils/otp");
const token_security_1 = require("../../utils/security/token.security");
class AuthenticationService {
    userModel = new userModel_repository_1.UserRepository(User_model_1.UserModel);
    constructor() { }
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
        const user = await this.userModel.findOne({ filter: { email } });
        if (!user) {
            throw new error_response_1.NotFoundException("invlaid login data");
        }
        if (!user.confirmedAt) {
            throw new error_response_1.BadRequestException("verifey your account first");
        }
        if (!await (0, hash_security_1.compareHash)(password, user.password)) {
            throw new error_response_1.BadRequestException("invlaid login data");
        }
        const credentials = await (0, token_security_1.createLoginCredentials)(user);
        return res.status(200).json({ message: "logedin ✔", data: { credentials } });
    };
}
exports.default = new AuthenticationService();
