import { connect } from "mongoose";
import { UserModel } from "./model/User.model";
const conectDb = async ():Promise<void>=> {
  try {
    const result = await connect(process.env.DB_URI as string, {
      serverSelectionTimeoutMS: 30000,
    
    });
    await UserModel.syncIndexes()
    console.log(result.models);
    
    console.log("db conected successfully 🚀");
  } catch (error) {
    console.log("failed to conect to DB ❌");
  }
};
export default conectDb;
