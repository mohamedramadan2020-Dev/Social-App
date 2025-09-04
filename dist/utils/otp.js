"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genrateNumperOtp = void 0;
const genrateNumperOtp = () => {
    return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
};
exports.genrateNumperOtp = genrateNumperOtp;
