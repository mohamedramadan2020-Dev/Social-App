import { resolve } from "node:path";
import { config } from "dotenv";
config({ path: resolve("./config/.env.development") });
import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authController from "./modules/auth/auth.controller";
import userController from"./modules/user/user.controller"
import { globalErrorHandling } from "./utils/response/error.response";
import conectDb from "./DB/connection.db";

const limiter = rateLimit({
  windowMs: 60 * 60000,
  limit: 2000,
  message: { error: "to many reqeuests" },
  statusCode: 429,
});


//start-app
const bootStrap = async():Promise<void> => {
  const app: Express = express();
  const port: number | string = process.env.PORT || 5000;
  app.use(cors(), express.json(), helmet(), limiter);


  //app-routing
  app.get("/", (req: Request, res: Response) => {
    res.json({
      message: `hello pro at my ${process.env.APPLICATION_NAME} landing page ❤ `,
    });
  });


  //modules
  app.use("/auth", authController);
  app.use("/user", userController);



  //invalid-routing
  app.use("{/*dummy}", (req: Request, res: Response) => {
    res.status(404).json({ message: "invalid routing" });
  });


  //global-err-handling
  app.use(globalErrorHandling);

  //DB-conection
  await conectDb()

  //run-server
  app.listen(port, () => {
    console.log(`server is runing on port ${port} 🚀`);
  });
};
export default bootStrap;
