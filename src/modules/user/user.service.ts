import { Request, Response } from "express";
import { IlogoutDto } from "./user.dto";
import {
  createLoginCredentials,
  createRevokeToken,
  logoutEnum,
} from "../../utils/security/token.security";
import { UpdateQuery } from "mongoose";
import { HUserDoucment, IUser, UserModel } from "../../DB/model/User.model";
import { UserRepository } from "../../DB/repository/userModel.repository";
import { TokenRepository } from "../../DB/repository/token.repository";
import { TokenModel } from "../../DB/model/token.model";
import { JwtPayload } from "jsonwebtoken";

class UserService {
  private userModel = new UserRepository(UserModel);
  private tokenModel = new TokenRepository(TokenModel);
  constructor() {}
  profile = async (req: Request, res: Response): Promise<Response> => {
    return res.json({
      message: "done",
      data: { user: req.user, decoded: req.decoded },
    });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: IlogoutDto = req.body;
    let statusCode: number = 200;
    const update: UpdateQuery<IUser> = {};
    switch (flag) {
      case logoutEnum.all:
        update.changeCredentialsTime = new Date();
        break;

      default:
        await createRevokeToken(req.decoded as JwtPayload)
        statusCode = 201;
        break;
    }
    await this.userModel.updateOne({
      filter: { _id: req.decoded?._id },
      update,
    });
    return res.status(statusCode).json({
      message: "done",
      data: { user: req.user, decoded: req.decoded },
    });
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const Credentials = await createLoginCredentials(req.user as HUserDoucment);
            await createRevokeToken(req.decoded as JwtPayload)

    return res.status(201).json({ message: "done", data: { Credentials } });
  };
}
export default new UserService();
