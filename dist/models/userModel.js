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
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Define an interface for the User document
// Define the schema
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    is_Blocked: {
        type: Boolean,
        required: true,
        default: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    is_Admin: {
        type: Boolean,
        default: false,
    },
    is_instructor: {
        type: Boolean,
        default: false,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    profilePhoto: {
        type: String,
    },
    portfolio: [
        {
            stockId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Stock" },
            quantity: { type: Number, required: true },
        },
    ],
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    isEligibleForSignupBonus: {
        type: Boolean,
        default: false,
    },
    isEligibleForReferralBonus: {
        type: Boolean,
        default: false,
    },
    isEligibleForLoyaltyRewards: {
        type: Boolean,
        default: false,
    },
    referralCode: { type: String, unique: true },
    referredBy: { type: String },
    referralsCount: { type: Number, default: 0 },
    refreshToken: { type: String },
});
// Pre-save hook to hash the password
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            return next();
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        this.password = yield bcryptjs_1.default.hash(this.password, salt);
        next();
    });
});
// Method to compare passwords
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(password, this.password);
    });
};
// Method to check for  rewards based on promotions
userSchema.methods.checkLoyaltyRewards = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        for (const promotionId of user.promotions) {
            const promotion = yield mongoose_1.default
                .model("Promotion")
                .findById(promotionId);
            if (promotion) {
                if (promotion.signupBonus.enabled && user.isEligibleForSignupBonus) {
                    if (user.balance >= promotion.signupBonus.minimumDepositRequired) {
                        user.balance += promotion.signupBonus.amount;
                        console.log("Signup bonus applied:", user.balance);
                    }
                }
                if (promotion.referralBonus.enabled && user.isEligibleForReferralBonus) {
                    user.balance += 100;
                    console.log("Referral bonus applied:", user.balance);
                }
                if (promotion.loyaltyRewards.enabled) {
                    if (user.balance >= promotion.loyaltyRewards.tradingAmount) {
                        user.balance += promotion.loyaltyRewards.rewardAmount;
                        console.log("Loyalty rewards applied:", user.balance);
                    }
                }
            }
        }
        yield user.save();
    });
};
// Create and export the model
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
