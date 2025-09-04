import { z } from "zod";
import { ZodError, ZodType } from "zod";
import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../../utils/response/error.response";
type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, ZodType>>;
type validationErrorType= Array<{
        key: KeyReqType,
        issues:Array<{
message:string,
path:string|number|symbol|undefined
        }>
    }>
export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction): NextFunction => {

    const validationErrors:validationErrorType= [];
    for (const key of Object.keys(schema) as KeyReqType[]) {
      if (!schema[key]) continue;

      const validationResult = schema[key].safeParse(req[key]);
      if (!validationResult.success) {
        const errors = validationResult.error as ZodError;

        validationErrors.push({
          key,
          issues: errors.issues.map((issue) => {
            return { message: issue.message, path: issue.path[0] };
          }),
        });
      }
    }
if(validationErrors.length){

    throw new BadRequestException("validton Error ",{validationErrors})}


    return next() as unknown as NextFunction;
  };
};


export const generalFields={
      username: z.string().min(2).max(20),
      email: z.email(),
      otp:z.string().regex(/^\d{6}$/),
      password: z
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
      confirmPassword: z.string(),
    }