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
exports.OrderRepository = void 0;
const Interfaces_1 = require("../interfaces/Interfaces");
const BaseRepository_1 = require("./BaseRepository");
class OrderRepository extends BaseRepository_1.BaseRepository {
    constructor(model) {
        super(model);
    }
    findById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .findById(orderId)
                .populate("user")
                .populate("stock")
                .exec();
        });
    }
    findOrders(UserId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .find({ user: UserId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("stock", "symbol name")
                .exec();
        });
    }
    findCompletedOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .find({ status: Interfaces_1.OrderStatus.COMPLETED })
                .sort({ createdAt: -1 })
                .populate("user")
                .populate("stock")
                .exec();
        });
    }
    findOrdersByType(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .find(query)
                .sort({ createdAt: -1 })
                .populate("user")
                .populate("stock")
                .exec();
        });
    }
    // async createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
    //   return Order.create(orderData);
    // }
    getAllOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .find()
                .sort({ createdAt: -1 })
                .populate("user")
                .populate("stock")
                .exec();
        });
    }
    cancelOrder(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedOrder = yield this.model
                .findByIdAndUpdate(orderId, { status: Interfaces_1.OrderStatus.FAILED }, { new: true })
                .exec();
            return updatedOrder;
        });
    }
    countOrdersByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.countDocuments({ user: userId }).exec();
        });
    }
}
exports.OrderRepository = OrderRepository;
