"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const User_model_1 = require("./model/User.model");
const conectDb = async () => {
    try {
        const result = await (0, mongoose_1.connect)(process.env.DB_URI, {
            serverSelectionTimeoutMS: 30000,
        });
        await User_model_1.UserModel.syncIndexes();
        console.log(result.models);
        console.log("db conected successfully 🚀");
    }
    catch (error) {
        console.log("failed to conect to DB ❌");
    }
};
exports.default = conectDb;
