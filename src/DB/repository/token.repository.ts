import { Model } from "mongoose";
import { Itoken as TDocument } from "../model/token.model";
import { DataBaseRepository } from "./dataBase.repository";

export class TokenRepository extends DataBaseRepository<TDocument>{

    constructor(protected override readonly model:Model<TDocument>){
        super(model)
    }
}