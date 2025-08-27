import { Router } from "express";
import authservice from "./auth.service";
import { validation } from "../middleware/validation.middle.ware";
import  * as validators from "./auth.validtion";
const router:Router=Router()
router.post("/signup",validation(validators.signup),authservice.signup)
router.post("/login",validation(validators.login),authservice.login)
export default router