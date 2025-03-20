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
exports.UserRepository = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const BaseRepository_1 = require("./BaseRepository");
class UserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(userModel_1.default); // Pass the User model to the base repository
    }
    // Find user by email
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.findOne({ email });
        });
    }
    // Find user by OTP
    findByOtp(otp) {
        return __awaiter(this, void 0, void 0, function* () {
            return userModel_1.default.findOne({ otp });
        });
    }
    //Find by ID
    findById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.findById(userId).populate({
                path: "portfolio.stockId",
                model: "Stock",
            });
        });
    }
    // Save a new user
    save(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(userData);
            const user = new userModel_1.default(userData);
            return user.save();
        });
    }
    // Update user data
    updateById(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return userModel_1.default.findByIdAndUpdate(userId, updateData, { new: true });
        });
    }
    // Update user password
    updatePassword(email, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findOne({ email });
            if (user) {
                user.password = newPassword;
                yield user.save();
            }
        });
    }
    // Find or create Google user
    findOrCreateGoogleUser(googleId, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield userModel_1.default.findOne({ googleId });
            if (!user) {
                user = new userModel_1.default(userData);
                yield user.save();
            }
            return user;
        });
    }
    //Find an admin by email
    findAdminByEmail(email) {
        const _super = Object.create(null, {
            findOne: { get: () => super.findOne }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.findOne.call(this, { email, is_Admin: true });
        });
    }
    //Find all users
    findAllUsers() {
        const _super = Object.create(null, {
            findAll: { get: () => super.findAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.findAll.call(this, { is_Admin: false });
        });
    }
    //Save a user
    saveUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return user.save();
        });
    }
    // Fetch user by ID
    // async updatePortfolio(
    //   userId: string,
    //   portfolioData: { stockId: string; quantity: number }
    // ): Promise<IUser | null> {
    //   return await this.model.findByIdAndUpdate(
    //     userId,
    //     { $push: { portfolio: portfolioData } },
    //     { new: true }
    //   );
    // }
    // Fetch user balance
    getUserBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.model.findById(userId);
            return (user === null || user === void 0 ? void 0 : user.balance) || null;
        });
    }
    // Update user balance
    updateUserBalance(userId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(userId, { $inc: { balance: amount } }, { new: true });
        });
    }
    addSignupBonus(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            if (type == "signup") {
                user.isEligibleForSignupBonus = true;
            }
            else {
                user.isEligibleForReferralBonus = true;
            }
            yield user.save();
            return user;
        });
    }
    updatePortfolioAfterSell(userId, stockId, quantityToSell) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.model.findById(userId);
            if (!user)
                throw new Error("User not found");
            // Check if the stock exists in the portfolio
            const stockIdObject = new mongoose_1.default.Types.ObjectId(stockId);
            const stockIndex = user.portfolio.findIndex((item) => item.stockId.toString() === stockIdObject.toString());
            if (stockIndex === -1) {
                throw new Error("Stock not found in portfolio");
            }
            const stockInPortfolio = user.portfolio[stockIndex];
            if (stockInPortfolio.quantity < quantityToSell) {
                throw new Error("Not enough stock to sell");
            }
            if (stockInPortfolio.quantity === quantityToSell) {
                user.portfolio.splice(stockIndex, 1);
            }
            else {
                stockInPortfolio.quantity -= quantityToSell;
            }
            return yield user.save();
        });
    }
    findByRefferalCode(refferalcode) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.findOne({ referralCode: refferalcode });
        });
    }
    getPromotions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModel_1.default.findById(userId).exec();
            return user;
        });
    }
    countUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.countDocuments({ is_Admin: false }).exec();
        });
    }
}
exports.UserRepository = UserRepository;
