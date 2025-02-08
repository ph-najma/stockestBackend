"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const videosessionSchema = new mongoose_1.default.Schema({
    sessionId: { type: String, required: true },
    instructorId: { type: String, required: true },
    studentId: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const videoSession = mongoose_1.default.model("videoSession", videosessionSchema);
exports.default = videoSession;
