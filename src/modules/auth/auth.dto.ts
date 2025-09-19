import { z } from "zod";
import * as validators from "./auth.validation";

export type IsignupBodyInbutsDto = z.infer<typeof validators.signup.body>;
export type IloginBodyInbutsDto = z.infer<typeof validators.login.body>;
export type IsendForgotPasswordCodeDto = z.infer<
  typeof validators.sendForgotPasswordCode.body
>;
export type IverifyForgotPasswordCodeDto = z.infer<
  typeof validators.verfiyForgotPasswordCode.body
>;
export type IresetForgotPasswordCodeDto = z.infer<
  typeof validators.resetForgotPasswordCode.body
>;
export type IconfirmEmailInbutsDto = z.infer<
  typeof validators.confirmEmail.body
>;
export type IGmailDto = z.infer<typeof validators.signupWIthGmail.body>;
