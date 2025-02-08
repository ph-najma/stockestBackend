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
exports.videosessionRepository = void 0;
const videocall_1 = __importDefault(require("../models/videocall"));
class videosessionRepository {
    createSession(InstructorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionId = Math.random().toString(36).substring(2, 10);
            const newSession = new videocall_1.default({
                sessionId,
                instructorId: InstructorId,
            });
            console.log(newSession);
            yield newSession.save();
            console.log(sessionId);
            return sessionId;
        });
    }
    joinSession(student, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield videocall_1.default.findOne({ sessionId });
            if (!session) {
                return "session not found";
            }
            session.studentId = student;
            yield session.save();
            return "joined session";
        });
    }
}
exports.videosessionRepository = videosessionRepository;
