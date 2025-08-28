"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataBase_repository_1 = require("../../DB/repository/dataBase.repository");
const User_model_1 = require("../../DB/model/User.model");
const error_response_1 = require("../../utils/response/error.response");
class AuthenticationService {
    userModel = new dataBase_repository_1.DataBaseRepository(User_model_1.UserModel);
    constructor() { }
    signup = async (req, res) => {
        let { username, email, password } = req.body;
        console.log(username, email, password);
        const [user] = (await this.userModel.create({
            data: [{ username, email, password }],
            options: { validateBeforeSave: true },
        })) || [];
        if (!user) {
            throw new error_response_1.BadRequestException("fail to signUp");
        }
        return res
            .status(201)
            .json({ message: "user created sucssefuly", data: { user } });
    };
    login = async (req, res) => {
        const { email } = req.body;
        return res.status(200).json({ message: "logedin ✔", data: { email } });
    };
}
exports.default = new AuthenticationService();
