"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.genrateHash = void 0;
const bcrypt_1 = require("bcrypt");
const genrateHash = async (plainText, salt = Number(process.env.SALT)) => {
    return await (0, bcrypt_1.hash)(plainText, salt);
};
exports.genrateHash = genrateHash;
const compareHash = async (plainText, hash) => {
    return await (0, bcrypt_1.compare)(plainText, hash);
};
exports.compareHash = compareHash;
