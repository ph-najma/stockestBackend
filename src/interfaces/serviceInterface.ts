import {
  IOrder,
  IUser,
  ISession,
  ISignupBonus,
  ILimit,
  IStock,
  IWatchlist,
  ITransaction,
} from "./modelInterface";
import { ILimitOrderQuery } from "./Interfaces";
import mongoose from "mongoose";
type ObjectId = mongoose.Types.ObjectId;
export interface IUserService {
  signup(
    name: string,
    email: string,
    password: string,
    role: string,
    referralCode?: string
  ): Promise<void>;
  verifyOtp(otp: string): Promise<{ token: string }>;
  resendOtp(email: string): Promise<string>;
  login(
    email: string,
    password: string
  ): Promise<{ token: string; refreshToken: string; user: IUser }>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(email: string, otp: string, newPassword: string): Promise<void>;
  home(): Promise<void>;
  getUserProfile(userId: string | undefined): Promise<IUser | null>;
  getUserPortfolio(userId: string | undefined): Promise<IUser | null>;
  getAllStocks(): Promise<IStock[]>;
  getStockById(userId: string | undefined): Promise<IStock | null>;
  placeOrder(
    user: ObjectId | undefined,
    stock: string,
    type: string,
    orderType: string,
    quantity: number,
    price: number,
    stopPrice: number,
    IsIntraday: Boolean | undefined
  ): Promise<IOrder | null>;
  getTransactions(userId: string | undefined): Promise<ITransaction[]>;
  updatePortfolioAfterSell(
    userId: string,
    stockId: string,
    quantityToSell: number
  ): Promise<IUser | null>;
  getMarketPrice(symbol: string): Promise<any>;
  getWatchlist(userId: string | undefined): Promise<any>;
  ensureWatchlistAndAddStock(
    userId: string | undefined,
    stocksymbol: string
  ): Promise<IWatchlist>;
  getStockData(symbol: string | undefined): Promise<any>;
  getReferralCode(userId: string | undefined): Promise<string | undefined>;
  getOrders(
    userId: string | undefined,
    skip: number,
    limit: number
  ): Promise<IOrder[] | null>;
  getUserProfileWithRewards(userId: string | undefined): Promise<IUser | null>;
  getTradeDiary(userId: string | undefined): Promise<any>;
  getActiveSessions(): Promise<ISession[] | null>;
  getAssignedSession(
    instructorId: string | undefined
  ): Promise<ISession[] | null>;
  getPurchased(userId: string | undefined): Promise<ISession[] | null>;
  getBySearch(query: Partial<IStock>): Promise<IStock[]>;
  getHistorical(symbol: string | undefined): Promise<any>;
  countOrders(userId: string | undefined): Promise<number>;
  refreshToken(refreshToken: string): Promise<string>;
}
export interface IAdminService {
  loginAdmin(email: string, password: string): Promise<{ token: string }>;
  getUserList(): Promise<IUser[]>;
  toggleUserBlockStatus(
    userId: string,
    token?: string
  ): Promise<{ message: string }>;
  getAllOrders(): Promise<IOrder[]>;
  getLimitOrders(query: ILimitOrderQuery): Promise<IOrder[]>;
  getMarketOrders(query: ILimitOrderQuery): Promise<IOrder[]>;
  getCompletedOrders(): Promise<IOrder[]>;
  getAllStocks(): Promise<IStock[]>;
  getAllTransactions(): Promise<ITransaction[]>;
  getUserPortfolio(userId: string): Promise<{
    user: {
      name: string | undefined;
      email: string | undefined;
      balance: number;
    };
    portfolio: {
      stock: IStock | null;
      quantity: number;
    }[];
  }>;
  getTotalFeesCollected(): Promise<number>;
  cancelOrder(orderId: string): Promise<IOrder | null>;
  updateLimit(limitData: ILimit): Promise<ILimit | null>;
  getLimits(): Promise<ILimit | null>;
  CreatePromotions(data: any): Promise<any>;
  createSsession(data: ISession): Promise<ISession | null>;
  getAllSessions(): Promise<ISession[] | null>;
  getSessionById(sessionId: string): Promise<ISession | null>;
  updateSessionData(
    sessionId: string,
    data: Partial<ISession>
  ): Promise<ISession | null>;
  cancelSession(
    sessionId: string,
    newStatus: "SCHEDULED" | "COMPLETED" | "CANCELED"
  ): Promise<ISession | null>;
  countUsers(): Promise<number>;
}
