"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const error_response_1 = require("../response/error.response");
const sendEmail = async (data) => {
    if (!data.text && !data.html && !data.attachments) {
        throw new error_response_1.BadRequestException("missing message content");
    }
    const transporter = (0, nodemailer_1.createTransport)({
        service: "gmail",
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    });
    const info = await transporter.sendMail({
        ...data,
        from: `"${process.env.APPLICATION_NAME}" <${process.env.USER}>`,
    });
    console.log("Message sent:", info.messageId);
};
exports.sendEmail = sendEmail;
