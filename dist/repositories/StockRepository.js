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
exports.StockRepository = void 0;
const stockModel_1 = __importDefault(require("../models/stockModel"));
class StockRepository {
    constructor() {
        this.model = stockModel_1.default;
    }
    getAllStocks() {
        return __awaiter(this, void 0, void 0, function* () {
            const stocks = yield stockModel_1.default.aggregate([
                {
                    $sort: { timestamp: -1 },
                },
                {
                    $group: {
                        _id: "$symbol",
                        originalId: { $first: "$_id" },
                        symbol: { $first: "$symbol" },
                        timestamp: { $first: "$timestamp" },
                        open: { $first: "$open" },
                        high: { $first: "$high" },
                        low: { $first: "$low" },
                        close: { $first: "$close" },
                        volume: { $first: "$volume" },
                        price: { $first: "$price" },
                        change: { $first: "$change" },
                        changePercent: { $first: "$changePercent" },
                        latestTradingDay: { $first: "$latestTradingDay" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        originalId: 1,
                        symbol: 1,
                        timestamp: 1,
                        open: 1,
                        high: 1,
                        low: 1,
                        close: 1,
                        volume: 1,
                        price: 1,
                        change: 1,
                        changePercent: 1,
                        latestTradingDay: 1,
                    },
                },
            ]);
            return stocks;
        });
    }
    // Create a new stock
    createStock(stockData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.create(stockData);
        });
    }
    // Fetch a single stock by ID
    getStockById(stockId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stock = yield this.model.findById(stockId);
            return stock;
        });
    }
    // Update a stock by ID
    updateStock(stockId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(stockId, updatedData, {
                new: true,
            });
        });
    }
    // Delete a stock by ID
    deleteStock(stockId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.findByIdAndDelete(stockId);
        });
    }
    getMarketPrice(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const stockData = yield this.model
                .findOne({ symbol })
                .select({ timeStamp: -1 })
                .exec();
            return stockData ? stockData.price : null;
        });
    }
    getStockData(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const stockData = yield this.model
                .find({ symbol })
                .sort({ timestamp: 1 })
                .limit(10);
            console.log(stockData);
            return stockData;
        });
    }
    searchStocks(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = {};
            // Add filters based on the query object
            if (query.symbol) {
                filters.symbol = { $regex: query.symbol, $options: "i" };
            }
            if (query.timestamp) {
                filters.timestamp = query.timestamp;
            }
            if (query.price) {
                filters.price = query.price;
            }
            if (query.change) {
                filters.change = query.change;
            }
            const stocks = yield this.model.aggregate([
                { $match: filters },
                {
                    $sort: { timestamp: -1 },
                },
                {
                    $group: {
                        _id: "$symbol",
                        latestStock: { $first: "$$ROOT" },
                    },
                },
                {
                    $replaceRoot: { newRoot: "$latestStock" },
                },
            ]);
            return stocks;
        });
    }
}
exports.StockRepository = StockRepository;
