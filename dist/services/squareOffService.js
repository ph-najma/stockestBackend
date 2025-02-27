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
exports.SquareOffService = void 0;
const orderModel_1 = __importDefault(require("../models/orderModel"));
const stockModel_1 = __importDefault(require("../models/stockModel"));
class SquareOffService {
    constructor(orderModel = orderModel_1.default, stockModel = stockModel_1.default) {
        this.orderModel = orderModel;
        this.stockModel = stockModel;
    }
    autoSquareOff() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentTime = new Date();
                const squareOffTime = new Date();
                squareOffTime.setHours(15, 15, 0, 0);
                if (currentTime < squareOffTime) {
                    console.log("Square-off time not reached yet.");
                    return;
                }
                const intradayOrders = yield this.orderModel
                    .find({ isIntraday: true, status: "PENDING" })
                    .populate("stock");
                if (intradayOrders.length === 0) {
                    console.log("No pending intraday orders for square-off.");
                    return;
                }
                const squareOffPromises = intradayOrders.map((order) => __awaiter(this, void 0, void 0, function* () {
                    const squareOffType = order.type === "BUY" ? "SELL" : "BUY";
                    const stock = yield this.stockModel.findById(order.stock);
                    if (!stock) {
                        console.error(`Stock not found for ID: ${order.stock}`);
                        return;
                    }
                    // Create and save square-off order
                    const squareOffOrder = new this.orderModel({
                        user: order.user,
                        stock: order.stock,
                        type: squareOffType,
                        orderType: "MARKET",
                        quantity: order.quantity,
                        price: stock.price,
                        status: "COMPLETED",
                        isIntraday: true,
                    });
                    yield squareOffOrder.save();
                    // Mark original order as completed
                    order.status = "COMPLETED";
                    order.completedAt = new Date();
                    yield order.save();
                    console.log(`Order ${order._id} squared off successfully.`);
                }));
                yield Promise.all(squareOffPromises);
                console.log("All intraday orders squared off.");
            }
            catch (error) {
                console.error("Error during auto square-off:", error);
            }
        });
    }
}
exports.SquareOffService = SquareOffService;
