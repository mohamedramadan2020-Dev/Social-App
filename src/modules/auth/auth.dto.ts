
import {z} from "zod";
import * as validators from "./auth.validtion"

export type IsignupBodyInbutsDto = z.infer<typeof validators.signup.body>
export type IconfirmEmailInbutsDto = z.infer<typeof validators.confirmEmail.body>
