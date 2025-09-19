"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetForgotPasswordCode = exports.verfiyForgotPasswordCode = exports.sendForgotPasswordCode = exports.signupWIthGmail = exports.confirmEmail = exports.signup = exports.login = void 0;
const zod_1 = require("zod");
const validation_middleware_1 = require("../middleware/validation.middleware");
exports.login = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        password: validation_middleware_1.generalFields.password,
    }),
};
exports.signup = {
    body: exports.login.body
        .extend({
        username: validation_middleware_1.generalFields.username,
        confirmPassword: validation_middleware_1.generalFields.confirmPassword,
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
exports.confirmEmail = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email,
        otp: validation_middleware_1.generalFields.otp,
    }),
};
exports.signupWIthGmail = {
    body: zod_1.z.strictObject({
        idToken: zod_1.z.string()
    })
};
exports.sendForgotPasswordCode = {
    body: zod_1.z.strictObject({
        email: validation_middleware_1.generalFields.email
    })
};
exports.verfiyForgotPasswordCode = {
    body: exports.sendForgotPasswordCode.body.extend({
        otp: validation_middleware_1.generalFields.otp
    })
};
exports.resetForgotPasswordCode = {
    body: exports.verfiyForgotPasswordCode.body.extend({
        password: validation_middleware_1.generalFields.password,
        confirmPassword: validation_middleware_1.generalFields.confirmPassword,
    }).refine((data) => {
        return data.password === data.confirmPassword;
    }, { message: "password misMatch with confirm password", path: ["confirmPasword"] })
};
