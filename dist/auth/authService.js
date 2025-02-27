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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const authRepository_1 = require("./authRepository");
class AuthService {
    constructor() {
        this.authRepository = new authRepository_1.AuthRepository();
    }
    handleGoogleLogin(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
            if (!email)
                throw new Error("Email not found in Google profile");
            let user = yield this.authRepository.findUserByGoogleId(profile.id);
            if (!user) {
                user = yield this.authRepository.createUser({
                    googleId: profile.id,
                    name: profile.displayName,
                    email,
                    profilePhoto: (_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value,
                });
            }
            return user;
        });
    }
}
exports.AuthService = AuthService;
