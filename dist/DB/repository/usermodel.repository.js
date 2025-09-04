"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const dataBase_repository_1 = require("./dataBase.repository");
const error_response_1 = require("../../utils/response/error.response");
class UserRepository extends dataBase_repository_1.DataBaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createUser({ data, options }) {
        const [user] = (await this.create({ data, options })) || [];
        if (!user) {
            throw new error_response_1.BadRequestException("user not created");
        }
        return user;
    }
}
exports.UserRepository = UserRepository;
