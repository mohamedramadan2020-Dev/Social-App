import type { Request, Response } from "express";
import { IconfirmEmailInbutsDto, IsignupBodyInbutsDto } from "./auth.dto";
// import { DataBaseRepository } from "../../DB/repository/dataBase.repository";
import { UserModel } from "../../DB/model/User.model";
import {
  BadRequestException,
  conflictException,
  NotFoundException,
} from "../../utils/response/error.response";
import { UserRepository } from "../../DB/repository/userModel.repository";
import { compareHash, genrateHash } from "../../utils/security/hash.security";
import { emailEvent } from "../../utils/event/email.event";
import { genrateNumperOtp } from "../../utils/otp";

class AuthenticationService {
  private userModel = new UserRepository(UserModel);
  constructor() {}
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
    const { email } = req.body;
    return res.status(200).json({ message: "logedin ✔", data: { email } });
  };
}

export default new AuthenticationService();
