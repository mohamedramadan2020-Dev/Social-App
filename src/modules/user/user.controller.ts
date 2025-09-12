import { Router } from "express";
import userService from "./user.service";
import { authentcation } from "../middleware/authentcaion.middleware";
import { validation } from "../middleware/validation.middleware";
    import * as validators from "./user.validation"
import { tokenEnum } from "../../utils/security/token.security";
const router=Router()



router.get("/profile",authentcation(),userService.profile)
router.post("/refresh_token",authentcation(tokenEnum.refresh),userService.refreshToken)
router.post("/logout",authentcation(),validation(validators.logout),userService.logout)
export default router