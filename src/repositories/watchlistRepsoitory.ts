import mongoose from "mongoose";
import Watchlist from "../models/watchlistModel";
import { IWatchlist } from "../interfaces/Interfaces";
import Stock from "../models/stockModel";
import { IWatchlistRepository } from "../interfaces/Interfaces";
export class watchlistRepostory implements IWatchlistRepository {
  async getByUserId(userId: string | undefined): Promise<any> {
    if (!userId) {
      console.error("User ID is undefined");
      return null;
    }

    // Fetch the watchlist
    const watchlist = await Watchlist.findOne({ user: userId });
    if (!watchlist) {
      return null;
    }

    // Fetch the latest stock information for each unique symbol
    const uniqueStockSymbols = [
      ...new Set(watchlist.stocks.map((stock) => stock.symbol)),
    ];
    const stockDataPromises = uniqueStockSymbols.map((symbol) =>
      Stock.findOne({ symbol })
        .sort({ timestamp: -1 }) // Get the most recent entry based on the timestamp
        .select("symbol price change volume timestamp") // Select relevant fields
        .lean()
    );

    const stockData = await Promise.all(stockDataPromises);

    // Add the stock data back to the watchlist object
    const enrichedWatchlist = {
      ...watchlist.toObject(),
      stocks: stockData.filter((data) => data),
    };

    return enrichedWatchlist;
  }

  async ensureWatchlistAndAddStock(
    userId: string | undefined,
    stockSymbol: string
  ): Promise<IWatchlist> {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    // Find the user's watchlist
    let watchlist = await Watchlist.findOne({ user: userId });

    if (watchlist) {
      // Check if the stock is already in the watchlist
      const stockExists = watchlist.stocks.some(
        (stock) => stock.symbol === stockSymbol
      );

      // If the stock is not in the watchlist, add it
      if (!stockExists) {
        watchlist.stocks.push({ symbol: stockSymbol, addedAt: new Date() });
        await watchlist.save();
      }
    } else {
      watchlist = new Watchlist({
        user: userId,
        stocks: [{ symbol: stockSymbol, addedAt: new Date() }],
      });
      await watchlist.save();
    }

    return watchlist;
  }
}
