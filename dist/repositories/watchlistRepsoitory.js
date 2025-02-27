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
exports.watchlistRepostory = void 0;
const watchlistModel_1 = __importDefault(require("../models/watchlistModel"));
const stockModel_1 = __importDefault(require("../models/stockModel"));
class watchlistRepostory {
    getByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                console.error("User ID is undefined");
                return null;
            }
            // Fetch the watchlist
            const watchlist = yield watchlistModel_1.default.findOne({ user: userId });
            if (!watchlist) {
                return null;
            }
            const uniqueStockSymbols = [
                ...new Set(watchlist.stocks.map((stock) => stock.symbol)),
            ];
            const stockDataPromises = uniqueStockSymbols.map((symbol) => stockModel_1.default.findOne({ symbol })
                .sort({ timestamp: -1 })
                .select("symbol price change volume timestamp")
                .lean());
            const stockData = yield Promise.all(stockDataPromises);
            const enrichedWatchlist = Object.assign(Object.assign({}, watchlist.toObject()), { stocks: stockData.filter((data) => data) });
            return enrichedWatchlist;
        });
    }
    ensureWatchlistAndAddStock(userId, stockSymbol) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new Error("User ID is required.");
            }
            let watchlist = yield watchlistModel_1.default.findOne({ user: userId });
            if (watchlist) {
                const stockExists = watchlist.stocks.some((stock) => stock.symbol === stockSymbol);
                if (!stockExists) {
                    watchlist.stocks.push({ symbol: stockSymbol, addedAt: new Date() });
                    yield watchlist.save();
                }
            }
            else {
                watchlist = new watchlistModel_1.default({
                    user: userId,
                    stocks: [{ symbol: stockSymbol, addedAt: new Date() }],
                });
                yield watchlist.save();
            }
            return watchlist;
        });
    }
}
exports.watchlistRepostory = watchlistRepostory;
