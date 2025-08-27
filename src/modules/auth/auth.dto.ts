
import {z} from "zod";
import * as validators from "./auth.validtion"

export type IsignupBodyInbutsDto = z.infer<typeof validators.signup.body>
