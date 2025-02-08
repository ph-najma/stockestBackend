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
exports.sessionRepository = void 0;
const sessionModel_1 = __importDefault(require("../models/sessionModel"));
class sessionRepository {
    createSession(sessionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newSession = new sessionModel_1.default(sessionData);
                const savedSession = yield newSession.save();
                return savedSession;
            }
            catch (error) {
                throw new Error("Error creating session: " + error.message);
            }
        });
    }
    // Get session by ID
    getSessionById(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const foundSession = yield sessionModel_1.default.findById(sessionId).exec();
                if (!foundSession) {
                    throw new Error("Session not found");
                }
                return foundSession;
            }
            catch (error) {
                throw new Error("Error retrieving session: " + error.message);
            }
        });
    }
    // Update session by ID
    updateSession(sessionId, sessionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedSession = yield sessionModel_1.default
                    .findByIdAndUpdate(sessionId, sessionData, { new: true })
                    .exec();
                if (!updatedSession) {
                    throw new Error("Session not found");
                }
                return updatedSession;
            }
            catch (error) {
                throw new Error("Error updating session: " + error.message);
            }
        });
    }
    assignStudent(sessionId, student_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedSession = yield sessionModel_1.default.findByIdAndUpdate(sessionId, // Assuming course_id matches the session _id
                { student_id: student_id }, { new: true });
                return updatedSession;
            }
            catch (error) {
                throw new Error("Error updating session: " + error.message);
            }
        });
    }
    // Get all sessions
    getAllSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield sessionModel_1.default.find().exec();
            }
            catch (error) {
                throw new Error("Error retrieving sessions: " + error.message);
            }
        });
    }
    getPurchased(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield sessionModel_1.default.find({ student_id: userId }).exec();
            }
            catch (error) {
                throw new Error("Error retrieving sessions: " + error.message);
            }
        });
    }
    getActiveSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield sessionModel_1.default.find({ status: "SCHEDULED" }).exec();
            }
            catch (error) {
                throw new Error("Error retrieving sessions: " + error.message);
            }
        });
    }
    updateSessionStatus(sessionId, newStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find the session by ID and update the status
                const updatedSession = yield sessionModel_1.default
                    .findByIdAndUpdate(sessionId, { status: newStatus, updated_at: new Date() }, // Update status and timestamp
                { new: true } // Return the updated session
                )
                    .exec();
                if (!updatedSession) {
                    throw new Error("Session not found");
                }
                return updatedSession;
            }
            catch (error) {
                throw new Error("Error updating session status: " + error.message);
            }
        });
    }
    getAssigned(Instructoremail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionData = yield sessionModel_1.default.find({
                    instructor_email: Instructoremail,
                });
                console.log(sessionData);
                return sessionData;
            }
            catch (error) {
                throw new Error("Error finding sessions " + error.message);
            }
        });
    }
}
exports.sessionRepository = sessionRepository;
