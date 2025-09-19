import { Router } from "express";
import authservice from "./auth.service";
import { validation } from "../middleware/validation.middleware";
import * as validators from "./auth.validation";
const router: Router = Router();
router.post("/signup", validation(validators.signup), authservice.signup);
router.patch(
  "/confirm-email",
  validation(validators.confirmEmail),
  authservice.confirmEmail
);

router.post(
  "/signup-gmail",
  validation(validators.signupWIthGmail),
  authservice.signupWIthGmail
);
router.post(
  "/login-gmail",
  validation(validators.signupWIthGmail),
  authservice.loginWIthGmail
);

router.post("/login", validation(validators.login), authservice.login);

router.patch(
  "/send-forgot-password",
  validation(validators.sendForgotPasswordCode),
  authservice.sendForgotCode
);
router.patch(
  "/verify-forgot-password",
  validation(validators.verfiyForgotPasswordCode),
  authservice.verifyForgotCode
);
router.patch(
  "/reset-forgot-password",
  validation(validators.resetForgotPasswordCode),
  authservice.resetForgotCode
);
export default router;
