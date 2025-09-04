"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const sendEmail_1 = require("../email/sendEmail");
const verify_template_email_1 = require("../email/verify.template.email");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("confirmEmail", async (data) => {
    try {
        data.subject = "confirmEmail";
        data.html = (0, verify_template_email_1.verifyEmail)({ otp: data.otp, title: "EmailConfirmation🔑" });
        await (0, sendEmail_1.sendEmail)(data);
    }
    catch (error) {
        console.log("fail to send email", error);
    }
});
