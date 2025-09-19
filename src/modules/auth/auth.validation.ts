import { email, z } from "zod";
import { generalFields } from "../middleware/validation.middleware";

export const login = {
  body: z.strictObject({
    email: generalFields.email,
    password: generalFields.password,
  }),
};
export const signup = {
  body: login.body
    .extend({
      username: generalFields.username,
      confirmPassword: generalFields.confirmPassword,
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
export const confirmEmail = {
  body: z.strictObject({
    email: generalFields.email,
    otp: generalFields.otp,
  }),
};
export const signupWIthGmail={
  body:z.strictObject({
idToken:z.string()
  })
}
export const sendForgotPasswordCode ={
  body:z.strictObject({
email:generalFields.email
  })
}
export const verfiyForgotPasswordCode ={
  body:sendForgotPasswordCode.body.extend({
otp:generalFields.otp
  })
}
export const resetForgotPasswordCode ={
  body:verfiyForgotPasswordCode.body.extend({
password:generalFields.password,
confirmPassword:generalFields.confirmPassword ,

  }).refine((data)=>{
    return data.password===data.confirmPassword
  },{message:"password misMatch with confirm password",path:["confirmPasword"]})

  
}
