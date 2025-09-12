import { JwtPayload } from "jsonwebtoken";
import { HUserDoucment } from "../DB/model/User.model";

declare module "express-serve-static-core" {
  interface Request {
    user?: HUserDoucment;
    decoded: JwtPayload;
  }
}
