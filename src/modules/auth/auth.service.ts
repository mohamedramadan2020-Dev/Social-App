import type { Request, Response } from "express";
import { IsignupBodyInbutsDto } from "./auth.dto";
import { DataBaseRepository } from "../../DB/repository/dataBase.repository";
import { IUser, UserModel } from "../../DB/model/User.model";
import { BadRequestException } from "../../utils/response/error.response";

class AuthenticationService {
  private userModel = new DataBaseRepository<IUser>(UserModel);
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    let { username, email, password }: IsignupBodyInbutsDto = req.body;
    console.log(username, email, password);
    const [user] =
      (await this.userModel.create({
        data: [{ username, email, password }],
        options: { validateBeforeSave: true },
      })) || [];
if (!user){
  throw new BadRequestException("fail to signUp")
}
    return res
      .status(201)
      .json({ message: "user created sucssefuly", data: {user} });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;
    return res.status(200).json({ message: "logedin ✔", data: { email } });
  };
}

export default new AuthenticationService();



 