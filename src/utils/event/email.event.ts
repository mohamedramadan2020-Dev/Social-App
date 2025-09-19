import {} from "node:events"
import { EventEmitter } from "node:events"
import Mail from "nodemailer/lib/mailer"
import { sendEmail } from "../email/sendEmail"
import { verifyEmail } from "../email/verify.template.email"
interface IEmail extends Mail.Options{
    otp:number
}
export  const emailEvent=new EventEmitter()

emailEvent.on("confirmEmail",async(data:IEmail)=>{

try {
    data.subject="confirmEmail"
    data.html=verifyEmail({otp:data.otp, title:"EmailConfirmation🔑"})
    await sendEmail(data)
} catch (error) {
    console.log("fail to send email",error);
    
}

} )
emailEvent.on("resetPassword",async(data:IEmail)=>{

try {
    data.subject="Reset-Email-Password"
    data.html=verifyEmail({otp:data.otp, title:"ResetPassword🔑"})
    await sendEmail(data)
} catch (error) {
    console.log("fail to send email",error);
    
}

} )