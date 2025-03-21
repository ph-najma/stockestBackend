"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("./authController");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController();
router.get("/auth/google", authController.googleAuth);
router.get("/auth/google/callback", authController.googleCallback);
router.get("/logout", authController.logout);
exports.default = router;
