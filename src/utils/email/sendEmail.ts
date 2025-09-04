import { createTransport, type Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { BadRequestException } from "../response/error.response";

export const sendEmail=async(data:Mail.Options):Promise<void> =>{
if(!data.text&& !data.html&& ! data.attachments){
  throw new BadRequestException("missing message content")
}
const transporter: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> = createTransport({
service:"gmail",
  auth: {
    user:process.env.USER as string,
    pass:process.env.PASS as string ,
  },
});

const info = await transporter.sendMail({
  ...data,
    from: `"${process.env.APPLICATION_NAME}" <${process.env.USER}>`,

    
})

  console.log("Message sent:", info.messageId);
}