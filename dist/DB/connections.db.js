"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_model_1 = require("./model/user.model");
const connectDB = async () => {
    try {
        const result = await (0, mongoose_1.connect)(process.env.DB_URI, {
            serverSelectionTimeoutMS: 30000,
        });
        await user_model_1.UserModel.syncIndexes();
        console.log(result.models);
        console.log(`DB connected successfully 🚀`);
    }
    catch (error) {
        console.log(`fail to connect DB ❌`);
    }
};
exports.default = connectDB;
