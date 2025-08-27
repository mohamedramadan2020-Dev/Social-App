"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationService {
    constructor() { }
    signup(req, res) {
        let { username, email, password } = req.body;
        console.log(username, email, password);
        return res
            .status(201)
            .json({ message: "user created sucssefuly", data: req.body });
    }
    login(req, res) {
        const { email } = req.body;
        return res.status(200).json({ message: "logedin ✔", data: { email } });
    }
}
exports.default = new AuthenticationService();
