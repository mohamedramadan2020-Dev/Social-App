import { z } from "zod";
import { LogoutEnum } from "../../utils/security/token.security";
import { Types } from "mongoose";
import { generalFields } from "../../middleware/validation.middleware";
import { RoleEnum } from "../../DB/model";

export const logout = {
  body: z.strictObject({
    flag: z.enum(LogoutEnum).default(LogoutEnum.only),
  }),
};

export const freezeAccount = {
  params: z
    .object({
      userId: z.string().optional(),
    })
    .optional()
    .refine(
      (data) => {
        return data?.userId ? Types.ObjectId.isValid(data.userId) : true;
      },
      {
        error: "Invalid ObjectId Format",
        path: ["userId"],
      }
    ),
};

export const restoreAccount = {
  params: z
    .object({
      userId: z.string(),
    })
    .refine(
      (data) => {
        return data?.userId ? Types.ObjectId.isValid(data.userId) : true;
      },
      {
        error: "Invalid ObjectId Format",
        path: ["userId"],
      }
    ),
};

export const updateBasicInfo = {
  body: z
    .strictObject({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
    })
    .refine(
      (data) => {
        return data.firstName && data.lastName && data.phone;
      },
      { error: "Invalid Data" }
    ),
};

export const updatePassword = {
  query: z.object({
    flag: z.enum(LogoutEnum).default(LogoutEnum.only),
  }),
  body: z
    .strictObject({
      password: generalFields.password,
      oldPassword: generalFields.password,
      confirmPassword: generalFields.confirmPassword,
    })
    .refine((data) => data.confirmPassword === data.password, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

export const updateEmail = {
  body: z.strictObject({
    newEmail: generalFields.email,
  }),
};

export const confirmPendingEmail = {
  body: z.strictObject({
    pendingEmail: generalFields.email,
    otp: generalFields.otp,
  }),
};

export const changeRole = {
  params: z.strictObject({
    userId: generalFields.id,
  }),
  body: z.strictObject({
    role: z.enum(RoleEnum),
  }),
};

export const sendFriendRequest = {
  params: changeRole.params,
};

export const AcceptFriendRequest = {
  params: z.strictObject({
    requestId: generalFields.id,
  }),
};

export const hardDeleteAccount = restoreAccount;
