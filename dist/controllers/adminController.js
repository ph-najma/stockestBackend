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
exports.AdminController = void 0;
const orderModel_1 = __importDefault(require("../models/orderModel"));
const transactionModel_1 = __importDefault(require("../models/transactionModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const Interfaces_1 = require("../interfaces/Interfaces");
class AdminController {
    constructor(adminService) {
        // Admin Login
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { token } = yield this.adminService.loginAdmin(email, password);
                const response = {
                    success: true,
                    message: "User logged in successfully",
                    data: { token },
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
        // Get User List
        this.getUserList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const usersData = yield this.adminService.getUserList();
                const page = parseInt(req.query.page, 10) || 1;
                const limit = parseInt(req.query.limit, 10) || 10;
                const skip = (page - 1) * limit;
                const totalUsers = yield this.adminService.countUsers();
                const response = {
                    success: true,
                    message: "Users retrieved successfully",
                    data: {
                        usersData,
                        totalUsers,
                        currentPage: page,
                        totalPages: Math.ceil(totalUsers / limit),
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
        // Disable User
        this.disableUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = req.params.id;
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
                const result = yield this.adminService.toggleUserBlockStatus(userId, token);
                const response = {
                    success: true,
                    message: "User Toggled successfully",
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
        // Get Stock List
        this.getStockList = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const stocks = yield this.adminService.getAllStocks();
                const response = {
                    success: true,
                    message: "Stock list",
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
        // Get All Orders
        this.getAllOrders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield this.adminService.getAllOrders();
                const response = {
                    success: true,
                    message: "All Orders",
                    data: orders,
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
        // Get Limit Orders
        this.getLimitOrders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, user, dateRange } = req.query;
                const query = { orderType: "LIMIT" };
                if (typeof status === "string" && status !== "all") {
                    query.status = status;
                }
                if (user) {
                    const userQuery = Array.isArray(user) ? user.join(" ") : user;
                    if (typeof userQuery === "string") {
                        query.user = { $regex: new RegExp(userQuery, "i") };
                    }
                }
                if (dateRange) {
                    const date = new Date(dateRange);
                    query.createdAt = {
                        $gte: new Date(date.setHours(0, 0, 0, 0)),
                        $lte: new Date(date.setHours(23, 59, 59, 999)),
                    };
                }
                const orders = yield this.adminService.getLimitOrders(query);
                const response = {
                    success: true,
                    message: "Limit Orders",
                    data: orders,
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
        // Get Market Orders
        this.getMarketOrders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, user, dateRange } = req.query;
                const query = { orderType: "MARKET" };
                if (typeof status === "string" && status !== "all") {
                    query.status = status;
                }
                if (user) {
                    const userQuery = Array.isArray(user) ? user.join(" ") : user;
                    if (typeof userQuery === "string") {
                        query.user = { $regex: new RegExp(userQuery, "i") };
                    }
                }
                if (dateRange) {
                    const date = new Date(dateRange);
                    query.createdAt = {
                        $gte: new Date(date.setHours(0, 0, 0, 0)),
                        $lte: new Date(date.setHours(23, 59, 59, 999)),
                    };
                }
                const orders = yield this.adminService.getMarketOrders(query);
                const response = {
                    success: true,
                    message: "Market orders",
                    data: orders,
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
        // Matched Orders
        this.getMatchedOrders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield orderModel_1.default.find({ status: "COMPLETED" })
                    .populate("user", "name")
                    .populate("stock", "symbol")
                    .exec();
                const response = {
                    success: true,
                    message: "Matched Orders",
                    data: orders,
                };
                res.status(Interfaces_1.HttpStatusCode.OK).json(orders);
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
        // Get Order Details
        this.getOrderDetails = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = req.params.orderId;
                const order = yield orderModel_1.default.findById(orderId)
                    .populate("user")
                    .populate("stock")
                    .exec();
                const transactions = yield transactionModel_1.default
                    .find({ $or: [{ buyOrder: orderId }, { sellOrder: orderId }] })
                    .populate("buyer seller")
                    .populate("stock")
                    .exec();
                if (!order) {
                    res
                        .status(Interfaces_1.HttpStatusCode.NOT_FOUND)
                        .json({ message: "Order not found" });
                }
                else {
                    const response = {
                        success: true,
                        message: "Order Details",
                        data: { order, transactions },
                    };
                    res.status(Interfaces_1.HttpStatusCode.OK).json(response);
                }
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
        this.getAllTransactions = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const transactions = yield this.adminService.getAllTransactions();
                const response = {
                    success: true,
                    message: "All Transactions",
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
        this.getUserPortfolio = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    res.status(400).json({ message: "Invalid User ID format" });
                }
                const portfolio = yield this.adminService.getUserPortfolio(userId);
                const response = {
                    success: true,
                    message: "User Portfolio details",
                    data: portfolio,
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
        this.getTotalFeesCollected = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const fees = yield this.adminService.getTotalFeesCollected();
                const response = {
                    success: true,
                    message: "Total fees Collected",
                    data: fees,
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
        this.cancelOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const orderId = req.params.orderId;
                const updatedOrder = yield this.adminService.cancelOrder(orderId);
                const response = {
                    success: true,
                    message: "Order status updated to FAILED successfully",
                    data: updatedOrder,
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
        this.updateLimit = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const limitData = req.body;
                const updatedLimit = yield this.adminService.updateLimit(limitData);
                const response = {
                    success: true,
                    message: "Updated limit",
                    data: updatedLimit,
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
        this.getLimits = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const limits = yield this.adminService.getLimits();
                const response = {
                    success: true,
                    message: "Current liits",
                    data: limits,
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
        this.CreatePromotions = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const promotions = yield this.adminService.CreatePromotions(req.body);
                const response = {
                    success: true,
                    message: "Promotion created successfully",
                    data: promotions,
                };
                res.status(Interfaces_1.HttpStatusCode.CREATED).json(response);
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
        this.createSession = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield this.adminService.createSsession(req.body);
                const response = {
                    success: true,
                    message: "Session created successfully",
                    data: session,
                };
                res.status(Interfaces_1.HttpStatusCode.CREATED).json(response);
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
        this.getAllSessions = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sessions = yield this.adminService.getAllSessions();
                const response = {
                    success: true,
                    message: "Session got successfully",
                    data: sessions,
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
        this.getSessionById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionId = req.params.sessionId;
                const session = yield this.adminService.getSessionById(sessionId);
                const response = {
                    success: true,
                    message: "Session got successfully",
                    data: session,
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
        this.updateSessionData = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionId = req.params.sessionId;
                const updatedSession = yield this.adminService.updateSessionData(sessionId, req.body);
                const response = {
                    success: true,
                    message: "Session updated successfully",
                    data: updatedSession,
                };
                res.status(Interfaces_1.HttpStatusCode.CREATED).json(updatedSession);
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
        this.cancelSession = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sessionId = req.params.id;
                const { status } = req.body;
                const updatedSession = yield this.adminService.cancelSession(sessionId, status);
                const response = {
                    success: true,
                    message: "Session cancelled successfully",
                    data: updatedSession,
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
        this.adminService = adminService;
    }
}
exports.AdminController = AdminController;
