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
exports.UserController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const stockModel_1 = __importDefault(require("../models/stockModel"));
const generative_ai_1 = require("@google/generative-ai");
const Interfaces_1 = require("../interfaces/Interfaces");
const s3_service_1 = require("../s3.service");
class UserController {
    constructor(userService) {
        this.s3Service = new s3_service_1.S3Service();
        //signup
        this.signup = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, role } = req.body;
            try {
                yield this.userService.signup(name, email, password, role);
                const response = {
                    success: true,
                    message: "OTP sent to email",
                    data: email,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        //verify OTP
        this.verifyOtp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { otp } = req.body;
            try {
                const result = yield this.userService.verifyOtp(otp);
                const response = {
                    success: true,
                    message: "OTP verified",
                    data: result,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        //Resend OTP
        this.resendOtp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                const message = yield this.userService.resendOtp(email);
                const response = {
                    success: true,
                    message: "OTP resended",
                    data: message,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        //Login
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const result = yield this.userService.login(email, password);
                const response = {
                    success: true,
                    message: "Logged In successfully",
                    data: result,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        //Forgot Password
        this.forgotPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                yield this.userService.forgotPassword(email);
                const response = {
                    success: true,
                    message: "OTP sent to email",
                    data: email,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        //Reset Password
        this.resetPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, otp, newPassword } = req.body;
            try {
                yield this.userService.resetPassword(email, otp, newPassword);
                const response = {
                    success: true,
                    message: "Password resetted sucessfully",
                    data: email,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.getStockList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const stocks = yield this.userService.getAllStocks();
                const response = {
                    success: true,
                    message: "Stocklist",
                    data: stocks,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        //User Profile
        this.getUserProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userService.getUserProfile(req.userId);
                const response = {
                    success: true,
                    message: "User profile",
                    data: user,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        //User Portfolio
        this.getUserportfolio = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userService.getUserPortfolio(req.userId);
                if (!user) {
                    res
                        .status(Interfaces_1.HttpStatusCode.NOT_FOUND)
                        .json({ message: "User not found" });
                    return;
                }
                let totalPortfolioValue = 0;
                let overallProfit = 0;
                let todaysProfit = 0;
                const updatedPortfolio = yield Promise.all(user.portfolio.map((item) => __awaiter(this, void 0, void 0, function* () {
                    const stock = yield this.userService.getStockById(item.stockId instanceof mongoose_1.default.Types.ObjectId
                        ? item.stockId.toString()
                        : item.stockId);
                    if (!stock)
                        return item;
                    const stockValue = stock.price * item.quantity;
                    const profit = stockValue - stock.open * item.quantity;
                    const todaysChange = stock.changePercent;
                    totalPortfolioValue += stockValue;
                    overallProfit += profit;
                    todaysProfit += (profit * parseFloat(todaysChange)) / 100;
                    return Object.assign(Object.assign({}, item), { stockData: stock, currentValue: stockValue, overallProfit: profit, todaysProfit });
                })));
                const response = {
                    success: true,
                    message: "User portfolio",
                    data: {
                        portfolio: updatedPortfolio,
                        totalPortfolioValue,
                        overallProfit,
                        todaysProfit,
                    },
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        //placeOrder
        this.placeOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { stock, type, orderType, quantity, price, stopPrice, isIntraday } = req.body;
            const user = req.userId
                ? new mongoose_1.default.Types.ObjectId(req.userId)
                : undefined;
            const order = yield this.userService.placeOrder(user, stock, type, orderType, quantity, price, stopPrice, isIntraday);
            const response = {
                success: true,
                message: "Order placed",
                data: order,
            };
            res.status(Interfaces_1.HttpStatusCode.OK).json(response);
        });
        //Get Watchlist
        this.getWatchlist = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const watchlist = yield this.userService.getWatchlist(userId);
                const response = {
                    success: true,
                    message: "Watchlist",
                    data: watchlist,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        //Transaction
        this.getTransaction = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const transactions = yield this.userService.getTransactions(req.userId);
                const response = {
                    success: true,
                    message: "Transactions details",
                    data: transactions,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.updatePortfolioAfterSell = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, stockId, quantityToSell } = req.body;
                const updatedData = yield this.userService.updatePortfolioAfterSell(userId, stockId, quantityToSell);
                const response = {
                    success: true,
                    message: "Updated Portfolio After sell",
                    data: updatedData,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.ensureWatchlistAndAddStock = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = req.userId;
                const { stocks } = req.body;
                const stockId = (_a = stocks[0]) === null || _a === void 0 ? void 0 : _a.stockId;
                const stock = yield stockModel_1.default.findOne({ symbol: stockId });
                const updatedWathclist = yield this.userService.ensureWatchlistAndAddStock(userId, stockId);
                const response = {
                    success: true,
                    message: "Added stock to watchlist",
                    data: updatedWathclist,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.getStockData = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const symbol = req.query.symbol;
                const updatedSymbol = symbol === null || symbol === void 0 ? void 0 : symbol.toString();
                const stockData = yield this.userService.getStockData(updatedSymbol);
                const response = {
                    success: true,
                    message: "StockData",
                    data: stockData,
                };
                console.log(response);
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.getHistorical = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const symbol = req.query.symbol;
                const updatedSymbol = symbol === null || symbol === void 0 ? void 0 : symbol.toString();
                const stockData = yield this.userService.getHistorical(updatedSymbol);
                const response = {
                    success: true,
                    message: "History stock data",
                    data: stockData,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.getReferralCode = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.userId;
            const referralCode = yield this.userService.getReferralCode(userId);
            const response = {
                success: true,
                message: "Referral code",
                data: referralCode,
            };
            res.status(Interfaces_1.HttpStatusCode.OK).json(response);
        });
        this.getOrders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.userId;
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
            const skip = (page - 1) * limit;
            const totalOrders = yield this.userService.countOrders(userId);
            const orders = yield this.userService.getOrders(userId, skip, limit);
            const response = {
                success: true,
                message: "All Orders",
                data: {
                    orders,
                    totalOrders,
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                },
            };
            res.status(Interfaces_1.HttpStatusCode.OK).json(response);
        });
        this.getPromotions = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.userId;
            const user = yield this.userService.getUserProfileWithRewards(userId);
            const response = {
                success: true,
                message: "Promotions for the user",
                data: user,
            };
            res.status(Interfaces_1.HttpStatusCode.OK).json(response);
        });
        this.getTradeDiary = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const tradeData = yield this.userService.getTradeDiary(userId);
                const response = {
                    success: true,
                    message: "Trade Data",
                    data: tradeData,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.getActiveSessions = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionData = yield this.userService.getActiveSessions();
                const response = {
                    success: true,
                    message: "Active sessions",
                    data: sessionData,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.getPurchased = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const sessionData = yield this.userService.getPurchased(userId);
                const response = {
                    success: true,
                    message: "Purchased sessions",
                    data: sessionData,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.getAssigned = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const intructorId = req.userId;
                const sessionData = yield this.userService.getAssignedSession(intructorId);
                const response = {
                    success: true,
                    message: "Purchased sessions",
                    data: sessionData,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.getBySearch = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { symbol, startDate, endDate, minPrice, maxPrice } = req.query;
                const query = {};
                if (symbol)
                    query.symbol = { $regex: symbol, $options: "i" };
                if (startDate)
                    query.timestamp = { $gte: new Date(startDate) };
                if (endDate)
                    query.timestamp = Object.assign(Object.assign({}, query.timestamp), { $lte: new Date(endDate) });
                if (minPrice)
                    query.price = { $gte: parseFloat(minPrice) };
                if (maxPrice)
                    query.price = Object.assign(Object.assign({}, query.price), { $lte: parseFloat(maxPrice) });
                const stocks = yield this.userService.getBySearch(query);
                const response = {
                    success: true,
                    message: "Searched stocks",
                    data: stocks,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(response);
            }
            catch (error) {
                const response = {
                    success: false,
                    message: error.message,
                    error: error.message,
                };
                res.status(Interfaces_1.HttpStatusCode.BAD_REQUEST).json(response);
            }
        });
        this.generate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { prompt } = req.body;
            if (!prompt) {
                res
                    .status(Interfaces_1.HttpStatusCode.BAD_REQUEST)
                    .json({ error: "Prompt is required." });
            }
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                res
                    .status(Interfaces_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                    .json({ error: "GEMINI_API_KEY is not set." });
            }
            try {
                const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = yield model.generateContent(prompt);
                res.json({ response: result.response.text() });
            }
            catch (error) {
                console.error("Error generating content:", error);
                res.status(500).json({ error: "Failed to generate content." });
            }
        });
        this.refreshToken = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res
                    .status(Interfaces_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                    .json({ error: "Refresh token is required." });
            }
            const newToken = yield this.userService.refreshToken(refreshToken);
            const response = {
                success: true,
                message: "Searched stocks",
                data: newToken,
            };
            res.status(Interfaces_1.HttpStatusCode.OK).json(response);
        });
        this.getUploadURL = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadURL = yield this.s3Service.generateUploadURL();
                res.status(200).json({ uploadURL });
            }
            catch (error) {
                res.status(500).json({ error: "Error generating upload URL" });
            }
        });
        this.userService = userService;
    }
}
exports.UserController = UserController;
