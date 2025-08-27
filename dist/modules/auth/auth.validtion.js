"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = exports.login = void 0;
const zod_1 = require("zod");
const validation_middle_ware_1 = require("../middleware/validation.middle.ware");
exports.login = {
    body: zod_1.z.strictObject({
        email: validation_middle_ware_1.generalFields.email,
        password: validation_middle_ware_1.generalFields.password,
    }),
};
exports.signup = {
    body: exports.login.body
        .extend({
        username: validation_middle_ware_1.generalFields.username,
        confirmPassword: validation_middle_ware_1.generalFields.confirmPassword,
    })
        .superRefine((data, ctx) => {
        if (data.confirmPassword !== data.password) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "confirm password not match with password",
            });
        }
    }),
};
