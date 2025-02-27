"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner"); // For generating signed URLs
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = __importDefault(require("./models/userModel"));
dotenv_1.default.config();
// Configure AWS S3 Client
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
class S3Service {
    constructor() {
        this.bucketName = process.env.S3_BUCKET_NAME;
    }
    // Generate a Signed Upload URL (PUT)
    generateUploadURL(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const Key = `my-user-profile-photos/${(0, uuid_1.v4)()}.jpg`; // Use backticks
            // Unique file name
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: Key,
                ContentType: "image/jpeg",
            });
            try {
                const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 60 });
                const user = yield userModel_1.default.findByIdAndUpdate(userId, { profilePhoto: Key }, { new: true });
                return { url, Key };
            }
            catch (error) {
                console.error("Error generating upload URL:", error);
                throw error;
            }
        });
    }
    // Generate a Signed Download URL (GET)
    generateDownloadURL(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            try {
                const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 60 });
                return url;
            }
            catch (error) {
                console.error("Error generating download URL:", error);
                throw error;
            }
        });
    }
}
exports.S3Service = S3Service;
