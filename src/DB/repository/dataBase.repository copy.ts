import { CreateOptions, HydratedDocument, Model } from "mongoose";

export class DataBaseRepository<TDocument>{

constructor(protected readonly model:Model<TDocument>){}

async create ({
data,options}:{data:Partial<TDocument>[];options:CreateOptions;}):Promise<HydratedDocument<TDocument>[]>{
return await this.model.create(data,options)

}
}