import type { Request, Response } from "express";
import {
  IconfirmEmailInbutsDto,
  IGmailDto,
  IloginBodyInbutsDto,
  IsignupBodyInbutsDto,
  IverifyForgotPasswordCodeDto,
  IsendForgotPasswordCodeDto,
  IresetForgotPasswordCodeDto,
} from "./auth.dto";
// import { DataBaseRepository } from "../../DB/repository/dataBase.repository";
import { providerEnum, UserModel } from "../../DB/model/User.model";
import {
  BadRequestException,
  conflictException,
  NotFoundException,
} from "../../utils/response/error.response";
import { UserRepository } from "../../DB/repository/userModel.repository";
import { compareHash, genrateHash } from "../../utils/security/hash.security";
import { emailEvent } from "../../utils/event/email.event";
import { genrateNumperOtp } from "../../utils/otp";
import { createLoginCredentials } from "../../utils/security/token.security";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { string } from "zod";

class AuthenticationService {
  private userModel = new UserRepository(UserModel);
  constructor() {}

  private async verifyGmailAccount(idToken: string): Promise<TokenPayload> {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID?.split(",") || [],
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      throw new BadRequestException("fail to verfiy this google account ");
    }
    return payload;
  }
  loginWIthGmail = async (req: Request, res: Response): Promise<Response> => {
    const { idToken }: IGmailDto = req.body;
    const { email } = await this.verifyGmailAccount(idToken);

    const user = await this.userModel.findOne({
      filter: { email, provider: providerEnum.google },
    });

    if (!user) {
      throw new NotFoundException("email not exist or not registered");
    }

    const credentials = await createLoginCredentials(user);
    return res.status(200).json({ message: "done", data: { credentials } });
  };

  signupWIthGmail = async (req: Request, res: Response): Promise<Response> => {
    const { idToken }: IGmailDto = req.body;
    const { email, name, family_name, given_name, picture } =
      await this.verifyGmailAccount(idToken);

    const user = await this.userModel.findOne({ filter: { email } });

    if (user) {
      if (user.provider === providerEnum.google) {
        return await this.loginWIthGmail(req, res);
      }
      throw new conflictException(
        `email exist with another provider::${user.provider}`
      );
    }
    const [newUser] =
      (await this.userModel.create({
        data: [
          {
            firstName: given_name as string,
            email: email as string,
            lastName: family_name as string,
            profilImage: picture as string,
            confirmedAt: new Date(),
            provider: providerEnum.google,
          },
        ],
      })) || [];
    if (!newUser) {
      throw new BadRequestException(
        "fail to signup with gmail try again later"
      );
    }
    const credentials = await createLoginCredentials(newUser);
    return res.status(201).json({ message: "done", data: { credentials } });
  };

  // Signup
  signup = async (req: Request, res: Response): Promise<Response> => {
    let { username, email, password }: IsignupBodyInbutsDto = req.body;

    const checkUserExist = await this.userModel.findOne({
      filter: { email },
      select: "email",
      options: { lean: false },
    });
    const otp = genrateNumperOtp();
    console.log({ checkUserExist });

    if (checkUserExist) {
      throw new conflictException("email exist");
    }

    const user = await this.userModel.createUser({
      data: [
        {
          username,
          email,
          password: await genrateHash(password),
          confirmEmailOtp: await genrateHash(String(otp)),
        },
      ],
      options: { validateBeforeSave: true },
    });
    if (!user) {
      throw new BadRequestException("fail to signUp");
    }

    emailEvent.emit("confirmEmail", { to: email, otp });

    return res
      .status(201)
      .json({ message: "user created sucssefuly", data: { user } });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IconfirmEmailInbutsDto = req.body;

    const user = await this.userModel.findOne({
      filter: {
        email,
        confirmEmailOtp: { $exists: true },
        confirmedAt: { $exists: false },
      },
    });

    if (!user) {
      throw new NotFoundException("Invalid account Or already confirmed");
    }
    if (!(await compareHash(otp, user.confirmEmailOtp as string))) {
      throw new conflictException("invalid confirmation code");
    }
    await this.userModel.updateOne({
      filter: { email },
      update: { confirmedAt: new Date(), $unset: { confirmEmailOtp: 1 } },
    });
    return res.status(200).json({ message: "Email Confirmed ✔" });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: IloginBodyInbutsDto = req.body;
    const user = await this.userModel.findOne({
      filter: { email, provider: providerEnum.system },
    });

    if (!user) {
      throw new NotFoundException("invlaid login data");
    }
    if (!user.confirmedAt) {
      throw new BadRequestException("verifey your account first");
    }
    if (!(await compareHash(password, user.password))) {
      throw new BadRequestException("invlaid login data");
    }

    const credentials = await createLoginCredentials(user);

    return res
      .status(200)
      .json({ message: "logedin ✔", data: { credentials } });
  };

  sendForgotCode = async (req: Request, res: Response): Promise<Response> => {
    const { email }: IsendForgotPasswordCodeDto = req.body;
    const user = await this.userModel.findOne({
      filter: {
        email,
        provider: providerEnum.system,
        confirmedAt: { $exists: true },
      },
    });

    if (!user) {
      throw new NotFoundException("invlaid account");
    }
    const otp = genrateNumperOtp();
    const result = await this.userModel.updateOne({
      filter: { email },
      update: { resetPasswordOtp: await genrateHash(String(otp)) },
    });
    if (!result.matchedCount) {
      throw new BadRequestException(`fail to send reset password code`);
    }
    emailEvent.emit("resetPassword", { to: email, otp });
    return res.json({ message: "Done ✔" });
  };
  verifyForgotCode = async (req: Request, res: Response): Promise<Response> => {
    const { email , otp }: IverifyForgotPasswordCodeDto = req.body;
    const user = await this.userModel.findOne({
      filter: {
        email,
        provider: providerEnum.system,
        resetPasswordOtp:{$exists:true}
      },
    });

    if (!user) {
      throw new NotFoundException("invlaid account");
    }
    if(! await compareHash(otp,user.resetPasswordOtp as string)){
      throw new conflictException(`invalid otp`)
    }
  
    return res.json({ message: "Done ✔" });
  };
 resetForgotCode = async (req: Request, res: Response): Promise<Response> => {
    const { email , otp, password }:IresetForgotPasswordCodeDto = req.body;
    const user = await this.userModel.findOne({
      filter: {
        email,
        provider: providerEnum.system,
        resetPasswordOtp:{$exists:true}
      },
    });

    if (!user) {
      throw new NotFoundException("invlaid account");
    }
    if(! await compareHash(otp,user.resetPasswordOtp as string)){
      throw new conflictException(`invalid otp`)
    }const result = await this.userModel.updateOne({
      filter: { email },

      update: {password:await genrateHash(password),changeCredentialsTime:new Date(), $unset:{resetPasswordOtp:1} },
    });
    if (!result.matchedCount) {
      throw new BadRequestException(`fail to  reset acccount password`);
    }
  
    return res.json({ message: "Done ✔" });
  };
}
export default new AuthenticationService();
