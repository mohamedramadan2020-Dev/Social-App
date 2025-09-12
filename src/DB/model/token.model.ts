import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface Itoken {
  jti: string;
  expiresIn: number;
  userId: Types.ObjectId;
}

const tokenSchema = new Schema<Itoken>(
  {
    jti: { type: String, required: true, unique: true },
    expiresIn: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const TokenModel = models.Token || model<Itoken>("token", tokenSchema);
export type HTokenDocument = HydratedDocument<Itoken>;
