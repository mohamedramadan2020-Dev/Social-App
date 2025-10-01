"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const authentication_middleware_1 = require("../../middleware/authentication.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const validator = __importStar(require("./user.validation"));
const token_security_1 = require("../../utils/security/token.security");
const cloud_multer_1 = require("../../utils/multer/cloud.multer");
const user_authorization_1 = require("./user.authorization");
const router = (0, express_1.Router)();
router.get("/", (0, authentication_middleware_1.authentication)(), user_service_1.default.profile);
router.get("/dashboard", (0, authentication_middleware_1.authorization)(user_authorization_1.endPoint.dashboard), user_service_1.default.dashboard);
router.patch("/:userId/change-role", (0, authentication_middleware_1.authorization)(user_authorization_1.endPoint.dashboard), (0, validation_middleware_1.validation)(validator.changeRole), user_service_1.default.changeRole);
router.delete("{/:userId}/freeze-account", (0, authentication_middleware_1.authentication)(), (0, validation_middleware_1.validation)(validator.freezeAccount), user_service_1.default.freezeAccount);
router.get("{/:userId}/send-friend-request", (0, authentication_middleware_1.authentication)(), (0, validation_middleware_1.validation)(validator.sendFriendRequest), user_service_1.default.sendFriendRequest);
router.get("{/:requestId}/accept-friend-request", (0, authentication_middleware_1.authentication)(), (0, validation_middleware_1.validation)(validator.AcceptFriendRequest), user_service_1.default.acceptFriendRequest);
router.patch("/:userId/restore-account", (0, authentication_middleware_1.authorization)(user_authorization_1.endPoint.restoreAccount), (0, validation_middleware_1.validation)(validator.restoreAccount), user_service_1.default.restoreAccount);
router.patch("/:userId/restore-account", (0, authentication_middleware_1.authorization)(user_authorization_1.endPoint.restoreAccount), (0, validation_middleware_1.validation)(validator.restoreAccount), user_service_1.default.restoreAccount);
router.delete("/:userId", (0, authentication_middleware_1.authorization)(user_authorization_1.endPoint.hardDeleteAccount), (0, validation_middleware_1.validation)(validator.hardDeleteAccount), user_service_1.default.hardDeleteAccount);
router.patch("/profile-image", (0, authentication_middleware_1.authentication)(), user_service_1.default.profileImage);
router.patch("/profile-cover-image", (0, authentication_middleware_1.authentication)(), (0, cloud_multer_1.cloudFileUpload)({
    validation: cloud_multer_1.fileValidation.image,
    storageApproach: cloud_multer_1.StorageEnum.disk,
}).array("images", 2), user_service_1.default.profileCoverImage);
router.patch("/profile-image", (0, authentication_middleware_1.authentication)(), user_service_1.default.profileImage);
router.patch("/update-email", (0, validation_middleware_1.validation)(validator.updateEmail), (0, authentication_middleware_1.authentication)(), user_service_1.default.updateEmail);
router.patch("/confirm-pending-email", (0, authentication_middleware_1.authentication)(), (0, validation_middleware_1.validation)(validator.confirmPendingEmail), user_service_1.default.confirmPendingEmail);
router.patch("/update-user", (0, authentication_middleware_1.authentication)(), (0, validation_middleware_1.validation)(validator.updateBasicInfo), user_service_1.default.updateBasicInfo);
router.post("/logout", (0, authentication_middleware_1.authentication)(), (0, validation_middleware_1.validation)(validator.logout), user_service_1.default.logout);
router.post("/refresh-token", (0, authentication_middleware_1.authentication)(token_security_1.TokenEnum.refresh), user_service_1.default.refreshToken);
router.patch("/update-password", (0, validation_middleware_1.validation)(validator.updatePassword), (0, authentication_middleware_1.authentication)(), user_service_1.default.updatePassword);
exports.default = router;
