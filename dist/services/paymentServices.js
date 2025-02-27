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
exports.PaymentService = void 0;
class PaymentService {
    constructor(paymentRepository, userRepository, sessionRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
    }
    createOrder(userId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (amount <= 0) {
                throw new Error("Amount must be greater than zero");
            }
            return this.paymentRepository.createOrder(amount);
        });
    }
    verifyPayment(userId, orderId, paymentId, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("helo from payment service", userId);
            const isVerified = this.paymentRepository.verifyPaymentSignature(orderId, paymentId, signature);
            const amount = 100;
            const updatedUser = yield this.userRepository.updateUserBalance(userId, amount);
            if (!updatedUser) {
                console.log("not updated");
                throw new Error("Failed to update user balance");
            }
            return true;
        });
    }
    updateSession(sessionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateddata = yield this.sessionRepository.assignStudent(sessionId, userId);
            return updateddata;
        });
    }
}
exports.PaymentService = PaymentService;
