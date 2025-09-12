import { CreateOptions,  Model } from "mongoose";
import { IUser } from "../model/User.model";
import { DataBaseRepository } from "./dataBase.repository";
import { HydratedDocument } from "mongoose";
import { BadRequestException } from "../../utils/response/error.response";


export class UserRepository extends DataBaseRepository<IUser>{

    constructor(protected  override readonly model:Model<IUser>){
    super(model)}


 async createUser({
    data,
    options
}:
{
    data: Partial<IUser>[];options:CreateOptions
}):Promise<HydratedDocument<IUser>>{
   const [user]= (await this.create({data,options}))||[]

if(!user){
    throw new BadRequestException("user not created")
}
    return user
}
} 

