"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const passport_1 = __importDefault(require("./passport"));
class AuthController {
    googleAuth(req, res, next) {
        passport_1.default.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    }
    googleCallback(req, res, next) {
        passport_1.default.authenticate("google", {
            failureRedirect: "/",
            successRedirect: "/home",
        })(req, res, next);
    }
    logout(req, res) {
        req.logout(() => {
            res.redirect("/");
        });
    }
}
exports.AuthController = AuthController;
