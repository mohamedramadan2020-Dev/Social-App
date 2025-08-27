import type { Request, Response } from "express";
import { IsignupBodyInbutsDto } from "./auth.dto";


class AuthenticationService {
  constructor() {}

  signup(req: Request, res: Response): Response {
    let { username, email, password }: IsignupBodyInbutsDto = req.body;
    console.log(username, email, password);

    return res
      .status(201)
      .json({ message: "user created sucssefuly", data: req.body });
  }





  
  login(req: Request, res: Response): Response {
    const { email } = req.body;
    return res.status(200).json({ message: "logedin ✔", data: { email } });
  }
}
export default new AuthenticationService();
