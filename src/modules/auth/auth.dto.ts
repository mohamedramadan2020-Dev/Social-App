
import {z} from "zod";
import * as validators from "./auth.validtion"

export type IsignupBodyInbutsDto = z.infer<typeof validators.signup.body>
export type IloginBodyInbutsDto = z.infer<typeof validators.login.body>
export type IconfirmEmailInbutsDto = z.infer<typeof validators.confirmEmail.body>
